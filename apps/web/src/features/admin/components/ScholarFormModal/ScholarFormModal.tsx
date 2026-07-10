"use client";

import { useReducer, useEffect } from "react";
import Image from "next/image";
import { Edit2, RotateCcw, AlertCircle, Loader } from "lucide-react";
import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/components/Button";
import { EditableInput } from "@/shared/components/EditableInput";
import { EditableTextarea } from "@/shared/components/EditableTextarea";
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from "@/shared/components/Dropdown";
import { FormSection } from "@/features/admin/components/FormSection";
import type { CreateScholarDto } from "@sd/core-contracts";
import { validateLanguageCode, COUNTRY_LIST } from "@/shared/types/form-types";
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
  saving: boolean;
  error: string | null;
  imageLoading: boolean;
  imageError: boolean;
}

type FormAction =
  | { type: "INIT_FORM"; scholar: ScholarForEdit | null; isNewScholar: boolean }
  | { type: "UPDATE_FORM_FIELD"; field: keyof CreateScholarDto; value: string | boolean }
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
      country: scholar.country ?? "",
      mainLanguage: (scholar.mainLanguage ?? "ar") as "en" | "ar",
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
    country: "",
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
    saving: false,
    error: null,
    imageLoading: false,
    imageError: false,
  };

  const [state, dispatch] = useReducer(formReducer, initialFormState);
  const { formData, editingFields, saving, error, imageLoading, imageError } = state;

  // Sync form data when scholar changes or modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch({ type: "INIT_FORM", scholar: scholar ?? null, isNewScholar });
      dispatch({ type: "SET_IMAGE_ERROR", error: false });
    }
  }, [isOpen, scholar, isNewScholar]);

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

  const handleImageUrlChange = (value: string) => {
    dispatch({ type: "UPDATE_FORM_FIELD", field: "imageUrl", value });
    dispatch({ type: "SET_IMAGE_ERROR", error: false });
    dispatch({ type: "SET_IMAGE_LOADING", loading: false });
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
      await onSave(formData);
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

  const getEditButton = (fieldName: string) => {
    if (!isEditing) return null;
    return (
      <button
        type="button"
        className={styles.editIconButton}
        onClick={() => toggleFieldEdit(fieldName)}
        aria-label={isFieldEditing(fieldName) ? "Cancel edit" : "Edit field"}
      >
        {isFieldEditing(fieldName) ? <RotateCcw size={16} /> : <Edit2 size={16} />}
      </button>
    );
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
        {error && <div className={styles.error}>{error}</div>}

        <FormSection title="Basic Information">
          <div className={styles.field}>
            <label className={styles.label}>Name *</label>
            <EditableInput
              value={formData.name}
              onChange={handleNameChange}
              placeholder="Scholar name"
              disabled={isEditing && !isFieldEditing("name")}
              rightButton={getEditButton("name")}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Slug *</label>
            <EditableInput
              value={formData.slug}
              onChange={(value) => dispatch({ type: "UPDATE_FORM_FIELD", field: "slug", value })}
              placeholder="scholar-slug"
              disabled={isEditing && !isFieldEditing("slug")}
              rightButton={getEditButton("slug")}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Bio</label>
            <EditableTextarea
              value={formData.bio ?? ""}
              onChange={(value) => dispatch({ type: "UPDATE_FORM_FIELD", field: "bio", value })}
              placeholder="Brief biography..."
              disabled={isEditing && !isFieldEditing("bio")}
              rows={4}
              rightButton={getEditButton("bio")}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Image URL</label>
            <EditableInput
              type="url"
              value={formData.imageUrl ?? ""}
              onChange={handleImageUrlChange}
              placeholder="https://..."
              disabled={isEditing && !isFieldEditing("imageUrl")}
              rightButton={getEditButton("imageUrl")}
            />
            {formData.imageUrl && (
              <div className={styles.imagePreview}>
                {imageLoading && (
                  <div className={styles.imageLoadingState}>
                    <Loader size={24} className={styles.loadingSpinner} />
                    <span>Loading image...</span>
                  </div>
                )}
                {imageError && (
                  <div className={styles.imageErrorState}>
                    <AlertCircle size={24} />
                    <span>Failed to load image</span>
                  </div>
                )}
                {!imageError && (
                  <Image
                    src={formData.imageUrl}
                    alt="Preview"
                    width={200}
                    height={200}
                    style={{ objectFit: "contain" }}
                    className={styles.previewImage}
                    onLoadingComplete={() =>
                      dispatch({ type: "SET_IMAGE_LOADING", loading: false })
                    }
                    onError={() => {
                      dispatch({ type: "SET_IMAGE_ERROR", error: true });
                      dispatch({ type: "SET_IMAGE_LOADING", loading: false });
                    }}
                    onLoad={() => dispatch({ type: "SET_IMAGE_LOADING", loading: true })}
                  />
                )}
              </div>
            )}
          </div>
        </FormSection>

        <FormSection title="Location & Language">
          <div className={styles.field}>
            <label className={styles.label}>Country</label>
            <Dropdown
              value={formData.country ?? ""}
              onValueChange={(value) =>
                dispatch({ type: "UPDATE_FORM_FIELD", field: "country", value })
              }
              disabled={isEditing && !isFieldEditing("country")}
            >
              <DropdownTrigger placeholder="Select Country" />
              <DropdownContent searchable>
                {COUNTRY_LIST.map((country) => (
                  <DropdownItem key={country.code} value={country.code}>
                    {country.name}
                  </DropdownItem>
                ))}
              </DropdownContent>
            </Dropdown>
            {isEditing && (
              <button
                type="button"
                className={styles.editIconButton}
                onClick={() => toggleFieldEdit("country")}
                aria-label={isFieldEditing("country") ? "Cancel edit" : "Edit field"}
              >
                {isFieldEditing("country") ? <RotateCcw size={16} /> : <Edit2 size={16} />}
              </button>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Main Language</label>
            <Dropdown
              value={formData.mainLanguage}
              onValueChange={(value) =>
                dispatch({
                  type: "UPDATE_FORM_FIELD",
                  field: "mainLanguage",
                  value: validateLanguageCode(value) as any,
                })
              }
            >
              <DropdownTrigger
                placeholder="Select Language"
                disabled={isEditing && !isFieldEditing("mainLanguage")}
              />
              <DropdownContent>
                <DropdownItem value="en">English</DropdownItem>
                <DropdownItem value="ar">Arabic (عربي)</DropdownItem>
              </DropdownContent>
            </Dropdown>
            {isEditing && (
              <button
                type="button"
                className={styles.editIconButton}
                onClick={() => toggleFieldEdit("mainLanguage")}
                aria-label={isFieldEditing("mainLanguage") ? "Cancel edit" : "Edit field"}
              >
                {isFieldEditing("mainLanguage") ? <RotateCcw size={16} /> : <Edit2 size={16} />}
              </button>
            )}
          </div>
        </FormSection>

        <FormSection title="Social Media">
          <div className={styles.field}>
            <label className={styles.label}>Twitter</label>
            <EditableInput
              type="url"
              value={formData.socialTwitter ?? ""}
              onChange={(value) =>
                dispatch({ type: "UPDATE_FORM_FIELD", field: "socialTwitter", value })
              }
              placeholder="https://twitter.com/..."
              disabled={isEditing && !isFieldEditing("socialTwitter")}
              rightButton={getEditButton("socialTwitter")}
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
              disabled={isEditing && !isFieldEditing("socialTelegram")}
              rightButton={getEditButton("socialTelegram")}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>YouTube</label>
            <EditableInput
              type="url"
              value={formData.socialYoutube ?? ""}
              onChange={(value) =>
                dispatch({ type: "UPDATE_FORM_FIELD", field: "socialYoutube", value })
              }
              placeholder="https://youtube.com/..."
              disabled={isEditing && !isFieldEditing("socialYoutube")}
              rightButton={getEditButton("socialYoutube")}
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
              disabled={isEditing && !isFieldEditing("socialWebsite")}
              rightButton={getEditButton("socialWebsite")}
            />
          </div>
        </FormSection>

        <FormSection title="Settings">
          <div className={styles.checkboxGroup}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={formData.isKibar ?? false}
                onChange={(e) =>
                  dispatch({ type: "UPDATE_FORM_FIELD", field: "isKibar", value: e.target.checked })
                }
              />
              <span>Kibar Scholar</span>
            </label>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={formData.isFeatured ?? false}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_FORM_FIELD",
                    field: "isFeatured",
                    value: e.target.checked,
                  })
                }
              />
              <span>Featured</span>
            </label>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={formData.isActive ?? true}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_FORM_FIELD",
                    field: "isActive",
                    value: e.target.checked,
                  })
                }
              />
              <span>Active</span>
            </label>
          </div>
        </FormSection>
      </form>
    </Modal>
  );
}
