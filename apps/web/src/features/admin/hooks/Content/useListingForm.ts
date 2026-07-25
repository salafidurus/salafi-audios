import type { Locale, ListingFormDataDto } from "@sd/core-contracts";
import { useReducer } from "react";
import { validateLectureStatus, type LectureStatus } from "@/shared/types/form-types";

export type FormState = {
  // Immutable fields (edit mode only)
  id?: string;
  scholarName?: string;

  // Mutable fields
  title: string;
  slug: string;
  description: string;
  scholarId: string;
  format: "single" | "series" | "collection";
  status: LectureStatus;
  orderIndex: number;
  selectedTopics: string[];
  language: Locale;
  coverImageUrl: string;

  // Form state
  translationChanges: Partial<Record<Locale, { title?: string; description?: string }>>;
  initialTranslationChanges: Partial<Record<Locale, { title?: string; description?: string }>>;
  saving: boolean;
  formError: string | null;
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
  | { type: "UPDATE_TRANSLATION"; locale: Locale; field: "title" | "description"; value: string }
  | { type: "INIT_FORM"; data: ListingFormDataDto }
  | { type: "SET_SAVING"; saving: boolean }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "SET_STAGED_IMAGE"; file: File | null; preview: string | null };

const IMMUTABLE_FIELDS = ["slug", "scholarId", "format"];

function getInitialFormState(): FormState {
  return {
    title: "",
    slug: "",
    description: "",
    scholarId: "",
    format: "single",
    status: "draft",
    orderIndex: 0,
    selectedTopics: [],
    language: "ar",
    coverImageUrl: "",
    translationChanges: {},
    initialTranslationChanges: {},
    saving: false,
    formError: null,
    isEditing: false,
    stagedImageFile: null,
    stagedImagePreview: null,
  };
}

function buildEditFormState(data: ListingFormDataDto): FormState {
  const { listing, translations } = data;
  const translationChanges: Partial<Record<Locale, { title?: string; description?: string }>> = {};
  for (const trans of translations) {
    if (trans.locale !== listing.language) {
      translationChanges[trans.locale] = {
        title: trans.fields?.title ?? undefined,
        description: trans.fields?.description ?? undefined,
      };
    }
  }
  return {
    id: listing.id,
    scholarName: listing.scholarName,
    title: listing.title || "",
    slug: listing.slug || "",
    description: listing.description || "",
    scholarId: listing.scholarId || "",
    format: (listing.format as "single" | "series" | "collection") || "single",
    status: (listing.status as LectureStatus) || "draft",
    orderIndex: listing.orderIndex || 0,
    selectedTopics: listing.topics || [],
    language: (listing.language as Locale) || "ar",
    coverImageUrl: listing.coverImageUrl || "",
    translationChanges,
    initialTranslationChanges: translationChanges,
    saving: false,
    formError: null,
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
      return { ...state, formError: action.error };

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
 * Starts in create-mode state. Callers loading an existing listing must fetch
 * the data themselves and dispatch INIT_FORM once it arrives — a lazy
 * useReducer initializer only runs at mount, before any async fetch resolves,
 * so it cannot be used to hydrate edit-mode data.
 */
export function useListingForm() {
  const [state, dispatch] = useReducer(formReducer, undefined, getInitialFormState);
  return { state, dispatch };
}
