"use client";

import { useReducer, useEffect, useMemo } from "react";
import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/components/Button";
import { EditableInput } from "@/shared/components/EditableInput";
import { useContentTranslations } from "@sd/domain-content";
import type { UpsertTopicDto } from "@sd/core-contracts";
import { useTranslation } from "@/core/i18n/use-translation";
import styles from "./topic-modal.module.css";

export interface TopicForEdit {
  id: string;
  slug: string;
  name: { en: string; ar?: string };
}

interface TopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UpsertTopicDto) => Promise<void>;
  topic?: TopicForEdit | null;
}

interface FormState {
  formData: UpsertTopicDto;
  originalFormData: UpsertTopicDto;
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
          }
        : { name: { en: "" }, slug: "" };
      return {
        ...state,
        formData: initialData,
        originalFormData: initialData,
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
    };
  }
  return { name: { en: "" }, slug: "" };
}

export function TopicModal({ isOpen, onClose, onSave, topic }: TopicModalProps) {
  const { t } = useTranslation();
  const isEditing = !!topic;
  const isNewTopic = !isEditing;

  const initialFormState: FormState = {
    formData: getInitialFormData(topic ?? null),
    originalFormData: getInitialFormData(topic ?? null),
    translationChanges: {},
    saving: false,
    error: null,
  };

  const [state, dispatch] = useReducer(formReducer, initialFormState);
  const { formData, translationChanges, saving, error } = state;

  const { data: translationsResponse } = useContentTranslations(
    isEditing && topic ? { entity: "topic", topicId: topic.id } : { entity: "topic", topicId: "" },
  );

  const translations = useMemo(
    () => translationsResponse?.translations ?? [],
    [translationsResponse],
  );

  useEffect(() => {
    if (isOpen) {
      dispatch({ type: "INIT_FORM", topic: topic ?? null, isNewTopic });
    }
  }, [isOpen, topic, isNewTopic]);

  useEffect(() => {
    if (isOpen && isEditing && translations.length > 0) {
      const changes: Record<string, Record<string, string | null>> = {};
      translations.forEach((trans) => {
        changes[trans.locale] = trans.fields;
      });
      dispatch({ type: "SET_TRANSLATION_CHANGES", changes });
    }
  }, [isOpen, isEditing, translations]);

  useEffect(() => {
    if (!isOpen) {
      dispatch({ type: "RESET_STATE" });
    }
  }, [isOpen]);

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
      dispatch({
        type: "SET_ERROR",
        error: t("admin.scholars.nameSlugRequired", "Name and slug are required"),
      });
      return;
    }

    dispatch({ type: "SET_SAVING", saving: true });
    dispatch({ type: "SET_ERROR", error: null });
    try {
      let translations: Record<string, { name?: string }> | undefined;
      if (isEditing) {
        const filtered = Object.fromEntries(
          Object.entries(translationChanges).filter(([, fields]) => fields?.name?.trim()),
        );
        if (Object.keys(filtered).length > 0) {
          translations = filtered as Record<string, { name?: string }>;
        }
      }

      const dataWithTranslations: UpsertTopicDto = {
        ...formData,
        translations,
      };
      await onSave(dataWithTranslations);
      onClose();
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        error:
          err instanceof Error ? err.message : t("admin.contents.failedToSave", "Failed to save"),
      });
    } finally {
      dispatch({ type: "SET_SAVING", saving: false });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEditing
          ? t("admin.contents.editTopic", "Edit Topic")
          : t("admin.contents.addTopic", "Add Topic")
      }
      size="md"
      width="var(--modal-width-standard)"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
            {t("common.cancel", "Cancel")}
          </Button>
          <Button type="submit" variant="primary" loading={saving} form="topic-form">
            {t("admin.permissions.done", "Done")}
          </Button>
        </>
      }
    >
      <form id="topic-form" onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.field}>
          <label htmlFor="topic-slug" className={styles.label}>
            {t("admin.contents.slugLabel", "Slug *")}
          </label>
          <EditableInput
            id="topic-slug"
            value={formData.slug}
            onChange={(value) => dispatch({ type: "UPDATE_FORM_FIELD", field: "slug", value })}
            placeholder={t("admin.contents.slugPlaceholder", "topic-slug")}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="topic-name-en" className={styles.label}>
            {t("admin.contents.englishNameLabel", "English Name *")}
          </label>
          <EditableInput
            id="topic-name-en"
            value={formData.name.en}
            onChange={handleNameChange}
            placeholder={t("admin.contents.englishNamePlaceholder", "Topic name in English")}
          />
        </div>

        {isNewTopic ? (
          <div className={styles.field}>
            <label htmlFor="topic-name-ar" className={styles.label}>
              {t("admin.contents.arabicNameLabel", "Arabic Name")}
            </label>
            <EditableInput
              id="topic-name-ar"
              value={formData.name.ar ?? ""}
              onChange={(value) => dispatch({ type: "UPDATE_NAME_AR", value })}
              placeholder={t(
                "admin.contents.arabicNamePlaceholderOptional",
                "Topic name in Arabic (optional)",
              )}
            />
          </div>
        ) : (
          <div className={styles.field}>
            <label htmlFor="topic-name-ar" className={styles.label}>
              {t("admin.contents.arabicNameLabel", "Arabic Name")}
            </label>
            <EditableInput
              id="topic-name-ar"
              value={translationChanges.ar?.name ?? ""}
              onChange={(value) => handleTranslationNameChange("ar", value)}
              placeholder={t("admin.contents.arabicNamePlaceholder", "Topic name in Arabic")}
            />
            {translations.find((t: any) => t.locale === "ar") && (
              <div className={styles.translationStatus}>
                {t("admin.contents.statusLabel", "Status:")}{" "}
                <span
                  className={`${styles.statusBadge} ${styles[`status-${translations.find((t: any) => t.locale === "ar")?.status}`]}`}
                >
                  {translations.find((t: any) => t.locale === "ar")?.status}
                </span>
              </div>
            )}
          </div>
        )}
      </form>
    </Modal>
  );
}
