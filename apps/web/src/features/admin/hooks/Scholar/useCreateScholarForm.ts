import { useReducer } from "react";
import type { CreateScholarDto, Locale } from "@sd/core-contracts";

export type CreateFormState = {
  formData: CreateScholarDto;
  translationChanges: Partial<Record<Locale, { name?: string; bio?: string | null }>>;
  saving: boolean;
  error: string | null;
  stagedImageFile: File | null;
  stagedImagePreview: string | null;
};

export type CreateFormAction =
  | {
      type: "UPDATE_FIELD";
      field: keyof CreateScholarDto;
      value: string | number | boolean | Record<string, { name: string }> | undefined;
    }
  | { type: "UPDATE_TRANSLATION"; locale: Locale; field: "name" | "bio"; value: string }
  | { type: "SET_SAVING"; saving: boolean }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "SET_STAGED_IMAGE"; file: File | null; preview: string | null };

function getInitialFormData(): CreateScholarDto {
  return {
    name: "",
    slug: "",
    bio: "",
    imageUrl: "",
    isActive: true,
    country: "" as CreateScholarDto["country"],
    mainLanguage: "ar",
    title: "akh" as CreateScholarDto["title"],
    orderIndex: 999,
    socialTwitter: "",
    socialTelegram: "",
    socialYoutube: "",
    socialWebsite: "",
  };
}

function formReducer(state: CreateFormState, action: CreateFormAction): CreateFormState {
  switch (action.type) {
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

function initFormState(): CreateFormState {
  const formData = getInitialFormData();
  return {
    formData,
    translationChanges: {},
    saving: false,
    error: null,
    stagedImageFile: null,
    stagedImagePreview: null,
  };
}

export function useCreateScholarForm() {
  const [state, dispatch] = useReducer(formReducer, undefined, initFormState);
  return { state, dispatch };
}
