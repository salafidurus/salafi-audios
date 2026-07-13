"use client";

import { useReducer, useEffect, useMemo } from "react";
import { Edit2, RotateCcw } from "lucide-react";
import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/components/Button";
import { EditableInput } from "@/shared/components/EditableInput";
import { useContentTranslations } from "@sd/domain-content";
import type { UpsertTopicDto } from "@sd/core-contracts";
import styles from "./topic-form-modal.module.css";

export interface TopicForEdit {
  id: string;
  slug: string;
  name: { en: string; ar?: string };
  parentSlug?: string | null;
}

export interface TopicFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UpsertTopicDto) => Promise<void>;
  topic?: TopicForEdit | null;
}

interface FormState {
  formData: UpsertTopicDto;
  originalFormData: UpsertTopicDto;
  editingFields: Set<string>;
  translationChanges: Record<string, Record<string, string | null>>;
  saving: boolean;
  error: string | null;
}

type FormAction =
  | { type: "INIT_FORM"; topic: TopicForEdit | null; isNewTopic: boolean }
  | { type: "SET_FORM_DATA"; data: UpsertTopicDto }
  | { type: "UPDATE_FORM_FIELD"; field: keyof UpsertTopicDto; value: string }
  | { type: "UPDATE_NAME_AR"; value: string }
  | { type: "UPDATE_TRANSLATION"; locale: string; field: string; value: string }
  | { type: "SET_TRANSLATION_CHANGES"; changes: Record<string, Record<string, string | null>> }
  | { type: "TOGGLE_FIELD_EDIT"; fieldName: string; translations: any[] }
  | { type: "SET_SAVING"; saving: boolean }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "RESET_STATE" };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "INIT_FORM": {
      const initialData = action.topic
        ? {
            name: { en: action.topic.name.en, ar: action.topic.name.ar },
            slug: action.topic.slug,
            parentSlug: action.topic.parentSlug ?? undefined,
          }
        : { name: { en: "" }, slug: "" };
      return {
        ...state,
        formData: initialData,
        originalFormData: initialData,
        editingFields: new Set(action.isNewTopic ? ["name", "slug"] : []),
      };
    }
    case "SET_FORM_DATA":
      return { ...state, formData: action.data };
    case "UPDATE_FORM_FIELD": {
      if (action.field === "name") {
        return {
          ...state,
          formData: {
            ...state.formData,
            name: {
              ...state.formData.name,
              en: action.value,
            },
          },
        };
      }
      return {
        ...state,
        formData: { ...state.formData, [action.field]: action.value },
      };
    }
    case "UPDATE_NAME_AR": {
      return {
        ...state,
        formData: {
          ...state.formData,
          name: { ...state.formData.name, ar: action.value || undefined },
        },
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
        if (action.fieldName === "slug") {
          next.delete(action.fieldName);
          return {
            ...state,
            formData: { ...state.formData, slug: state.originalFormData.slug ?? "" },
            editingFields: next,
          };
        } else if (action.fieldName === "name") {
          next.delete(action.fieldName);
          return {
            ...state,
            formData: { ...state.formData, name: state.originalFormData.name },
            editingFields: next,
          };
        } else if (action.fieldName === "translation-ar-name") {
          const originalArabicName =
            action.translations.find((t) => t.locale === "ar")?.fields.name ?? "";
          next.delete(action.fieldName);
          return {
            ...state,
            translationChanges: {
              ...state.translationChanges,
              ar: { ...state.translationChanges.ar, name: originalArabicName },
            },
            editingFields: next,
          };
        }
      }

      if (next.has(action.fieldName)) {
        next.delete(action.fieldName);
      } else {
        next.add(action.fieldName);
      }
      return { ...state, editingFields: next };
    }
    case "SET_SAVING":
      return { ...state, saving: action.saving };
    case "SET_ERROR":
      return { ...state, error: action.error };
    case "RESET_STATE":
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

function getInitialFormData(topic: TopicForEdit | null): UpsertTopicDto {
  if (topic) {
    return {
      name: {
        en: topic.name.en,
        ar: topic.name.ar,
      },
      slug: topic.slug,
      parentSlug: topic.parentSlug ?? undefined,
    };
  }
  return { name: { en: "" }, slug: "" };
}

