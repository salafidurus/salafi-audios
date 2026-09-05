/** Documents this module's responsibility and public boundary. */
"use client";

import type { Locale } from "@sd/core-contracts";

import { sanitizeError } from "@sd/utils-error";
import { useState, useEffect, useRef } from "react";

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
import {
  useScholarForm,
  type FormAction,
  type FormState,
} from "../../hooks/Scholar/useScholarForm";
import { GeneralDataSection } from "./general-data-section";
import { LocationSection } from "./location-section";
import { ReviewSection } from "./review-section";
import styles from "./scholar-modal.module.css";
import { SettingsSection } from "./settings-section";
import { SocialSection } from "./social-section";

/** Modal lifecycle and save callbacks for creating or editing a scholar. */
export interface ScholarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
  scholarId?: string | null;
}

function isScholarModalTab(id: string): id is "general" | "main" | "review" {
  return id === "general" || id === "main" || id === "review";
}

function changedScholarField(
  isEditing: boolean,
  current: string | number | null | undefined,
  initial: string | number | null | undefined,
  filledInCreateMode: boolean,
): boolean {
  return isEditing ? current !== initial : filledInCreateMode;
}

function isNewScholarSlugChanged(state: FormState): boolean {
  if (state.isEditing) return false;
  return Boolean(state.slug);
}

function updateScholarName(value: string, state: FormState, dispatch: React.Dispatch<FormAction>) {
  dispatch({ type: "UPDATE_FIELD", field: "name", value });
  if (!state.isEditing && !state.slug) {
    dispatch({ type: "UPDATE_FIELD", field: "slug", value: slugify(value) });
  }
}

function shouldShowScholarTabError(
  errorTabs: Set<string>,
  activeTab: string,
  tab: string,
  error: string | null,
): boolean {
  return Boolean(error && (errorTabs.has(tab) || activeTab === tab));
}

function getChangedScholarFields(state: FormState) {
  return {
    ...getBasicScholarFields(state),
    ...getSocialScholarFields(state),
  };
}

function getBasicScholarFields(state: FormState) {
  const initial = state.initialSnapshot;
  return {
    name: changedScholarField(state.isEditing, state.name, initial?.name, !!state.name),
    slug: isNewScholarSlugChanged(state),
    bio: changedScholarField(state.isEditing, state.bio, initial?.bio, !!state.bio),
    title: changedScholarField(state.isEditing, state.title, initial?.title, !!state.title),
    country: changedScholarField(state.isEditing, state.country, initial?.country, !!state.country),
    orderIndex: changedScholarField(
      state.isEditing,
      state.orderIndex,
      initial?.orderIndex,
      state.orderIndex !== 999,
    ),
  };
}

function getSocialScholarFields(state: FormState) {
  const initial = state.initialSnapshot;
  return {
    socialTwitter: changedScholarField(
      state.isEditing,
      state.socialTwitter,
      initial?.socialTwitter,
      !!state.socialTwitter,
    ),
    socialTelegram: changedScholarField(
      state.isEditing,
      state.socialTelegram,
      initial?.socialTelegram,
      !!state.socialTelegram,
    ),
    socialYoutube: changedScholarField(
      state.isEditing,
      state.socialYoutube,
      initial?.socialYoutube,
      !!state.socialYoutube,
    ),
    socialWebsite: changedScholarField(
      state.isEditing,
      state.socialWebsite,
      initial?.socialWebsite,
      !!state.socialWebsite,
    ),
  };
}

function ScholarLoadingModal({
  isOpen,
  onClose,
  fetchError,
  t,
}: {
  isOpen: boolean;
  onClose: () => void;
  /** Error returned while loading the existing scholar being edited. */
  fetchError: string | null;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("admin.scholars.editScholar", "Edit Scholar")}
      size="xl"
    >
      <div className={styles.loading}>{t("common.loading", "Loading...")}</div>
      {fetchError && <div className={styles.error}>{fetchError}</div>}
    </Modal>
  );
}

type ScholarModalFooterProps = {
  activeTab: string;
  saving: boolean;
  isEditing: boolean;
  onClose: () => void;
  onReview: () => void;
  t: ReturnType<typeof useTranslation>["t"];
};

