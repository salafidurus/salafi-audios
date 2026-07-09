"use client";

import { useState, useEffect } from "react";
import { Edit2, RotateCcw } from "lucide-react";
import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/components/Button";
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
      await onSave(formData);
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

        {/* Name Field */}
        <div className={styles.field}>
          <label className={styles.label}>Name *</label>
          <div className={styles.fieldInputGroup}>
            <input
              type="text"
              className={styles.input}
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Topic name"
              disabled={isEditing && !isFieldEditing("name")}
            />
            {isEditing && (
              <button
                type="button"
                className={styles.editIconButton}
                onClick={() => toggleFieldEdit("name")}
                aria-label={isFieldEditing("name") ? "Cancel edit" : "Edit name"}
              >
                {isFieldEditing("name") ? <RotateCcw size={16} /> : <Edit2 size={16} />}
              </button>
            )}
          </div>
        </div>

        {/* Slug Field */}
        <div className={styles.field}>
          <label className={styles.label}>Slug *</label>
          <div className={styles.fieldInputGroup}>
            <input
              type="text"
              className={styles.input}
              value={formData.slug}
              onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))}
              placeholder="topic-slug"
              disabled={isEditing && !isFieldEditing("slug")}
            />
            {isEditing && (
              <button
                type="button"
                className={styles.editIconButton}
                onClick={() => toggleFieldEdit("slug")}
                aria-label={isFieldEditing("slug") ? "Cancel edit" : "Edit slug"}
              >
                {isFieldEditing("slug") ? <RotateCcw size={16} /> : <Edit2 size={16} />}
              </button>
            )}
          </div>
        </div>

        {/* Translations Section */}
        {isEditing && translations.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Translations</h3>

            <div className={styles.localeTabs}>
              {SUPPORTED_LOCALES.map((locale: "en" | "ar") => (
                <button
                  key={locale}
                  type="button"
                  className={`${styles.localeTab} ${selectedLocale === locale ? styles.localeTabActive : ""}`}
                  onClick={() => setSelectedLocale(locale)}
                >
                  {locale.toUpperCase()}
                </button>
              ))}
            </div>

            {SUPPORTED_LOCALES.map((locale: "en" | "ar") => {
              const translation = translations.find((t) => t.locale === locale);
              if (!translation) return null;

              const translationFieldKey = `translation-${locale}-name`;

              return (
                <div
                  key={locale}
                  className={`${styles.localeContent} ${selectedLocale === locale ? styles.localeContentActive : ""}`}
                >
                  <div className={styles.field}>
                    <label className={styles.label}>Name ({locale.toUpperCase()})</label>
                    <div className={styles.fieldInputGroup}>
                      <input
                        type="text"
                        className={styles.input}
                        value={translationChanges[locale]?.name ?? ""}
                        onChange={(e) => handleTranslationNameChange(locale, e.target.value)}
                        placeholder={`Topic name in ${locale}`}
                        disabled={!isFieldEditing(translationFieldKey)}
                      />
                      <button
                        type="button"
                        className={styles.editIconButton}
                        onClick={() => toggleFieldEdit(translationFieldKey)}
                        aria-label={
                          isFieldEditing(translationFieldKey)
                            ? `Cancel ${locale} edit`
                            : `Edit ${locale} translation`
                        }
                      >
                        {isFieldEditing(translationFieldKey) ? (
                          <RotateCcw size={16} />
                        ) : (
                          <Edit2 size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className={styles.translationStatus}>
                    Status:{" "}
                    <span
                      className={`${styles.statusBadge} ${styles[`status-${translation.status}`]}`}
                    >
                      {translation.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </form>
    </Modal>
  );
}
