"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/components/Button";
import { InputField } from "@/shared/components/InputField";
import { useTranslation } from "@/core/i18n/use-translation";
import { slugify } from "@/features/admin/utils/slugify";
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
  onSaved: (slug: string) => void | Promise<void>;
  topicSlug?: string;
}

export function TopicModal({ isOpen, onClose, onSaved, topicSlug }: TopicModalProps) {
  const { t } = useTranslation();
  const isEditing = !!topicSlug;

  const [slug, setSlug] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [orderIndex, setOrderIndex] = useState(99);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSlug("");
      setNameEn("");
      setOrderIndex(99);
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
      setSlug(slugify(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!slug.trim() || !nameEn.trim()) {
      setError(
        t("admin.contents.slugAndLanguageRequired", "Slug and an English name are required."),
      );
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (isEditing) {
        const body: UpdateTopicWithTranslationsDto = {
          name: { en: nameEn },
          orderIndex,
        };
        await updateTopicWithTranslations(topicSlug, body);
        await onSaved(topicSlug);
      } else {
        const body: CreateTopicWithTranslationsDto = {
          slug,
          name: { en: nameEn },
          orderIndex,
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
              {t("admin.contents.slugLabel", "Slug")} *
            </label>
            <InputField
              id="topic-slug"
              type="text"
              value={slug}
              onChange={setSlug}
              disabled={isEditing}
              placeholder={t("admin.contents.slugPlaceholder", "topic-slug")}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="topic-name-en" className={styles.label}>
              {t("admin.contents.englishNameLabel", "English Name")} *
            </label>
            <InputField
              id="topic-name-en"
              type="text"
              value={nameEn}
              onChange={handleNameEnChange}
              placeholder={t("admin.contents.englishNamePlaceholder", "Topic name in English")}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="topic-order" className={styles.label}>
              {t("admin.contents.topic.orderIndexLabel", "Order Index")}
            </label>
            <InputField
              id="topic-order"
              type="number"
              value={String(orderIndex ?? "")}
              onChange={(value) => {
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
