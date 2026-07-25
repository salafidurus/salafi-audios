import type { Locale, ScholarFormDataDto, ScholarTitle, CountryCode } from "@sd/core-contracts";
import { useReducer } from "react";

export type FormState = {
  // Immutable fields (edit mode only)
  id?: string;

  // Mutable fields
  name: string;
  slug: string;
  bio: string;
  imageUrl: string;
  isActive: boolean;
  title?: ScholarTitle;
  country?: CountryCode;
  mainLanguage: Locale;
  socialTwitter?: string;
  socialTelegram?: string;
  socialYoutube?: string;
  socialWebsite?: string;
  orderIndex: number;

  // Form state
  translationChanges: Partial<Record<Locale, { name?: string; bio?: string | null }>>;
  initialTranslationChanges: Partial<Record<Locale, { name?: string; bio?: string | null }>>;
  saving: boolean;
  error: string | null;
  isEditing: boolean;

  // For file staging
  stagedImageFile: File | null;
  stagedImagePreview: string | null;
};

type UpdatableField = keyof Omit<FormState, "isEditing" | "stagedImageFile" | "stagedImagePreview">;

type UpdateFieldAction = {
  [K in UpdatableField]: { type: "UPDATE_FIELD"; field: K; value: FormState[K] };
}[UpdatableField];

export type FormAction =
  | UpdateFieldAction
  | { type: "UPDATE_TRANSLATION"; locale: Locale; field: "name" | "bio"; value: string | null }
  | { type: "INIT_FORM"; data: ScholarFormDataDto }
  | { type: "SET_SAVING"; saving: boolean }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "SET_STAGED_IMAGE"; file: File | null; preview: string | null };

const IMMUTABLE_FIELDS = ["slug"];

function getInitialFormState(): FormState {
  return {
    name: "",
    slug: "",
    bio: "",
    imageUrl: "",
    isActive: true,
    mainLanguage: "ar",
    orderIndex: 999,
    translationChanges: {},
    initialTranslationChanges: {},
    saving: false,
    error: null,
    isEditing: false,
    stagedImageFile: null,
    stagedImagePreview: null,
  };
}

function buildEditFormState(data: ScholarFormDataDto): FormState {
  const { scholar, translations } = data;
  const translationChanges: Partial<Record<Locale, { name?: string; bio?: string | null }>> = {};
  for (const trans of translations) {
    if (trans.locale !== scholar.mainLanguage) {
      translationChanges[trans.locale] = {
        name: trans.fields?.name ?? undefined,
        bio: trans.fields?.bio ?? undefined,
      };
    }
  }
  return {
    id: scholar.id,
    name: scholar.name || "",
    slug: scholar.slug || "",
    bio: scholar.bio || "",
    imageUrl: scholar.imageUrl || "",
    isActive: scholar.isActive !== undefined ? scholar.isActive : true,
    title: scholar.title,
    country: scholar.country,
    mainLanguage: (scholar.mainLanguage as Locale) || "ar",
    socialTwitter: scholar.socialTwitter,
    socialTelegram: scholar.socialTelegram,
    socialYoutube: scholar.socialYoutube,
    socialWebsite: scholar.socialWebsite,
    orderIndex: scholar.orderIndex || 999,
    translationChanges,
    initialTranslationChanges: translationChanges,
    saving: false,
    error: null,
    isEditing: true,
    stagedImageFile: null,
    stagedImagePreview: null,
  };
}

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "UPDATE_FIELD": {
      // If editing and field is immutable, ignore the update
      if (state.isEditing && IMMUTABLE_FIELDS.includes(action.field)) {
        return state;
      }
      return { ...state, [action.field]: action.value };
    }

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

    case "INIT_FORM":
      return buildEditFormState(action.data);

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

/**
 * Starts in create-mode state. Callers loading an existing scholar must fetch
 * the data themselves and dispatch INIT_FORM once it arrives — a lazy
 * useReducer initializer only runs at mount, before any async fetch resolves,
 * so it cannot be used to hydrate edit-mode data.
 */
export function useScholarForm() {
  const [state, dispatch] = useReducer(formReducer, undefined, getInitialFormState);
  return { state, dispatch };
}
