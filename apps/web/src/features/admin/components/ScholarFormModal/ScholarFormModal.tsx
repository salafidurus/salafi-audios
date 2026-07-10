"use client";

import { useReducer, useEffect, useMemo } from "react";
import { Edit2, RotateCcw } from "lucide-react";
import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/components/Button";
import { EditableInput } from "@/shared/components/EditableInput";
import { EditableTextarea } from "@/shared/components/EditableTextarea";
import { FormSection } from "@/features/admin/components/FormSection";
import { Toggle } from "@/shared/components/Toggle";
import { ImageUpload } from "@/shared/components/ImageUpload";
import { useContentTranslations } from "@sd/domain-content";
import type { CreateScholarDto } from "@sd/core-contracts";
import styles from "./scholar-form-modal.module.css";

// Minimal edit data extracted from ScholarListItemDto
export interface ScholarForEdit {
  id: string;
  name: string;
  slug: string;
  bio?: string | null;
  imageUrl?: string | null;
  isKibar?: boolean;
  isFeatured?: boolean;
  isActive?: boolean;
  country?: string | null;
  mainLanguage?: "en" | "ar" | null;
  socialTwitter?: string | null;
  socialTelegram?: string | null;
  socialYoutube?: string | null;
  socialWebsite?: string | null;
}

export interface ScholarFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateScholarDto) => Promise<void>;
  scholar?: ScholarForEdit | null;
}

interface FormState {
  formData: CreateScholarDto;
  originalFormData: CreateScholarDto;
  editingFields: Set<string>;
  translationChanges: Record<string, Record<string, string | null>>;
  saving: boolean;
  error: string | null;
  imageLoading: boolean;
  imageError: boolean;
}

type FormAction =
  | { type: "INIT_FORM"; scholar: ScholarForEdit | null; isNewScholar: boolean }
  | { type: "UPDATE_FORM_FIELD"; field: keyof CreateScholarDto; value: string | boolean }
  | { type: "UPDATE_TRANSLATION"; locale: string; field: string; value: string }
  | { type: "SET_TRANSLATION_CHANGES"; changes: Record<string, Record<string, string | null>> }
  | { type: "TOGGLE_FIELD_EDIT"; fieldName: string }
  | { type: "SET_SAVING"; saving: boolean }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "SET_IMAGE_LOADING"; loading: boolean }
  | { type: "SET_IMAGE_ERROR"; error: boolean }
  | { type: "RESET_STATE" };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "INIT_FORM": {
      const initialData = getInitialFormData(action.scholar);
      return {
        ...state,
        formData: initialData,
        originalFormData: initialData,
        editingFields: new Set(
          action.isNewScholar
            ? [
                "name",
                "slug",
                "bio",
                "imageUrl",
                "country",
                "mainLanguage",
                "socialTwitter",
                "socialTelegram",
                "socialYoutube",
                "socialWebsite",
              ]
            : [],
        ),
      };
    }
    case "UPDATE_FORM_FIELD": {
      return {
        ...state,
        formData: { ...state.formData, [action.field]: action.value },
      };
    }
    case "UPDATE_TRANSLATION":
      return {
        ...state,
        translationChanges: {
          ...state.translationChanges,
          [action.locale]: {
            ...state.translationChanges[action.locale],
            [action.field]: action.value,
          },
        },
      };
    case "SET_TRANSLATION_CHANGES":
      return { ...state, translationChanges: action.changes };
    case "TOGGLE_FIELD_EDIT": {
      const isCurrentlyEditing = state.editingFields.has(action.fieldName);
      const next = new Set(state.editingFields);

      if (isCurrentlyEditing) {
        // Revert value when toggling off
        const originalValue = state.originalFormData[action.fieldName as keyof CreateScholarDto];
        next.delete(action.fieldName);
        return {
          ...state,
          formData: { ...state.formData, [action.fieldName]: originalValue ?? "" },
          editingFields: next,
        };
      }

      next.add(action.fieldName);
      return { ...state, editingFields: next };
    }
    case "SET_SAVING":
      return { ...state, saving: action.saving };
    case "SET_ERROR":
      return { ...state, error: action.error };
    case "SET_IMAGE_LOADING":
      return { ...state, imageLoading: action.loading };
    case "SET_IMAGE_ERROR":
      return { ...state, imageError: action.error };
    case "RESET_STATE":
      return {
        ...state,
        error: null,
        imageLoading: false,
        imageError: false,
      };
    default:
      return state;
  }
}

