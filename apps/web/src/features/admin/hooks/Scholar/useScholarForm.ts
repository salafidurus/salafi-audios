import { useReducer } from "react";
import type { CreateScholarDto } from "@sd/core-contracts";
import type { ScholarForEdit } from "../components/Scholar/ScholarModal";

export type FormState = {
  formData: CreateScholarDto;
  initialFormData: CreateScholarDto;
  translationChanges: Record<"en" | "ar", { name?: string; bio?: string | null }>;
  saving: boolean;
  error: string | null;
  stagedImageFile: File | null;
  stagedImagePreview: string | null;
};

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

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "INIT_FORM": {
      const initialData = getInitialFormData(action.scholar);
      return {
        ...state,
        formData: initialData,
        initialFormData: initialData,
        translationChanges: { en: {}, ar: {} },
        error: null,
        stagedImageFile: null,
        stagedImagePreview: null,
      };
    }
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

function initFormState(scholar: ScholarForEdit | null): FormState {
  const formData = getInitialFormData(scholar);
  return {
    formData,
    initialFormData: formData,
    translationChanges: { en: {}, ar: {} },
    saving: false,
    error: null,
    stagedImageFile: null,
    stagedImagePreview: null,
  };
}

export function useScholarForm(scholar: ScholarForEdit | null) {
  const [state, dispatch] = useReducer(formReducer, scholar ?? null, initFormState);
  return { state, dispatch };
}
