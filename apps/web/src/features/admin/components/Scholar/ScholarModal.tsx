"use client";

import { useReducer, useEffect, useState } from "react";
import { Modal } from "@/shared/components/Modal";
import type { CreateScholarDto } from "@sd/core-contracts";
import { sanitizeError } from "@sd/utils-error";
import { useTranslation } from "@/core/i18n/use-translation";
import { PersonalDataSection } from "./personal-data-section";
import { LocationSection } from "./location-section";
import { SocialSection } from "./social-section";
import { SettingsSection } from "./settings-section";
import { TranslationFieldsSection } from "./translation-fields-section";
import { ReviewSection } from "./review-section";
import { getPresignedUrl, uploadToR2 } from "@/features/admin/api/admin-lectures.api";
import styles from "./scholar-modal.module.css";

export interface ScholarForEdit {
  id: string;
  name: string;
  slug: string;
  bio?: string | null;
  imageUrl?: string | null;
  isActive?: boolean;
  country?: string | null;
  mainLanguage?: "en" | "ar" | null;
  socialTwitter?: string | null;
  socialTelegram?: string | null;
  socialYoutube?: string | null;
  socialWebsite?: string | null;
  title?: string | null;
}

export interface ScholarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    data: CreateScholarDto & {
      translations?: Record<string, { name?: string; bio?: string | null }>;
    },
  ) => Promise<void>;
  scholar?: ScholarForEdit | null;
}

interface FormState {
  formData: CreateScholarDto;
  translationChanges: Record<"en" | "ar", { name?: string; bio?: string }>;
  saving: boolean;
  error: string | null;
  stagedImageFile: File | null;
  stagedImagePreview: string | null;
}

export type FormAction =
  | { type: "INIT_FORM"; scholar: ScholarForEdit | null }
  | {
      type: "UPDATE_FIELD";
      field: keyof CreateScholarDto;
      value: string | boolean | Record<string, { name: string }> | undefined;
    }
  | { type: "UPDATE_TRANSLATION"; locale: "en" | "ar"; field: "name" | "bio"; value: string }
  | { type: "SET_SAVING"; saving: boolean }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "SET_STAGED_IMAGE"; file: File | null; preview: string | null };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "INIT_FORM":
      return {
        ...state,
        formData: getInitialFormData(action.scholar),
        translationChanges: { en: {}, ar: {} },
        error: null,
        stagedImageFile: null,
        stagedImagePreview: null,
      };
    case "UPDATE_FIELD":
      return {
        ...state,
        formData: { ...state.formData, [action.field]: action.value },
      };
    case "UPDATE_TRANSLATION":
      return {
        ...state,
        translationChanges: {
          ...state.translationChanges,
          [action.locale]: {
            ...state.translationChanges[action.locale],
            [action.field]: action.value,
          },
        },
      };
    case "SET_SAVING":
      return { ...state, saving: action.saving };
    case "SET_ERROR":
      return { ...state, error: action.error };
    case "SET_STAGED_IMAGE":
      return {
        ...state,
        stagedImageFile: action.file,
        stagedImagePreview: action.preview,
      };
    default:
      return state;
  }
}

function getInitialFormData(scholar: ScholarForEdit | null): CreateScholarDto {
  if (scholar) {
    return {
      name: scholar.name,
      slug: scholar.slug,
      bio: scholar.bio ?? "",
      imageUrl: scholar.imageUrl ?? "",
      isActive: scholar.isActive ?? true,
      country: (scholar.country ?? "") as CreateScholarDto["country"],
      mainLanguage: (scholar.mainLanguage ?? "ar") as "en" | "ar",
      title: (scholar.title ?? undefined) as CreateScholarDto["title"],
      socialTwitter: scholar.socialTwitter ?? "",
      socialTelegram: scholar.socialTelegram ?? "",
      socialYoutube: scholar.socialYoutube ?? "",
      socialWebsite: scholar.socialWebsite ?? "",
    };
  }
  return {
    name: "",
    slug: "",
    bio: "",
    imageUrl: "",
    isActive: true,
    country: "" as CreateScholarDto["country"],
    mainLanguage: "ar",
    socialTwitter: "",
    socialTelegram: "",
    socialYoutube: "",
    socialWebsite: "",
  };
}

const initialFormState: FormState = {
  formData: getInitialFormData(null),
  translationChanges: { en: {}, ar: {} },
  saving: false,
  error: null,
  stagedImageFile: null,
  stagedImagePreview: null,
};

