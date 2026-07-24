import { useReducer } from "react";
import type {
  AdminListingDetailDto,
  ListingFormDataDto,
  Locale,
  ListingFormat,
} from "@sd/core-contracts";
import { validateLectureStatus, type LectureStatus } from "@/shared/types/form-types";

export type FormState = {
  title: string;
  slug: string;
  description: string;
  scholarId: string;
  format: ListingFormat;
  parentRef?: { id: string; title: string; format: ListingFormat };
  status: LectureStatus;
  orderIndex: number;
  selectedTopics: string[];
  language: Locale;
  translationChanges: Partial<Record<Locale, { title?: string; description?: string }>>;
  initialTranslationChanges: Partial<Record<Locale, { title?: string; description?: string }>>;
  saving: boolean;
  formError: string | null;
};

export type FormAction =
  | { type: "UPDATE_FIELD"; field: keyof FormState; value: any }
  | { type: "UPDATE_TRANSLATION"; locale: Locale; field: "title" | "description"; value: string }
  | { type: "SET_SAVING"; saving: boolean }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "INIT_STATE"; state: FormState }
  | { type: "INIT_STATE"; data: ListingFormDataDto };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "UPDATE_FIELD":
      return { ...state, [action.field]: action.value };
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
      return { ...state, formError: action.error };
    case "INIT_STATE": {
      if ("data" in action && action.data) {
        // New pattern: initialize from fetched ListingFormDataDto
        const { listing, translations } = action.data;
        const newState: FormState = {
          title: listing.title,
          slug: listing.slug,
          description: listing.description || "",
          scholarId: listing.scholarId,
          format: listing.format as ListingFormat,
          ...(listing.parentRef && { parentRef: listing.parentRef }),
          status: validateLectureStatus(listing.status),
          orderIndex: listing.orderIndex || 0,
          selectedTopics: listing.topics || [],
          language: (listing.language as Locale) || "ar",
          saving: false,
          formError: null,
          translationChanges: {},
          initialTranslationChanges: {},
        };

        // Map translations array to translationChanges Record, excluding mainLanguage
        for (const trans of translations) {
          if (trans.locale !== newState.language) {
            newState.translationChanges[trans.locale] = {
              title: trans.fields?.title ?? undefined,
              description: trans.fields?.description ?? undefined,
            };
            newState.initialTranslationChanges[trans.locale] = {
              title: trans.fields?.title ?? undefined,
              description: trans.fields?.description ?? undefined,
            };
          }
        }

        return newState;
      } else if ("state" in action) {
        // Old pattern: initialize from FormState
        return action.state;
      }
      return state;
    }
    default:
      return state;
  }
}

export function getInitialFormData(
  listing: AdminListingDetailDto | null | undefined,
  initialAudioData?: { filename: string } | null,
): FormState {
  if (listing) {
    return {
      title: listing.title,
      slug: listing.slug,
      description: listing.description || "",
      scholarId: listing.scholarId,
      format: listing.format as ListingFormat,
      ...(listing.parentRef && { parentRef: listing.parentRef }),
      status: validateLectureStatus(listing.status),
      orderIndex: listing.orderIndex || 0,
      selectedTopics: listing.topics || [],
      language: (listing.language as Locale) || "ar",
      translationChanges: {},
      initialTranslationChanges: {},
      saving: false,
      formError: null,
    };
  }
  return {
    title: initialAudioData?.filename.replace(/\.[^/.]+$/, "") || "",
    slug: "",
    description: "",
    scholarId: "",
    format: "single" as const,
    status: "draft",
    orderIndex: 0,
    selectedTopics: [],
    language: "ar",
    translationChanges: {},
    initialTranslationChanges: {},
    saving: false,
    formError: null,
  };
}

export function useListingForm(
  listing: AdminListingDetailDto | null | undefined,
  initialAudioData?: { filename: string } | null,
) {
  const [state, dispatch] = useReducer(formReducer, listing ?? null, (arg) =>
    getInitialFormData(arg, initialAudioData),
  );
  return { state, dispatch };
}
