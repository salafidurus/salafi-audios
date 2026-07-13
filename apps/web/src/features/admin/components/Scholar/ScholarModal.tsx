"use client";

import { useReducer, useEffect } from "react";
import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/components/Button";
import type { CreateScholarDto } from "@sd/core-contracts";
import { sanitizeError } from "@sd/utils-error";
import { BasicInfoSection } from "./basic-info-section";
import { LocationSection } from "./location-section";
import { SocialSection } from "./social-section";
import { SettingsSection } from "./settings-section";
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
  imageLoading: boolean;
  imageError: boolean;
}

export type FormAction =
  | { type: "INIT_FORM"; scholar: ScholarForEdit | null }
  | { type: "UPDATE_FIELD"; field: keyof CreateScholarDto; value: string | boolean }
  | { type: "SET_SAVING"; saving: boolean }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "SET_IMAGE_LOADING"; loading: boolean }
  | { type: "SET_IMAGE_ERROR"; error: boolean };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "INIT_FORM":
      return {
        ...state,
        formData: getInitialFormData(action.scholar),
        error: null,
        imageLoading: false,
        imageError: false,
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
    case "SET_IMAGE_LOADING":
      return { ...state, imageLoading: action.loading };
    case "SET_IMAGE_ERROR":
      return { ...state, imageError: action.error };
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
      isKibar: scholar.isKibar ?? false,
      isFeatured: scholar.isFeatured ?? false,
      isActive: scholar.isActive ?? true,
      country: (scholar.country ?? "") as CreateScholarDto["country"],
      mainLanguage: (scholar.mainLanguage ?? "ar") as "en" | "ar",
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
    isKibar: false,
    isFeatured: false,
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
  imageLoading: false,
  imageError: false,
};

export function ScholarModal({ isOpen, onClose, onSave, scholar }: ScholarModalProps) {
  const isEditing = !!scholar;

  const [state, dispatch] = useReducer(formReducer, initialFormState);
  const { formData, saving, error, imageLoading, imageError } = state;

  useEffect(() => {
    if (isOpen) {
      dispatch({ type: "INIT_FORM", scholar: scholar ?? null });
    }
  }, [isOpen, scholar]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.slug.trim()) {
      dispatch({ type: "SET_ERROR", error: "Name and slug are required" });
      return;
    }
    dispatch({ type: "SET_SAVING", saving: true });
    dispatch({ type: "SET_ERROR", error: null });
    try {
      await onSave(formData);
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
      title={isEditing ? "Edit Scholar" : "Add Scholar"}
      size="xl"
      width="80rem"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={saving} form="scholar-form">
            {isEditing ? "Save Changes" : "Add Scholar"}
          </Button>
        </>
      }
    >
      <form id="scholar-form" onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}

        <BasicInfoSection
          formData={formData}
          dispatch={dispatch}
          isEditing={isEditing}
          imageLoading={imageLoading}
          imageError={imageError}
        />
        <LocationSection formData={formData} dispatch={dispatch} />
        <SocialSection formData={formData} dispatch={dispatch} />
        <SettingsSection formData={formData} dispatch={dispatch} />
      </form>
    </Modal>
  );
}
