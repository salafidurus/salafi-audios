"use client";

import type { Locale } from "@sd/core-contracts";

import { sanitizeError } from "@sd/utils-error";
import { useState, useEffect, useMemo, useRef } from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import { fetchScholarFormData } from "@/features/admin/api/admin.api";
import { FormSection } from "@/features/admin/components/FormSection";
import { getLocaleLabel } from "@/features/admin/utils/locale-tabs";
import { slugify } from "@/features/admin/utils/slugify";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { InputField } from "@/shared/components/ui/input-field";
import { Modal } from "@/shared/components/ui/modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

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
    <Dialog open={isOpen} onOpenChange={(open) => !open && !state.saving && handleClose()}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-hidden sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {state.isEditing
              ? t("admin.scholars.editScholar", "Edit Scholar")
              : t("admin.scholars.addScholar", "Add Scholar")}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t("admin.modal.formDescription", "Complete each tab before saving.")}
          </DialogDescription>
        </DialogHeader>

        <form id="scholar-form" onSubmit={handleSubmit} className={styles.form}>
          <Tabs
            value={activeTab}
            onValueChange={(id) => {
              if (isScholarModalTab(id)) setActiveTab(id);
            }}
            className="min-h-0"
          >
            <TabsList
              className="w-full justify-start overflow-x-auto"
              aria-label={t("admin.modal.tabsLabel", "Form sections")}
            >
              <TabsTrigger
                value="general"
                aria-invalid={errorTabs.includes("general") || undefined}
                onClick={() => setActiveTab("general")}
              >
                {t("admin.modal.generalTab", "General")}
              </TabsTrigger>
              <TabsTrigger
                value="main"
                aria-invalid={errorTabs.includes("main") || undefined}
                onClick={() => setActiveTab("main")}
              >
                {
                  // SAFETY: scholar main language is constrained to the same locale domain used by locale labels.
                  getLocaleLabel(state.mainLanguage as Locale)
                }
              </TabsTrigger>
              <TabsTrigger value="review" onClick={() => setActiveTab("review")}>
                {t("admin.modal.reviewTab", "Review")}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="general">
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
            </TabsContent>

            <TabsContent value="main">
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
            </TabsContent>

            <TabsContent value="review">
              {state.error && <div className={styles.error}>{state.error}</div>}
              <ReviewSection
                formData={state}
                changedFields={changedFields}
                stagedImagePreview={state.stagedImagePreview}
              />
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={handleClose} disabled={state.saving}>
              {t("common.cancel", "Cancel")}
            </Button>
            {activeTab === "review" ? (
              <Button type="submit" form="scholar-form" variant="primary" loading={state.saving}>
                {state.saving
                  ? t("admin.access.saving", "Saving…")
                  : state.isEditing
                    ? t("admin.scholars.saveChanges", "Save Changes")
                    : t("admin.scholars.addScholar", "Add Scholar")}
              </Button>
            ) : (
              <Button type="button" variant="primary" onClick={() => setActiveTab("review")}>
                {t("admin.modal.reviewTab", "Review")}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
