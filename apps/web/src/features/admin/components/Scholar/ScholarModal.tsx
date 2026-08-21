"use client";

import type { Locale } from "@sd/core-contracts";

import { sanitizeError } from "@sd/utils-error";
import { useState, useEffect, useMemo, useRef } from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import { fetchScholarFormData } from "@/features/admin/api/admin.api";
import { FormSection } from "@/features/admin/components/FormSection";
import { getLocaleLabel } from "@/features/admin/utils/locale-tabs";
import { slugify } from "@/features/admin/utils/slugify";
import { InputField } from "@/shared/components/InputField";
import { Modal } from "@/shared/components/Modal";

import { useSaveScholar } from "../../hooks/Scholar/useSaveScholar";
import { useScholarForm } from "../../hooks/Scholar/useScholarForm";
import { GeneralDataSection } from "./general-data-section";
import { LocationSection } from "./location-section";
import { ReviewSection } from "./review-section";
import styles from "./scholar-modal.module.css";
import { SettingsSection } from "./settings-section";
import { SocialSection } from "./social-section";

export interface ScholarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
  scholarId?: string | null;
}

function isScholarModalTab(id: string): id is "general" | "main" | "review" {
  return id === "general" || id === "main" || id === "review";
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
      dispatch({ type: "UPDATE_FIELD", field: "slug", value: slugify(value) });
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
      onActiveTabChange={(id) => {
        if (isScholarModalTab(id)) {
          setActiveTab(id);
        }
      }}
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
          <Modal.TabItem id="main">
            {
              // SAFETY: scholar main language is constrained to the same locale domain used by locale labels.
              getLocaleLabel(state.mainLanguage as Locale)
            }
          </Modal.TabItem>
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
            <FormSection title={t("admin.modal.mainLanguageContent", "Main Language Content")}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="scholar-name">
                  {t("admin.scholars.nameLabel", "Name")}
                  {!state.isEditing ? " *" : ""}
                </label>
                <InputField
                  id="scholar-name"
                  type="text"
                  value={state.name}
                  onChange={handleNameChange}
                  placeholder={t("admin.scholars.namePlaceholder", "Scholar name")}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="scholar-bio">
                  {t("admin.scholars.bioLabel", "Bio")}
                </label>
                <InputField
                  id="scholar-bio"
                  type="textarea"
                  value={state.bio}
                  onChange={(value) => dispatch({ type: "UPDATE_FIELD", field: "bio", value })}
                  placeholder={t("admin.scholars.bioPlaceholder", "Scholar biography")}
                />
              </div>
            </FormSection>
          </Modal.ContentItem>

          <Modal.ContentItem id="review">
            {state.error && <div className={styles.error}>{state.error}</div>}
            <ReviewSection
              formData={state}
              changedFields={changedFields}
              stagedImagePreview={state.stagedImagePreview}
            />
          </Modal.ContentItem>
        </Modal.Content>
      </form>
    </Modal>
  );
}
