"use client";

import { useState, useEffect } from "react";
import { Edit2, RotateCcw } from "lucide-react";
import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/components/Button";
import { EditableInput } from "@/shared/components/EditableInput";
import { useContentTranslations } from "@sd/domain-content";
import type { UpsertTopicDto } from "@sd/core-contracts";
import { SUPPORTED_LOCALES } from "@sd/core-i18n";
import styles from "./topic-form-modal.module.css";

export interface TopicForEdit {
  id: string;
  slug: string;
  name: string;
  parentSlug?: string | null;
}

export interface TopicFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UpsertTopicDto) => Promise<void>;
  topic?: TopicForEdit | null;
}

function getInitialFormData(topic: TopicForEdit | null): UpsertTopicDto {
  if (topic) {
    return {
      name: topic.name,
      slug: topic.slug,
      parentSlug: topic.parentSlug ?? undefined,
    };
  }
  return { name: "", slug: "" };
}

export function TopicFormModal({ isOpen, onClose, onSave, topic }: TopicFormModalProps) {
  const [formData, setFormData] = useState<UpsertTopicDto>(() => getInitialFormData(topic ?? null));
  const [originalFormData, setOriginalFormData] = useState<UpsertTopicDto>(() =>
    getInitialFormData(topic ?? null),
  );
  const [editingFields, setEditingFields] = useState<Set<string>>(new Set());
  const [selectedLocale, setSelectedLocale] = useState<"en" | "ar">("en");
  const [translationChanges, setTranslationChanges] = useState<
    Record<string, Record<string, string | null>>
  >({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!topic;
  const isNewTopic = !isEditing;

  // Fetch translations only when editing
  const { data: translationsResponse } = useContentTranslations(
    isEditing && topic ? { entity: "topic", topicId: topic.id } : { entity: "topic", topicId: "" },
  );

  const translations = translationsResponse?.translations ?? [];

  // Sync form data when topic changes or modal opens
  useEffect(() => {
    if (isOpen) {
      const initialData = getInitialFormData(topic ?? null);
      setFormData(initialData);
      setOriginalFormData(initialData);
      setEditingFields(new Set(isNewTopic ? ["name", "slug"] : []));
    }
  }, [isOpen, topic, isNewTopic]);

  // Initialize translation changes when modal opens
  useEffect(() => {
    if (isOpen && isEditing && translations.length > 0) {
      const changes: Record<string, Record<string, string | null>> = {};
      translations.forEach((trans) => {
        changes[trans.locale] = trans.fields;
      });
      setTranslationChanges(changes);
    }
  }, [isOpen, isEditing, translations]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setSelectedLocale("en");
    }
  }, [isOpen]);

  const toggleFieldEdit = (fieldName: string) => {
    const isCurrentlyEditing = editingFields.has(fieldName);

    if (isCurrentlyEditing) {
      // Revert the value to original when toggling off
      if (fieldName === "slug") {
        setFormData((p) => ({ ...p, slug: originalFormData.slug ?? "" }));
      } else if (fieldName === "name") {
        setFormData((p) => ({ ...p, name: originalFormData.name ?? "" }));
      } else if (fieldName === "translation-ar-name") {
        const originalArabicName = translations.find((t) => t.locale === "ar")?.fields.name ?? "";
        setTranslationChanges((prev) => ({
          ...prev,
          ar: {
            ...prev.ar,
            name: originalArabicName,
          },
        }));
      }
    }

    // Toggle the editing state
    setEditingFields((prev) => {
      const next = new Set(prev);
      if (next.has(fieldName)) {
        next.delete(fieldName);
      } else {
        next.add(fieldName);
      }
      return next;
    });
  };

  const isFieldEditing = (fieldName: string) => editingFields.has(fieldName);

  // Auto-generate slug from name (for new topics only)
  const handleNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: isNewTopic
        ? value
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
        : prev.slug,
    }));
  };

  const handleTranslationNameChange = (locale: string, value: string) => {
    setTranslationChanges((prev) => ({
      ...prev,
      [locale]: {
        ...prev[locale],
        name: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.slug.trim()) {
      setError("Name and slug are required");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      // Prepare data with translations for single API round trip
      const dataWithTranslations: UpsertTopicDto = {
        ...formData,
        translations: isEditing ? translationChanges : undefined,
      };
      await onSave(dataWithTranslations);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
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
          <label className={styles.label}>Slug *</label>
          <EditableInput
            value={formData.slug}
            onChange={(value) => setFormData((p) => ({ ...p, slug: value }))}
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
          <label className={styles.label}>English Name *</label>
          <EditableInput
            value={formData.name}
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
        {isEditing && translations.length > 0 && (
          <div className={styles.field}>
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