export function ScholarModal({ isOpen, onClose, onSave, scholar }: ScholarModalProps) {
  const { t } = useTranslation();
  const isEditing = !!scholar;

  const [state, dispatch] = useReducer(formReducer, initialFormState);
  const [activeTab, setActiveTab] = useState<"en" | "ar" | "review">("ar");
  const { formData, translationChanges, saving, error, stagedImageFile, stagedImagePreview } =
    state;

  useEffect(() => {
    if (isOpen) {
      dispatch({ type: "INIT_FORM", scholar: scholar ?? null });
      setActiveTab((scholar?.mainLanguage as "en" | "ar") ?? "ar");
    }
  }, [isOpen, scholar]);

  const handleImageStaged = (file: File | null, preview: string | null) => {
    dispatch({ type: "SET_STAGED_IMAGE", file, preview });
    if (file && preview) {
      dispatch({ type: "UPDATE_FIELD", field: "imageUrl", value: preview });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.slug.trim()) {
      dispatch({
        type: "SET_ERROR",
        error: t("admin.scholars.nameSlugRequired", "Name and slug are required"),
      });
      return;
    }
    dispatch({ type: "SET_SAVING", saving: true });
    dispatch({ type: "SET_ERROR", error: null });
    try {
      const payloadData = { ...formData };

      // Add translations if the non-main locale has content
      const otherLocale = formData.mainLanguage === "en" ? "ar" : "en";
      const translation = translationChanges[otherLocale];
      if (translation.name || translation.bio) {
        payloadData.translations = {
          [otherLocale]: {
            name: translation.name,
            bio: translation.bio || null,
          },
        };
      }

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
      onClose={onClose}
      title={
        isEditing
          ? t("admin.scholars.editScholar", "Edit Scholar")
          : t("admin.scholars.addScholar", "Add Scholar")
      }
      size="xl"
      width="var(--modal-width-wide)"
      multiTab
      requireReview
      activeTab={activeTab}
      onActiveTabChange={setActiveTab}
      defaultActiveTab={formData.mainLanguage ?? "ar"}
      saveFormId="scholar-form"
      saving={saving}
      reviewTabId="review"
      saveLabel={
        isEditing
          ? t("admin.scholars.saveChanges", "Save Changes")
          : t("admin.scholars.addScholar", "Add Scholar")
      }
    >
      <form id="scholar-form" onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}

        <Modal.Tabs>
          <Modal.TabItem id="en">English</Modal.TabItem>
          <Modal.TabItem id="ar">العربية</Modal.TabItem>
          <Modal.TabItem id="review">{t("admin.modal.reviewTab", "Review")}</Modal.TabItem>
        </Modal.Tabs>

        <Modal.Content>
          <Modal.ContentItem id="en">
            {formData.mainLanguage === "en" ? (
              <>
                <PersonalDataSection
                  formData={formData}
                  dispatch={dispatch}
                  isEditing={isEditing}
                  onImageStaged={handleImageStaged}
                />
                <LocationSection formData={formData} dispatch={dispatch} />
                <SocialSection formData={formData} dispatch={dispatch} />
                <SettingsSection formData={formData} dispatch={dispatch} />
              </>
            ) : (
              <TranslationFieldsSection
                locale="en"
                name={translationChanges.en.name ?? ""}
                bio={translationChanges.en.bio}
                onNameChange={(value) =>
                  dispatch({ type: "UPDATE_TRANSLATION", locale: "en", field: "name", value })
                }
                onBioChange={(value) =>
                  dispatch({ type: "UPDATE_TRANSLATION", locale: "en", field: "bio", value })
                }
              />
            )}
          </Modal.ContentItem>

          <Modal.ContentItem id="ar">
            {formData.mainLanguage === "ar" ? (
              <>
                <PersonalDataSection
                  formData={formData}
                  dispatch={dispatch}
                  isEditing={isEditing}
                  onImageStaged={handleImageStaged}
                />
                <LocationSection formData={formData} dispatch={dispatch} />
                <SocialSection formData={formData} dispatch={dispatch} />
                <SettingsSection formData={formData} dispatch={dispatch} />
              </>
            ) : (
              <TranslationFieldsSection
                locale="ar"
                name={translationChanges.ar.name ?? ""}
                bio={translationChanges.ar.bio}
                onNameChange={(value) =>
                  dispatch({ type: "UPDATE_TRANSLATION", locale: "ar", field: "name", value })
                }
                onBioChange={(value) =>
                  dispatch({ type: "UPDATE_TRANSLATION", locale: "ar", field: "bio", value })
                }
              />
            )}
          </Modal.ContentItem>

          <Modal.ContentItem id="review">
            <ReviewSection
              formData={formData}
              mainLanguageName={formData.mainLanguage === "en" ? "English" : "العربية"}
              translationName={
                translationChanges[formData.mainLanguage === "en" ? "ar" : "en"].name
              }
              translationBio={translationChanges[formData.mainLanguage === "en" ? "ar" : "en"].bio}
              stagedImagePreview={stagedImagePreview}
            />
          </Modal.ContentItem>
        </Modal.Content>
      </form>
    </Modal>
  );
}
