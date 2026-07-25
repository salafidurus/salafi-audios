"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Modal } from "@/shared/components/Modal";
import type { CreateScholarDto } from "@sd/core-contracts";
import type { Locale } from "@sd/core-contracts";
import { sanitizeError } from "@sd/utils-error";
import { useTranslation } from "@/core/i18n/use-translation";
import { GeneralDataSection } from "./general-data-section";
import { LocationSection } from "./location-section";
import { SocialSection } from "./social-section";
import { SettingsSection } from "./settings-section";
import { TranslationFieldsSection } from "./translation-fields-section";
import { ReviewSection } from "./review-section";
import { getPresignedUrl, uploadToR2 } from "@/features/admin/api/admin-lectures.api";
import { useCreateScholarForm } from "../../hooks/Scholar/useCreateScholarForm";
import {
  getSecondaryLocales,
  buildTranslationsPayload,
  getLocaleLabel,
} from "@/features/admin/utils/locale-tabs";
import styles from "./scholar-modal.module.css";

export interface ScholarCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateScholarDto) => Promise<void>;
}

export function ScholarCreateModal({ isOpen, onClose, onSave }: ScholarCreateModalProps) {
  const { t } = useTranslation();
  const loadingRef = useRef(false);
  const [errorTabs, setErrorTabs] = useState<string[]>([]);

  const { state, dispatch } = useCreateScholarForm();
  const [activeTab, setActiveTab] = useState<string>("general");
  const { formData, translationChanges, saving, error, stagedImageFile, stagedImagePreview } =
    state;
  const secondaryLocales = getSecondaryLocales(formData.mainLanguage as Locale);
  const errorTabSet = new Set(errorTabs);

  const handleClose = () => {
    setErrorTabs([]);
    onClose();
  };

  const changedFields = useMemo(() => {
    return {
      name: !!formData.name,
      slug: !!formData.slug,
      bio: !!formData.bio,
      title: !!formData.title,
      country: !!formData.country,
      orderIndex: formData.orderIndex !== 999,
      socialTwitter: !!formData.socialTwitter,
      socialTelegram: !!formData.socialTelegram,
      socialYoutube: !!formData.socialYoutube,
      socialWebsite: !!formData.socialWebsite,
    };
  }, [formData]);

  const handleImageStaged = (file: File | null, preview: string | null) => {
    dispatch({ type: "SET_STAGED_IMAGE", file, preview });
    if (file && preview) {
      dispatch({ type: "UPDATE_FIELD", field: "imageUrl", value: preview });
    }
  };

  const handleNameChange = (value: string) => {
    dispatch({ type: "UPDATE_FIELD", field: "name", value });
    if (!formData.slug) {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
      dispatch({ type: "UPDATE_FIELD", field: "slug", value: generatedSlug });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errTabs: string[] = [];
    if (!formData.slug?.trim() || !formData.mainLanguage) {
      errTabs.push("general");
    }
    if (!formData.name?.trim()) {
      errTabs.push("main");
    }

    if (errTabs.length > 0) {
      setErrorTabs(errTabs);
      dispatch({
        type: "SET_ERROR",
        error: t("admin.scholars.nameSlugRequired", "Name, slug, and main language are required"),
      });
      return;
    }

    setErrorTabs([]);
    dispatch({ type: "SET_SAVING", saving: true });
    dispatch({ type: "SET_ERROR", error: null });
    try {
      const payloadData = { ...formData };

      // Build translations array using utility (N-locale safe)
      const secondaryLocales = getSecondaryLocales(formData.mainLanguage as Locale);
      payloadData.translations = buildTranslationsPayload(
        translationChanges,
        secondaryLocales,
        (v) => !!v?.name,
      ) as CreateScholarDto["translations"];

      // Handle image upload if file is staged
      if (stagedImageFile) {
        const ext = stagedImageFile.name.split(".").pop()?.toLowerCase() || "png";
        const filename = `${formData.slug}.${ext}`;
        const presignedResponse = await getPresignedUrl({
          filename,
          contentType: stagedImageFile.type,
          purpose: "image",
          slug: formData.slug,
        });

        await uploadToR2(presignedResponse.uploadUrl, stagedImageFile, stagedImageFile.type);

        payloadData.imageUrl = presignedResponse.publicUrl;
      }

      await onSave(payloadData);
      onClose();
    } catch (err) {
      dispatch({ type: "SET_ERROR", error: sanitizeError(err) });
    } finally {
      dispatch({ type: "SET_SAVING", saving: false });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t("admin.scholars.addScholar", "Add Scholar")}
      size="xl"
      width="wide"
      height="long"
      multiTab
      requireReview
      errorTabs={errorTabs}
      activeTab={activeTab}
      onActiveTabChange={(id) => setActiveTab(id as "general" | "main" | "other" | "review")}
      defaultActiveTab="general"
      saveFormId="scholar-form"
      saving={saving}
      reviewTabId="review"
      saveLabel={t("admin.scholars.addScholar", "Add Scholar")}
    >
      <form id="scholar-form" onSubmit={handleSubmit} className={styles.form}>
        <Modal.Tabs errorTabs={errorTabs}>
          <Modal.TabItem id="general">{t("admin.modal.generalTab", "General")}</Modal.TabItem>
          <Modal.TabItem id="main">{getLocaleLabel(formData.mainLanguage as Locale)}</Modal.TabItem>
          {secondaryLocales.map((locale) => (
            <Modal.TabItem key={locale} id={locale}>
              {getLocaleLabel(locale)}
            </Modal.TabItem>
          ))}
          <Modal.TabItem id="review">{t("admin.modal.reviewTab", "Review")}</Modal.TabItem>
        </Modal.Tabs>

        <Modal.Content>
          <Modal.ContentItem id="general">
            {(errorTabSet.has("general") || activeTab === "general") && error && (
              <div className={styles.error}>{error}</div>
            )}
            <GeneralDataSection
              formData={formData}
              dispatch={dispatch}
              onImageStaged={handleImageStaged}
              isEditing={false}
            />
            <LocationSection formData={formData} dispatch={dispatch} />
            <SocialSection formData={formData} dispatch={dispatch} />
            <SettingsSection formData={formData} dispatch={dispatch} />
          </Modal.ContentItem>

          <Modal.ContentItem id="main">
            {(errorTabSet.has("main") || activeTab === "main") && error && (
              <div className={styles.error}>{error}</div>
            )}
            <TranslationFieldsSection
              locale={formData.mainLanguage as Locale}
              name={formData.name}
              bio={formData.bio}
              onNameChange={handleNameChange}
              onBioChange={(value) => dispatch({ type: "UPDATE_FIELD", field: "bio", value })}
              title={t("admin.modal.mainLanguageContent", "Main Language Content")}
              isRequired
            />
          </Modal.ContentItem>

          {secondaryLocales.map((locale) => (
            <Modal.ContentItem key={locale} id={locale}>
              {(errorTabSet.has(locale) || activeTab === locale) && error && (
                <div className={styles.error}>{error}</div>
              )}
              <TranslationFieldsSection
                locale={locale}
                name={translationChanges[locale]?.name ?? ""}
                bio={translationChanges[locale]?.bio ?? undefined}
                onNameChange={(value) =>
                  dispatch({
                    type: "UPDATE_TRANSLATION",
                    locale,
                    field: "name",
                    value,
                  })
                }
                onBioChange={(value) =>
                  dispatch({
                    type: "UPDATE_TRANSLATION",
                    locale,
                    field: "bio",
                    value,
                  })
                }
                title={t("admin.modal.translateContent", `Translate to ${getLocaleLabel(locale)}`)}
              />
            </Modal.ContentItem>
          ))}

          <Modal.ContentItem id="review">
            {error && <div className={styles.error}>{error}</div>}
            <ReviewSection
              formData={formData}
              changedFields={changedFields}
              translations={secondaryLocales.reduce<
                Array<{ locale: Locale; name?: string; bio?: string | null }>
              >((acc, locale) => {
                const trans = {
                  locale,
                  name: translationChanges[locale]?.name,
                  bio: translationChanges[locale]?.bio,
                };
                if (trans.name || trans.bio) {
                  acc.push(trans);
                }
                return acc;
              }, [])}
              stagedImagePreview={stagedImagePreview}
            />
          </Modal.ContentItem>
        </Modal.Content>
      </form>
    </Modal>
  );
}
