"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/components/Button";
import { EditableInput } from "@/shared/components/EditableInput";
import { useTranslation } from "@/core/i18n/use-translation";
import {
  fetchAdminTopic,
  createTopicWithTranslations,
  updateTopicWithTranslations,
} from "@/features/admin/api/admin.api";
import type {
  CreateTopicWithTranslationsDto,
  UpdateTopicWithTranslationsDto,
  AdminTopicDetailDto,
} from "@sd/core-contracts";
import styles from "./topic-modal.module.css";

interface TopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (slug: string) => void;
  topicSlug?: string;
}

export function TopicModal({ isOpen, onClose, onSaved, topicSlug }: TopicModalProps) {
  const { t } = useTranslation();
  const isEditing = !!topicSlug;

  const [slug, setSlug] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSlug("");
      setNameEn("");
      setTranslations({});
      setSaving(false);
      setLoading(false);
      setFetchError(null);
      setError(null);
      return;
    }

    if (!topicSlug) {
      setSlug("");
      setNameEn("");
      setTranslations({});
      return;
    }

    let cancelled = false;
    setLoading(true);
    setFetchError(null);

    fetchAdminTopic(topicSlug)
      .then((data: AdminTopicDetailDto) => {
        if (cancelled) return;
        setSlug(data.slug);
        setNameEn(data.name.en ?? "");
        const transMap: Record<string, string> = {};
        for (const trans of data.translations ?? []) {
          transMap[trans.locale] = trans.fields?.name ?? "";
        }
        setTranslations(transMap);
      })
      .catch(() => {
        if (cancelled) return;
        setFetchError(t("admin.contents.failedToLoad", "Failed to load topic"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, topicSlug, t]);

  const handleNameEnChange = (value: string) => {
    setNameEn(value);
    if (!isEditing) {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
      setSlug(generatedSlug);
    }
  };

  const handleTranslationChange = (locale: string, value: string) => {
    setTranslations((prev) => ({ ...prev, [locale]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim() || !slug.trim()) {
      setError(t("admin.scholars.nameSlugRequired", "Name and slug are required"));
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const translationEntries = Object.entries(translations).map(([locale, name]) => ({
        locale: locale as any,
        name: name || "",
      }));

      if (isEditing) {
        const body: UpdateTopicWithTranslationsDto = {
          name: { en: nameEn },
          translations: translationEntries,
        };
        await updateTopicWithTranslations(topicSlug, body);
        onSaved(topicSlug);
      } else {
        const body: CreateTopicWithTranslationsDto = {
          slug,
          name: { en: nameEn },
          translations: translationEntries.filter((t) => t.name.trim()),
        };
        const result = await createTopicWithTranslations(body);
        onSaved(result.slug);
      }
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : t("admin.contents.failedToSave", "Failed to save");
      setError(message);
    } finally {
      setSaving(false);
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
        loading ? null : (
          <>
            <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
              {t("common.cancel", "Cancel")}
            </Button>
            <Button type="submit" variant="primary" loading={saving} form="topic-form">
              {t("admin.permissions.done", "Done")}
            </Button>
          </>
        )
      }
    >
      {loading ? (
        <div className={styles.loading}>{t("admin.contents.loading", "Loading...")}</div>
      ) : fetchError ? (
        <div className={styles.error}>{fetchError}</div>
      ) : (
        <form id="topic-form" onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.field}>
            <label htmlFor="topic-slug" className={styles.label}>
              {t("admin.contents.slugLabel", "Slug *")}
            </label>
            <EditableInput
              id="topic-slug"
              value={slug}
              onChange={setSlug}
              placeholder={t("admin.contents.slugPlaceholder", "topic-slug")}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="topic-name-en" className={styles.label}>
              {t("admin.contents.englishNameLabel", "English Name *")}
            </label>
            <EditableInput
              id="topic-name-en"
              value={nameEn}
              onChange={handleNameEnChange}
              placeholder={t("admin.contents.englishNamePlaceholder", "Topic name in English")}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="topic-name-ar" className={styles.label}>
              {t("admin.contents.arabicNameLabel", "Arabic Name")}
            </label>
            <EditableInput
              id="topic-name-ar"
              value={translations.ar ?? ""}
              onChange={(value) => handleTranslationChange("ar", value)}
              placeholder={t("admin.contents.arabicNamePlaceholder", "Topic name in Arabic")}
            />
          </div>
        </form>
      )}
    </Modal>
  );
}