function ScholarModalFooter({
  activeTab,
  saving,
  isEditing,
  onClose,
  onReview,
  t,
}: ScholarModalFooterProps) {
  return (
    <DialogFooter>
      <Button variant="outline" size="sm" onClick={onClose} disabled={saving}>
        {t("common.cancel", "Cancel")}
      </Button>
      {activeTab === "review" ? (
        <Button type="submit" form="scholar-form" variant="primary" loading={saving}>
          {saving
            ? t("admin.access.saving", "Saving…")
            : isEditing
              ? t("admin.scholars.saveChanges", "Save Changes")
              : t("admin.scholars.addScholar", "Add Scholar")}
        </Button>
      ) : (
        <Button type="button" variant="primary" onClick={onReview}>
          {t("admin.modal.reviewTab", "Review")}
        </Button>
      )}
    </DialogFooter>
  );
}

function ScholarFormTabs({
  state,
  dispatch,
  activeTab,
  errorTabs,
  changedFields,
  onImageStaged,
  onNameChange,
  onTabChange,
  t,
}: {
  /** Current reducer-backed scholar values rendered by the active tab. */
  state: FormState;
  dispatch: React.Dispatch<FormAction>;
  activeTab: string;
  /** Tabs containing validation errors, used to guide the editor to fixes. */
  errorTabs: string[];
  changedFields: ReturnType<typeof getChangedScholarFields>;
  onImageStaged: (file: File | null, preview: string | null) => void;
  onNameChange: (value: string) => void;
  onTabChange: (id: string) => void;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  const errorTabSet = new Set(errorTabs);

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="min-h-0">
      <TabsList
        className="no-scrollbar w-full justify-start overflow-x-auto overflow-y-hidden"
        aria-label={t("admin.modal.tabsLabel", "Form sections")}
      >
        <TabsTrigger
          value="general"
          aria-invalid={errorTabs.includes("general") || undefined}
          onClick={() => onTabChange("general")}
        >
          {t("admin.modal.generalTab", "General")}
        </TabsTrigger>
        <TabsTrigger
          value="main"
          aria-invalid={errorTabs.includes("main") || undefined}
          onClick={() => onTabChange("main")}
        >
          {
            // SAFETY: scholar main language is constrained to the same locale domain used by locale labels.
            getLocaleLabel(state.mainLanguage as Locale)
          }
        </TabsTrigger>
        <TabsTrigger value="review" onClick={() => onTabChange("review")}>
          {t("admin.modal.reviewTab", "Review")}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="general">
        {shouldShowScholarTabError(errorTabSet, activeTab, "general", state.error) && (
          <div className={styles.error}>{state.error}</div>
        )}
        <GeneralDataSection
          formData={state}
          dispatch={dispatch}
          onImageStaged={onImageStaged}
          isEditing={state.isEditing}
        />
        <LocationSection formData={state} dispatch={dispatch} />
        <SocialSection formData={state} dispatch={dispatch} />
        <SettingsSection formData={state} dispatch={dispatch} />
      </TabsContent>
      <TabsContent value="main">
        {shouldShowScholarTabError(errorTabSet, activeTab, "main", state.error) && (
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
              onChange={onNameChange}
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
  );
}

/** Coordinates scholar loading, tabbed editing, validation, and persistence. */
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

  const changedFields = getChangedScholarFields(state);

  const handleImageStaged = (file: File | null, preview: string | null) => {
    dispatch({ type: "SET_STAGED_IMAGE", file, preview });
    if (file && preview) {
      dispatch({ type: "UPDATE_FIELD", field: "imageUrl", value: preview });
    }
  };

  const handleSubmit = useSaveScholar(state, dispatch, onSuccess, onClose, setErrorTabs);

  if (!state.isEditing && loading) {
    return (
      <ScholarLoadingModal isOpen={isOpen} onClose={handleClose} fetchError={fetchError} t={t} />
    );
  }

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

        <form id="scholar-form" onSubmit={handleSubmit} className={`${styles.form} min-h-0 flex-1`}>
          <ScholarFormTabs
            state={state}
            dispatch={dispatch}
            activeTab={activeTab}
            errorTabs={errorTabs}
            changedFields={changedFields}
            onImageStaged={handleImageStaged}
            onNameChange={(value) => updateScholarName(value, state, dispatch)}
            onTabChange={(id) => {
              if (isScholarModalTab(id)) setActiveTab(id);
            }}
            t={t}
          />

          <ScholarModalFooter
            activeTab={activeTab}
            saving={state.saving}
            isEditing={state.isEditing}
            onClose={handleClose}
            onReview={() => setActiveTab("review")}
            t={t}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
