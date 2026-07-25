import { useReducer } from "react";
import type { UpdateScholarDto, ScholarFormDataDto, Locale } from "@sd/core-contracts";

export type EditFormState = {
  // Immutable fields (never part of UPDATE DTO)
  id: string;
  slug: string;
  // Editable fields
  formData: UpdateScholarDto;
  initialFormData: UpdateScholarDto;
  translationChanges: Partial<Record<Locale, { name?: string; bio?: string | null }>>;
  initialTranslationChanges: Partial<Record<Locale, { name?: string; bio?: string | null }>>;
  saving: boolean;
  error: string | null;
  stagedImageFile: File | null;
  stagedImagePreview: string | null;
};

export type EditFormAction =
  | { type: "INIT_FORM"; data: ScholarFormDataDto }
  | {
      type: "UPDATE_FIELD";
      field: keyof UpdateScholarDto;
      value: string | number | boolean | Record<string, { name: string }> | undefined;
    }
  | { type: "UPDATE_TRANSLATION"; locale: Locale; field: "name" | "bio"; value: string }
  | { type: "SET_SAVING"; saving: boolean }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "SET_STAGED_IMAGE"; file: File | null; preview: string | null };

function formReducer(state: EditFormState, action: EditFormAction): EditFormState {
  switch (action.type) {
    case "INIT_FORM": {
      const { scholar, translations } = action.data;
      const formData: UpdateScholarDto = {
        name: scholar.name,
        bio: scholar.bio ?? "",
        imageUrl: scholar.imageUrl ?? "",
        isActive: scholar.isActive ?? true,
        country: (scholar.country ?? "") as UpdateScholarDto["country"],
        mainLanguage: (scholar.mainLanguage ?? "ar") as Locale,
        title: (scholar.title ?? undefined) as UpdateScholarDto["title"],
        orderIndex: scholar.orderIndex ?? 999,
        socialTwitter: scholar.socialTwitter ?? "",
        socialTelegram: scholar.socialTelegram ?? "",
        socialYoutube: scholar.socialYoutube ?? "",
        socialWebsite: scholar.socialWebsite ?? "",
      };

      // Map translations array to translationChanges Record, excluding mainLanguage
      const translationChanges: Partial<Record<Locale, { name?: string; bio?: string | null }>> =
        {};
      for (const trans of translations) {
        if (trans.locale !== formData.mainLanguage) {
          translationChanges[trans.locale] = {
            name: trans.fields?.name ?? undefined,
            bio: trans.fields?.bio ?? undefined,
          };
        }
      }

      return {
        ...state,
        id: scholar.id,
        slug: scholar.slug,
        formData,
        initialFormData: formData,
        translationChanges,
        initialTranslationChanges: translationChanges,
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

function initFormState(data: ScholarFormDataDto): EditFormState {
  const { scholar, translations } = data;
  const formData: UpdateScholarDto = {
    name: scholar.name,
    bio: scholar.bio ?? "",
    imageUrl: scholar.imageUrl ?? "",
    isActive: scholar.isActive ?? true,
    country: (scholar.country ?? "") as UpdateScholarDto["country"],
    mainLanguage: (scholar.mainLanguage ?? "ar") as Locale,
    title: (scholar.title ?? undefined) as UpdateScholarDto["title"],
    orderIndex: scholar.orderIndex ?? 999,
    socialTwitter: scholar.socialTwitter ?? "",
    socialTelegram: scholar.socialTelegram ?? "",
    socialYoutube: scholar.socialYoutube ?? "",
    socialWebsite: scholar.socialWebsite ?? "",
  };

  const translationChanges: Partial<Record<Locale, { name?: string; bio?: string | null }>> = {};
  for (const trans of translations) {
    if (trans.locale !== formData.mainLanguage) {
      translationChanges[trans.locale] = {
        name: trans.fields?.name ?? undefined,
        bio: trans.fields?.bio ?? undefined,
      };
    }
  }

  return {
    id: scholar.id,
    slug: scholar.slug,
    formData,
    initialFormData: formData,
    translationChanges,
    initialTranslationChanges: translationChanges,
    saving: false,
    error: null,
    stagedImageFile: null,
    stagedImagePreview: null,
  };
}

export function useEditScholarForm(data: ScholarFormDataDto) {
  const [state, dispatch] = useReducer(formReducer, data, initFormState);
  return { state, dispatch };
}
