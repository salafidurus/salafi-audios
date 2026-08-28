import type { Locale, ScholarFormDataDto, ScholarTitle, CountryCode } from "@sd/core-contracts";

import { useReducer } from "react";

/** Documents this module's responsibility and public boundary. */
export type ScholarChangeSnapshot = {
  name: string;
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
};

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
  // Snapshot of the mutable fields as fetched, for diffing in the review tab. Null in create mode.
  initialSnapshot: ScholarChangeSnapshot | null;
  saving: boolean;
  error: string | null;
  isEditing: boolean;

  // For file staging
  stagedImageFile: File | null;
  stagedImagePreview: string | null;
};

type UpdatableField = keyof Omit<
  FormState,
  "isEditing" | "stagedImageFile" | "stagedImagePreview" | "initialSnapshot"
>;

type UpdateFieldAction = {
  [K in UpdatableField]: { type: "UPDATE_FIELD"; field: K; value: FormState[K] };
}[UpdatableField];

export type FormAction =
  | UpdateFieldAction
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
    initialSnapshot: null,
    saving: false,
    error: null,
    isEditing: false,
    stagedImageFile: null,
    stagedImagePreview: null,
  };
}

function buildEditFormState(data: ScholarFormDataDto): FormState {
  const { scholar } = data;
  const { name, bio, imageUrl, isActive, mainLanguage, orderIndex } =
    normalizeScholarEditValues(scholar);

  return {
    id: scholar.id,
    name,
    slug: scholar.slug || "",
    bio,
    imageUrl,
    isActive,
    title: scholar.title,
    country: scholar.country,
    mainLanguage,
    socialTwitter: scholar.socialTwitter,
    socialTelegram: scholar.socialTelegram,
    socialYoutube: scholar.socialYoutube,
    socialWebsite: scholar.socialWebsite,
    orderIndex,
    initialSnapshot: {
      name,
      bio,
      imageUrl,
      isActive,
      title: scholar.title,
      country: scholar.country,
      mainLanguage,
      socialTwitter: scholar.socialTwitter,
      socialTelegram: scholar.socialTelegram,
      socialYoutube: scholar.socialYoutube,
      socialWebsite: scholar.socialWebsite,
      orderIndex,
    },
    saving: false,
    error: null,
    isEditing: true,
    stagedImageFile: null,
    stagedImagePreview: null,
  };
}

function normalizeScholarEditValues(scholar: ScholarFormDataDto["scholar"]) {
  // SAFETY: scholar form data is hydrated from the same locale union used by the editor.
  return {
    name: scholar.name || "",
    bio: scholar.bio || "",
    imageUrl: scholar.imageUrl || "",
    isActive: scholar.isActive !== undefined ? scholar.isActive : true,
    mainLanguage: (scholar.mainLanguage as Locale) || "ar",
    orderIndex: scholar.orderIndex || 999,
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
