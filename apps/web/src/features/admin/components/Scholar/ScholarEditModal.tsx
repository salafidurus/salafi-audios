"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Modal } from "@/shared/components/Modal";
import type { UpdateScholarDto } from "@sd/core-contracts";
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
import { fetchScholarFormData } from "@/features/admin/api/admin.api";
import { useEditScholarForm } from "../../hooks/Scholar/useEditScholarForm";
import {
  getSecondaryLocales,
  buildTranslationsPayload,
  getLocaleLabel,
} from "@/features/admin/utils/locale-tabs";
import styles from "./scholar-modal.module.css";

export interface ScholarEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, data: UpdateScholarDto) => Promise<void>;
  scholarId: string | null;
}

export function ScholarEditModal({ isOpen, onClose, onSave, scholarId }: ScholarEditModalProps) {
  const { t } = useTranslation();
  const loadingRef = useRef(false);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [errorTabs, setErrorTabs] = useState<string[]>([]);
  const [formDataLoaded, setFormDataLoaded] = useState(false);

  // Temporarily store the hook state to track if we have data
  const [tempState, setTempState] = useState(null as any);
  const { state, dispatch } = useEditScholarForm(
    tempState || { scholar: {} as any, translations: [] },
  );

  const [activeTab, setActiveTab] = useState<string>("general");
  const {
    formData,
    initialFormData,
    translationChanges,
    saving,
    error,
    stagedImageFile,
    stagedImagePreview,
    slug,
    id,
  } = state;
  const secondaryLocales = getSecondaryLocales(formData.mainLanguage as Locale);
  const errorTabSet = new Set(errorTabs);

  const handleClose = () => {
    setErrorTabs([]);
    setFormDataLoaded(false);
    setTempState(null);
    onClose();
  };

  // Fetch form data when opening modal in edit mode with scholarId
  useEffect(() => {
    if (!isOpen || !scholarId) return;

    let cancelled = false;
    setLoading(true);
    setFetchError(null);

    fetchScholarFormData(scholarId)
      .then((data) => {
        loadingRef.current = false;
        if (cancelled) return;
        setTempState(data);
        setFormDataLoaded(true);
        dispatch({ type: "INIT_FORM", data });
      })
      .catch((err) => {
        loadingRef.current = false;
        if (cancelled) return;
        setFetchError(sanitizeError(err));
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, scholarId, dispatch]);

  // Compute which fields have changed for the review tab
  const changedFields = useMemo(() => {
    if (!formDataLoaded) {
      return {};
    }

    // For edit mode, only show changed fields
    return {
      name: formData.name !== initialFormData.name,
      bio: formData.bio !== initialFormData.bio,
      title: formData.title !== initialFormData.title,
      country: formData.country !== initialFormData.country,
      orderIndex: formData.orderIndex !== initialFormData.orderIndex,
      socialTwitter: formData.socialTwitter !== initialFormData.socialTwitter,
      socialTelegram: formData.socialTelegram !== initialFormData.socialTelegram,
      socialYoutube: formData.socialYoutube !== initialFormData.socialYoutube,
      socialWebsite: formData.socialWebsite !== initialFormData.socialWebsite,
    };
  }, [formDataLoaded, formData, initialFormData]);

  const handleImageStaged = (file: File | null, preview: string | null) => {
    dispatch({ type: "SET_STAGED_IMAGE", file, preview });
    if (file && preview) {
      dispatch({ type: "UPDATE_FIELD", field: "imageUrl", value: preview });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errTabs: string[] = [];
    if (!formData.mainLanguage) {
      errTabs.push("general");
    }

    if (errTabs.length > 0) {
      setErrorTabs(errTabs);
      dispatch({
        type: "SET_ERROR",
        error: t("admin.scholars.mainLanguageRequired", "Main language is required"),
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
      ) as UpdateScholarDto["translations"];

      // Handle image upload if file is staged
      if (stagedImageFile) {
        const ext = stagedImageFile.name.split(".").pop()?.toLowerCase() || "png";
        const filename = `${slug}.${ext}`;
        const presignedResponse = await getPresignedUrl({
          filename,
          contentType: stagedImageFile.type,
          purpose: "image",
          slug,
        });

        await uploadToR2(presignedResponse.uploadUrl, stagedImageFile, stagedImageFile.type);

        payloadData.imageUrl = presignedResponse.publicUrl;
      }

      await onSave(id, payloadData);
      onClose();
    } catch (err) {
      dispatch({ type: "SET_ERROR", error: sanitizeError(err) });
    } finally {
      dispatch({ type: "SET_SAVING", saving: false });
    }
  };

  if (!formDataLoaded) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={t("admin.scholars.editScholar", "Edit Scholar")}
        size="xl"
      >
        {loading && <div className={styles.loading}>{t("common.loading", "Loading...")}</div>}
        {fetchError && <div className={styles.error}>{fetchError}</div>}
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t("admin.scholars.editScholar", "Edit Scholar")}
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
      saveLabel={t("admin.scholars.saveChanges", "Save Changes")}
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
              isEditing={true}
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
              onNameChange={(value) => dispatch({ type: "UPDATE_FIELD", field: "name", value })}
              onBioChange={(value) => dispatch({ type: "UPDATE_FIELD", field: "bio", value })}
              title={t("admin.modal.mainLanguageContent", "Main Language Content")}
              isRequired={false}
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
                const initial = initialFormData;
                const trans = {
                  locale,
                  name: translationChanges[locale]?.name,
                  bio: translationChanges[locale]?.bio,
                };
                if (trans.name !== initial?.name || trans.bio !== initial?.bio) {
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
