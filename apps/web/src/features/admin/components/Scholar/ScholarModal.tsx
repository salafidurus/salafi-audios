"use client";

import { useReducer, useEffect, useState } from "react";
import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/components/Button";
import type { CreateScholarDto } from "@sd/core-contracts";
import { sanitizeError } from "@sd/utils-error";
import { useTranslation } from "@/core/i18n/use-translation";
import { LanguageBar } from "./language-bar";
import { PersonalDataSection } from "./personal-data-section";
import { LocationSection } from "./location-section";
import { SocialSection } from "./social-section";
import { SettingsSection } from "./settings-section";
import { getPresignedUrl, uploadToR2 } from "@/features/admin/api/admin-lectures.api";
import styles from "./scholar-modal.module.css";

export interface ScholarForEdit {
  id: string;
  name: string;
  slug: string;
  bio?: string | null;
  imageUrl?: string | null;
  isKibar?: boolean;
  isFeatured?: boolean;
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
  onSave: (data: CreateScholarDto) => Promise<void>;
  scholar?: ScholarForEdit | null;
}

interface FormState {
  formData: CreateScholarDto;
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
  | { type: "SET_SAVING"; saving: boolean }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "SET_STAGED_IMAGE"; file: File | null; preview: string | null };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "INIT_FORM":
      return {
        ...state,
        formData: getInitialFormData(action.scholar),
        error: null,
        stagedImageFile: null,
        stagedImagePreview: null,
      };
    case "UPDATE_FIELD":
      return {
        ...state,
        formData: { ...state.formData, [action.field]: action.value },
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
  saving: false,
  error: null,
  stagedImageFile: null,
  stagedImagePreview: null,
};

export function ScholarModal({ isOpen, onClose, onSave, scholar }: ScholarModalProps) {
  const { t } = useTranslation();
  const isEditing = !!scholar;

  const [state, dispatch] = useReducer(formReducer, initialFormState);
  const [activeLocale, setActiveLocale] = useState<"en" | "ar">("ar");
  const { formData, saving, error, stagedImageFile, stagedImagePreview } = state;

  useEffect(() => {
    if (isOpen) {
      dispatch({ type: "INIT_FORM", scholar: scholar ?? null });
      setActiveLocale((scholar?.mainLanguage as "en" | "ar") ?? "ar");
    }
  }, [isOpen, scholar]);

  const handleImageStaged = (file: File | null, preview: string | null) => {
    dispatch({ type: "SET_STAGED_IMAGE", file, preview });
    if (file && preview) {
      // Update the imageUrl temporarily to show the preview
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

        // Update imageUrl to the public URL from presigned response
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
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
            {t("common.cancel", "Cancel")}
          </Button>
          <Button type="submit" variant="primary" loading={saving} form="scholar-form">
            {isEditing
              ? t("admin.scholars.saveChanges", "Save Changes")
              : t("admin.scholars.addScholar", "Add Scholar")}
          </Button>
        </>
      }
    >
      <form id="scholar-form" onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}

        <LanguageBar
          mainLanguage={formData.mainLanguage}
          activeLocale={activeLocale}
          onLocaleChange={setActiveLocale}
        />

        <PersonalDataSection
          formData={formData}
          dispatch={dispatch}
          isEditing={isEditing}
          onImageStaged={handleImageStaged}
        />
        <LocationSection formData={formData} dispatch={dispatch} />
        <SocialSection formData={formData} dispatch={dispatch} />
        <SettingsSection formData={formData} dispatch={dispatch} />
      </form>
    </Modal>
  );
}