function getInitialFormData(scholar: ScholarForEdit | null): CreateScholarDto {
  if (scholar) {
    return {
      name: scholar.name,
      slug: scholar.slug,
      bio: scholar.bio ?? "",
      imageUrl: scholar.imageUrl ?? "",
      isKibar: scholar.isKibar ?? false,
      isFeatured: scholar.isFeatured ?? false,
      isActive: scholar.isActive ?? true,
      country: scholar.country ?? "Saudi Arabia",
      mainLanguage: scholar.mainLanguage ?? "ar",
      socialTwitter: scholar.socialTwitter ?? "",
      socialTelegram: scholar.socialTelegram ?? "",
      socialYoutube: scholar.socialYoutube ?? "",
      socialWebsite: scholar.socialWebsite ?? "",
    };
  }
  return {
    name: "",
    slug: "",
    bio: "",
    imageUrl: "",
    isKibar: false,
    isFeatured: false,
    isActive: true,
    country: "Saudi Arabia",
    mainLanguage: "ar",
    socialTwitter: "",
    socialTelegram: "",
    socialYoutube: "",
    socialWebsite: "",
  };
}

export function ScholarFormModal({ isOpen, onClose, onSave, scholar }: ScholarFormModalProps) {
  const isEditing = !!scholar;
  const isNewScholar = !isEditing;

  const initialFormState: FormState = {
    formData: getInitialFormData(scholar ?? null),
    originalFormData: getInitialFormData(scholar ?? null),
    editingFields: new Set(
      isNewScholar
        ? [
            "name",
            "slug",
            "bio",
            "imageUrl",
            "country",
            "mainLanguage",
            "socialTwitter",
            "socialTelegram",
            "socialYoutube",
            "socialWebsite",
          ]
        : [],
    ),
    translationChanges: {},
    saving: false,
    error: null,
    imageLoading: false,
    imageError: false,
  };

  const [state, dispatch] = useReducer(formReducer, initialFormState);
  const { formData, editingFields, translationChanges, saving, error } = state;

  // Fetch translations only when editing
  const { data: translationsResponse } = useContentTranslations(
    isEditing && scholar
      ? { entity: "scholar", scholarId: scholar.id }
      : { entity: "scholar", scholarId: "" },
  );

  const translations = useMemo(
    () => translationsResponse?.translations ?? [],
    [translationsResponse],
  );

  // Sync form data when scholar changes or modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch({ type: "INIT_FORM", scholar: scholar ?? null, isNewScholar });
      dispatch({ type: "SET_IMAGE_ERROR", error: false });
    }
  }, [isOpen, scholar, isNewScholar]);

  // Initialize translation changes when modal opens
  useEffect(() => {
    if (isOpen && isEditing && translations.length > 0) {
      const changes: Record<string, Record<string, string | null>> = {};
      translations.forEach((trans) => {
        changes[trans.locale] = trans.fields;
      });
      dispatch({ type: "SET_TRANSLATION_CHANGES", changes });
    }
  }, [isOpen, isEditing, translations]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      dispatch({ type: "RESET_STATE" });
    }
  }, [isOpen]);

  const toggleFieldEdit = (fieldName: string) => {
    dispatch({ type: "TOGGLE_FIELD_EDIT", fieldName });
  };

  const isFieldEditing = (fieldName: string) => editingFields.has(fieldName);

  // Auto-generate slug from name (for new scholars only)
  const handleNameChange = (value: string) => {
    dispatch({ type: "UPDATE_FORM_FIELD", field: "name", value });
    if (isNewScholar) {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
      dispatch({ type: "UPDATE_FORM_FIELD", field: "slug", value: generatedSlug });
    }
  };

  const handleTranslationNameChange = (locale: string, value: string) => {
    dispatch({ type: "UPDATE_TRANSLATION", locale, field: "name", value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.slug.trim()) {
      dispatch({ type: "SET_ERROR", error: "Name and slug are required" });
      return;
    }

    dispatch({ type: "SET_SAVING", saving: true });
    dispatch({ type: "SET_ERROR", error: null });
    try {
      // Prepare data with translations for single API round trip
      const dataWithTranslations = {
        ...formData,
        translations: isEditing ? translationChanges : undefined,
      };
      await onSave(dataWithTranslations as CreateScholarDto);
      onClose();
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        error: err instanceof Error ? err.message : "Failed to save",
      });
    } finally {
      dispatch({ type: "SET_SAVING", saving: false });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Scholar" : "Add Scholar"}
      size="lg"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={saving} form="scholar-form">
            {isEditing ? "Save Changes" : "Add Scholar"}
          </Button>
        </>
      }
    >
      <form id="scholar-form" onSubmit={handleSubmit} className={styles.form}>
        {error && (
          <div className={styles.error} role="alert" aria-live="polite">
            {error}
          </div>
        )}

        <FormSection title="Basic Information">
          {/* Row 1: Name + Slug */}
          <div className={styles.formRow}>
            <div className={styles.field}>
              <label className={styles.label}>Name *</label>
              <EditableInput
                value={formData.name}
                onChange={handleNameChange}
                placeholder="Scholar name"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Slug *</label>
              <EditableInput
                value={formData.slug}
                onChange={(value) => dispatch({ type: "UPDATE_FORM_FIELD", field: "slug", value })}
                placeholder="scholar-slug"
              />
            </div>
          </div>

          {/* Arabic Name Field */}
          {isEditing && (
            <div className={styles.field}>
              <label className={styles.label}>Arabic Name</label>
              <EditableInput
                value={translationChanges.ar?.name ?? ""}
                onChange={(value) => handleTranslationNameChange("ar", value)}
                placeholder="Scholar name in Arabic"
                disabled={!isFieldEditing("translation-ar-name")}
                rightButton={
                  <button
                    type="button"
                    className={styles.editIconButton}
                    onClick={() => toggleFieldEdit("translation-ar-name")}
                    aria-label={
                      isFieldEditing("translation-ar-name") ? "Cancel edit" : "Edit Arabic name"
                    }
                  >
                    {isFieldEditing("translation-ar-name") ? (
                      <RotateCcw size={16} />
                    ) : (
                      <Edit2 size={16} />
                    )}
                  </button>
                }
              />
              {translations.find((t) => t.locale === "ar") && (
                <div className={styles.translationStatus}>
                  Status:{" "}
                  <span
                    className={`${styles.statusBadge} ${styles[`status-${translations.find((t) => t.locale === "ar")?.status}`]}`}
                  >
                    {translations.find((t) => t.locale === "ar")?.status}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Row 2: Bio (full width) */}
          <div className={`${styles.field} ${styles.fullRow}`}>
            <label className={styles.label}>Bio</label>
            <EditableTextarea
              value={formData.bio ?? ""}
              onChange={(value) => dispatch({ type: "UPDATE_FORM_FIELD", field: "bio", value })}
              placeholder="Brief biography..."
              rows={4}
            />
          </div>

          {/* Row 3: Image Upload (full width) */}
          <div className={`${styles.field} ${styles.fullRow}`}>
            <label className={styles.label}>Scholar Image</label>
            <ImageUpload
              value={formData.imageUrl ?? ""}
              onChange={(url) =>
                dispatch({ type: "UPDATE_FORM_FIELD", field: "imageUrl", value: url })
              }
              onError={(error) => dispatch({ type: "SET_ERROR", error })}
              disabled={saving}
              slug={formData.slug || undefined}
              maxSizeMB={1}
            />
          </div>
        </FormSection>

        <FormSection title="Location & Language">
          <div className={styles.formRow}>
            {/* Country field */}
            <div className={styles.field}>
              <label className={styles.label}>Country</label>
              <select
                className={styles.selectField}
                value={formData.country ?? ""}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_FORM_FIELD",
                    field: "country",
                    value: e.target.value || "",
                  })
                }
              >
                <option value="">-- Select Country --</option>
                <option value="Algeria">Algeria</option>
                <option value="Bahrain">Bahrain</option>
                <option value="Egypt">Egypt</option>
                <option value="Iraq">Iraq</option>
                <option value="Jordan">Jordan</option>
                <option value="Kuwait">Kuwait</option>
                <option value="Lebanon">Lebanon</option>
                <option value="Libya">Libya</option>
                <option value="Morocco">Morocco</option>
                <option value="Oman">Oman</option>
                <option value="Palestine">Palestine</option>
                <option value="Qatar">Qatar</option>
                <option value="Saudi Arabia">Saudi Arabia</option>
                <option value="Sudan">Sudan</option>
                <option value="Syria">Syria</option>
                <option value="Tunisia">Tunisia</option>
                <option value="United Arab Emirates">United Arab Emirates</option>
                <option value="Yemen">Yemen</option>
                <option value="Australia">Australia</option>
                <option value="Canada">Canada</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Main Language field */}
            <div className={styles.field}>
              <label className={styles.label}>Main Language</label>
              <select
                className={styles.selectField}
                value={formData.mainLanguage ?? ""}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_FORM_FIELD",
                    field: "mainLanguage",
                    value: e.target.value ? (e.target.value as "en" | "ar") : "",
                  })
                }
              >
                <option value="">-- Select Language --</option>
                <option value="en">English</option>
                <option value="ar">Arabic (عربي)</option>
              </select>
            </div>
          </div>
        </FormSection>

        <FormSection title="Social Media">
          {/* Row 1: Twitter + Telegram */}
          <div className={styles.formRow}>
            <div className={styles.field}>
              <label className={styles.label}>Twitter</label>
              <EditableInput
                type="url"
                value={formData.socialTwitter ?? ""}
                onChange={(value) =>
                  dispatch({ type: "UPDATE_FORM_FIELD", field: "socialTwitter", value })
                }
                placeholder="https://twitter.com/..."
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Telegram</label>
              <EditableInput
                type="url"
                value={formData.socialTelegram ?? ""}
                onChange={(value) =>
                  dispatch({ type: "UPDATE_FORM_FIELD", field: "socialTelegram", value })
                }
                placeholder="https://t.me/..."
              />
            </div>
          </div>

          {/* Row 2: YouTube + Website */}
          <div className={styles.formRow}>
            <div className={styles.field}>
              <label className={styles.label}>YouTube</label>
              <EditableInput
                type="url"
                value={formData.socialYoutube ?? ""}
                onChange={(value) =>
                  dispatch({ type: "UPDATE_FORM_FIELD", field: "socialYoutube", value })
                }
                placeholder="https://youtube.com/..."
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Website</label>
              <EditableInput
                type="url"
                value={formData.socialWebsite ?? ""}
                onChange={(value) =>
                  dispatch({ type: "UPDATE_FORM_FIELD", field: "socialWebsite", value })
                }
                placeholder="https://..."
              />
            </div>
          </div>
        </FormSection>

        <FormSection title="Settings">
          <div className={styles.toggleGroup}>
            <div className={styles.toggleField}>
              <label className={styles.toggleLabel}>Kibar Scholar</label>
              <Toggle
                checked={formData.isKibar ?? false}
                onChange={(checked) =>
                  dispatch({ type: "UPDATE_FORM_FIELD", field: "isKibar", value: checked })
                }
                disabled={saving}
                aria-label="Kibar Scholar"
              />
            </div>

            <div className={styles.toggleField}>
              <label className={styles.toggleLabel}>Featured</label>
              <Toggle
                checked={formData.isFeatured ?? false}
                onChange={(checked) =>
                  dispatch({ type: "UPDATE_FORM_FIELD", field: "isFeatured", value: checked })
                }
                disabled={saving}
                aria-label="Featured"
              />
            </div>

            <div className={styles.toggleField}>
              <label className={styles.toggleLabel}>Active</label>
              <Toggle
                checked={formData.isActive ?? true}
                onChange={(checked) =>
                  dispatch({ type: "UPDATE_FORM_FIELD", field: "isActive", value: checked })
                }
                disabled={saving}
                aria-label="Active"
              />
            </div>
          </div>
        </FormSection>
      </form>
    </Modal>
  );
}