export function TopicFormModal({ isOpen, onClose, onSave, topic }: TopicFormModalProps) {
  const isEditing = !!topic;
  const isNewTopic = !isEditing;

  const initialFormState: FormState = {
    formData: getInitialFormData(topic ?? null),
    originalFormData: getInitialFormData(topic ?? null),
    editingFields: new Set(isNewTopic ? ["name", "slug"] : []),
    translationChanges: {},
    saving: false,
    error: null,
  };

  const [state, dispatch] = useReducer(formReducer, initialFormState);
  const { formData, editingFields, translationChanges, saving, error } = state;

  // Fetch translations only when editing
  const { data: translationsResponse } = useContentTranslations(
    isEditing && topic ? { entity: "topic", topicId: topic.id } : { entity: "topic", topicId: "" },
  );

  const translations = useMemo(
    () => translationsResponse?.translations ?? [],
    [translationsResponse],
  );

  // Sync form data when topic changes or modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch({ type: "INIT_FORM", topic: topic ?? null, isNewTopic });
    }
  }, [isOpen, topic, isNewTopic]);

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
    dispatch({ type: "TOGGLE_FIELD_EDIT", fieldName, translations });
  };

  const isFieldEditing = (fieldName: string) => editingFields.has(fieldName);

  // Auto-generate slug from name (for new topics only)
  const handleNameChange = (value: string) => {
    dispatch({ type: "UPDATE_FORM_FIELD", field: "name", value });
    if (isNewTopic) {
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
    if (!formData.name.en.trim() || !formData.slug.trim()) {
      dispatch({ type: "SET_ERROR", error: "Name and slug are required" });
      return;
    }

    dispatch({ type: "SET_SAVING", saving: true });
    dispatch({ type: "SET_ERROR", error: null });
    try {
      // Prepare data with translations for single API round trip
      const dataWithTranslations: UpsertTopicDto = {
        ...formData,
        translations: isEditing ? translationChanges : undefined,
      };
      await onSave(dataWithTranslations);
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
      title={isEditing ? "Edit Topic" : "Add Topic"}
      size="md"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={saving} form="topic-form">
            Done
          </Button>
        </>
      }
    >
      <form id="topic-form" onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}

        {/* Slug Field */}
        <div className={styles.field}>
          {/* react-doctor-disable-next-line react-doctor/label-has-associated-control */}
          <label className={styles.label}>Slug *</label>
          <EditableInput
            value={formData.slug}
            onChange={(value) => dispatch({ type: "UPDATE_FORM_FIELD", field: "slug", value })}
            placeholder="topic-slug"
            disabled={isEditing && !isFieldEditing("slug")}
            rightButton={
              isEditing && (
                <button
                  type="button"
                  className={styles.editIconButton}
                  onClick={() => toggleFieldEdit("slug")}
                  aria-label={isFieldEditing("slug") ? "Cancel edit" : "Edit slug"}
                >
                  {isFieldEditing("slug") ? <RotateCcw size={16} /> : <Edit2 size={16} />}
                </button>
              )
            }
          />
        </div>

        {/* English Name Field */}
        <div className={styles.field}>
          {/* react-doctor-disable-next-line react-doctor/label-has-associated-control */}
          <label className={styles.label}>English Name *</label>
          <EditableInput
            value={formData.name.en}
            onChange={handleNameChange}
            placeholder="Topic name in English"
            disabled={isEditing && !isFieldEditing("name")}
            rightButton={
              isEditing && (
                <button
                  type="button"
                  className={styles.editIconButton}
                  onClick={() => toggleFieldEdit("name")}
                  aria-label={isFieldEditing("name") ? "Cancel edit" : "Edit English name"}
                >
                  {isFieldEditing("name") ? <RotateCcw size={16} /> : <Edit2 size={16} />}
                </button>
              )
            }
          />
        </div>

        {/* Arabic Name Field */}
        {isNewTopic ? (
          <div className={styles.field}>
            {/* react-doctor-disable-next-line react-doctor/label-has-associated-control */}
            <label className={styles.label}>Arabic Name</label>
            <EditableInput
              value={formData.name.ar ?? ""}
              onChange={(value) => dispatch({ type: "UPDATE_NAME_AR", value })}
              placeholder="Topic name in Arabic (optional)"
            />
          </div>
        ) : (
          <div className={styles.field}>
            {/* react-doctor-disable-next-line react-doctor/label-has-associated-control */}
            <label className={styles.label}>Arabic Name</label>
            <EditableInput
              value={translationChanges.ar?.name ?? ""}
              onChange={(value) => handleTranslationNameChange("ar", value)}
              placeholder="Topic name in Arabic"
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
      </form>
    </Modal>
  );
}
