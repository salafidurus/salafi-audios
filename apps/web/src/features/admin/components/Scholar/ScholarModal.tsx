"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Modal } from "@/shared/components/Modal";
import type { Locale } from "@sd/core-contracts";
import { sanitizeError } from "@sd/utils-error";
import { useTranslation } from "@/core/i18n/use-translation";
import { GeneralDataSection } from "./general-data-section";
import { LocationSection } from "./location-section";
import { SocialSection } from "./social-section";
import { SettingsSection } from "./settings-section";
import { TranslationFieldsSection } from "./translation-fields-section";
import { ReviewSection } from "./review-section";
import { fetchScholarFormData } from "@/features/admin/api/admin.api";
import { useScholarForm } from "../../hooks/Scholar/useScholarForm";
import { useSaveScholar } from "../../hooks/Scholar/useSaveScholar";
import { getSecondaryLocales, getLocaleLabel } from "@/features/admin/utils/locale-tabs";
import styles from "./scholar-modal.module.css";

export interface ScholarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
  scholarId?: string | null;
}

export function ScholarModal({ isOpen, onClose, onSuccess, scholarId }: ScholarModalProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>("general");
  const [errorTabs, setErrorTabs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const loadingRef = useRef(false);
  const formDataLoadedRef = useRef(false);

  // Starts in create mode; edit-mode data is hydrated via INIT_FORM once fetched.
  const { state, dispatch } = useScholarForm();

  useEffect(() => {
    if (!scholarId || formDataLoadedRef.current) return;
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    setFetchError(null);

    fetchScholarFormData(scholarId)
      .then((data) => {
        dispatch({ type: "INIT_FORM", data });
        formDataLoadedRef.current = true;
        setLoading(false);
      })
      .catch((err) => {
        setFetchError(sanitizeError(err));
        setLoading(false);
        loadingRef.current = false;
      });
  }, [scholarId, dispatch]);

  const handleClose = () => {
    setErrorTabs([]);
    onClose();
  };

  const changedFields = useMemo(() => {
    if (state.isEditing) {
      const initial = state.initialSnapshot;
      return {
        name: initial ? state.name !== initial.name : false,
        slug: false,
        bio: initial ? state.bio !== initial.bio : false,
        title: initial ? state.title !== initial.title : false,
        country: initial ? state.country !== initial.country : false,
        orderIndex: initial ? state.orderIndex !== initial.orderIndex : false,
        socialTwitter: initial ? state.socialTwitter !== initial.socialTwitter : false,
        socialTelegram: initial ? state.socialTelegram !== initial.socialTelegram : false,
        socialYoutube: initial ? state.socialYoutube !== initial.socialYoutube : false,
        socialWebsite: initial ? state.socialWebsite !== initial.socialWebsite : false,
      };
    }
    // Create mode: nothing to diff against yet, so show which fields have been filled in
    return {
      name: !!state.name,
      slug: !!state.slug,
      bio: !!state.bio,
      title: !!state.title,
      country: !!state.country,
      orderIndex: state.orderIndex !== 999,
      socialTwitter: !!state.socialTwitter,
      socialTelegram: !!state.socialTelegram,
      socialYoutube: !!state.socialYoutube,
      socialWebsite: !!state.socialWebsite,
    };
  }, [state]);

  const handleImageStaged = (file: File | null, preview: string | null) => {
    dispatch({ type: "SET_STAGED_IMAGE", file, preview });
    if (file && preview) {
      dispatch({ type: "UPDATE_FIELD", field: "imageUrl", value: preview });
    }
  };

  const handleNameChange = (value: string) => {
    dispatch({ type: "UPDATE_FIELD", field: "name", value });
    if (!state.isEditing && !state.slug) {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
      dispatch({ type: "UPDATE_FIELD", field: "slug", value: generatedSlug });
    }
  };

  const handleSubmit = useSaveScholar(state, dispatch, onSuccess, onClose, setErrorTabs);

  if (!state.isEditing && loading) {
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

  const secondaryLocales = getSecondaryLocales(state.mainLanguage as Locale);
  const errorTabSet = new Set(errorTabs);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        state.isEditing
          ? t("admin.scholars.editScholar", "Edit Scholar")
          : t("admin.scholars.addScholar", "Add Scholar")
      }
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
      saving={state.saving}
      reviewTabId="review"
      saveLabel={
        state.isEditing
          ? t("admin.scholars.saveChanges", "Save Changes")
          : t("admin.scholars.addScholar", "Add Scholar")
      }
    >
      <form id="scholar-form" onSubmit={handleSubmit} className={styles.form}>
        <Modal.Tabs errorTabs={errorTabs}>
          <Modal.TabItem id="general">{t("admin.modal.generalTab", "General")}</Modal.TabItem>
          <Modal.TabItem id="main">{getLocaleLabel(state.mainLanguage as Locale)}</Modal.TabItem>
          {secondaryLocales.map((locale) => (
            <Modal.TabItem key={locale} id={locale}>
              {getLocaleLabel(locale)}
            </Modal.TabItem>
          ))}
          <Modal.TabItem id="review">{t("admin.modal.reviewTab", "Review")}</Modal.TabItem>
        </Modal.Tabs>

        <Modal.Content>
          <Modal.ContentItem id="general">
            {(errorTabSet.has("general") || activeTab === "general") && state.error && (
              <div className={styles.error}>{state.error}</div>
            )}
            <GeneralDataSection
              formData={state}
              dispatch={dispatch}
              onImageStaged={handleImageStaged}
              isEditing={state.isEditing}
            />
            <LocationSection formData={state} dispatch={dispatch} />
            <SocialSection formData={state} dispatch={dispatch} />
            <SettingsSection formData={state} dispatch={dispatch} />
          </Modal.ContentItem>

          <Modal.ContentItem id="main">
            {(errorTabSet.has("main") || activeTab === "main") && state.error && (
              <div className={styles.error}>{state.error}</div>
            )}
            <TranslationFieldsSection
              locale={state.mainLanguage as Locale}
              name={state.name}
              bio={state.bio}
              onNameChange={handleNameChange}
              onBioChange={(value) => dispatch({ type: "UPDATE_FIELD", field: "bio", value })}
              title={t("admin.modal.mainLanguageContent", "Main Language Content")}
              isRequired={!state.isEditing}
            />
          </Modal.ContentItem>

          {secondaryLocales.map((locale) => (
            <Modal.ContentItem key={locale} id={locale}>
              {(errorTabSet.has(locale) || activeTab === locale) && state.error && (
                <div className={styles.error}>{state.error}</div>
              )}
              <TranslationFieldsSection
                locale={locale}
                name={state.translationChanges[locale]?.name ?? ""}
                bio={state.translationChanges[locale]?.bio ?? undefined}
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
            {state.error && <div className={styles.error}>{state.error}</div>}
            <ReviewSection
              formData={state}
              changedFields={changedFields}
              translations={secondaryLocales.reduce<
                Array<{ locale: Locale; name?: string; bio?: string | null }>
              >((acc, locale) => {
                const trans = state.translationChanges[locale];
                const initial = state.initialTranslationChanges[locale];
                const changed = trans?.name !== initial?.name || trans?.bio !== initial?.bio;
                if (changed && (trans?.name || trans?.bio)) {
                  acc.push({ locale, name: trans?.name, bio: trans?.bio });
                }
                return acc;
              }, [])}
              stagedImagePreview={state.stagedImagePreview}
            />
          </Modal.ContentItem>
        </Modal.Content>
      </form>
    </Modal>
  );
}
