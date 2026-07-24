"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/components/Button";
import { EditableInput } from "@/shared/components/EditableInput";
import { useTranslation } from "@/core/i18n/use-translation";
import { type Locale } from "@sd/core-contracts";
import {
  fetchAdminTopic,
  createTopicWithTranslations,
  updateTopicWithTranslations,
} from "@/features/admin/api/admin.api";
import { getSecondaryLocales } from "@/features/admin/utils/locale-tabs";
import type {
  CreateTopicWithTranslationsDto,
  UpdateTopicWithTranslationsDto,
  AdminTopicDetailDto,
} from "@sd/core-contracts";
import styles from "./topic-modal.module.css";

interface TopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (slug: string) => void | Promise<void>;
  topicSlug?: string;
}

export function TopicModal({ isOpen, onClose, onSaved, topicSlug }: TopicModalProps) {
  const { t } = useTranslation();
  const isEditing = !!topicSlug;

  const [slug, setSlug] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [orderIndex, setOrderIndex] = useState(99);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSlug("");
      setNameEn("");
      setOrderIndex(99);
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
      setOrderIndex(99);
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
        setOrderIndex(data.orderIndex ?? 99);
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
    const hasAnyLanguage =
      nameEn.trim().length > 0 || Object.values(translations).some((v) => v && v.trim().length > 0);

    if (!slug.trim() || !hasAnyLanguage) {
      setError(
        t(
          "admin.contents.slugAndLanguageRequired",
          "Slug and at least one language name are required.",
        ),
      );
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
          orderIndex,
          translations: translationEntries.filter((t) => t.name.trim()),
        };
        await updateTopicWithTranslations(topicSlug, body);
        await onSaved(topicSlug);
      } else {
        const body: CreateTopicWithTranslationsDto = {
          slug,
          name: { en: nameEn },
          orderIndex,
          translations: translationEntries.filter((t) => t.name.trim()),
        };
        const result = await createTopicWithTranslations(body);
        await onSaved(result.slug);
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
      width="narrow"
      height="auto"
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
              disabled={isEditing}
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

          <div className={styles.field}>
            <label htmlFor="topic-order" className={styles.label}>
              {t("admin.contents.topic.orderIndexLabel", "Order Index")}
            </label>
            <input
              id="topic-order"
              type="number"
              className={styles.input}
              value={orderIndex ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                const parsed = value ? Number(value) : 99;
                setOrderIndex(Number.isNaN(parsed) ? 99 : parsed);
              }}
            />
          </div>
        </form>
      )}
    </Modal>
  );
}
