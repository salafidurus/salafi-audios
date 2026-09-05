import type { Locale, TranslationStatus, TranslationViewDto } from "@sd/core-contracts";

import { useReducer } from "react";

/** Stores nullable field values while preserving the sparse shape of one locale's translation draft. */
export type TranslationFieldsRecord = Record<string, string | null>;

/** Lifecycle states for loading the source entity and its translations. */
export type TranslationFormLifecycle = "loading" | "ready" | "error";

/** Reducer state for source values, locale drafts, and save feedback. */
export interface TranslationFormState {
  /** Whether the form is still loading, ready for editing, or failed to load. */
  status: TranslationFormLifecycle;
  entityId: string | null;
  mainLocale: Locale;
  /** Read-only main-language values, keyed by field name. */
  source: TranslationFieldsRecord;
  /** Last-saved (or freshly-fetched) values per secondary locale, for diffing. */
  initial: Partial<Record<Locale, TranslationFieldsRecord>>;
  /** In-progress edits per secondary locale — only touched fields are present. */
  edits: Partial<Record<Locale, Record<string, string>>>;
  /** draft/published per locale (absent = not created yet, or entity doesn't track status). */
  translationStatus: Partial<Record<Locale, TranslationStatus>>;
  saving: boolean;
  /** Last load/save error shown to the editor, if any. */
  error: string | null;
}

/** Actions that initialize, edit, persist, or report errors for the form. */
export type TranslationFormAction =
  | {
      type: "INIT";
      entityId: string;
      mainLocale: Locale;
      /** Read-only source fields used as the translation reference. */
      source: TranslationFieldsRecord;
      translations: TranslationViewDto[];
    }
  | { type: "EDIT_FIELD"; locale: Locale; field: string; value: string }
  | {
      type: "SET_STATUS";
      locale: Locale;
      /** Publication state to associate with the selected locale. */
      status: TranslationStatus;
    }
  | {
      type: "MARK_INITIAL";
      locale: Locale;
      /** The fields that were just successfully saved — populates initial[locale]
       *  so that canPublish becomes true without a close/reopen cycle. */
      fields: TranslationFieldsRecord;
    }
  | { type: "SET_SAVING"; saving: boolean }
  | {
      type: "SET_ERROR";
      /** Load or save failure detail; null clears the current error. */
      error: string | null;
    };

function getInitialState(): TranslationFormState {
  return {
    status: "loading",
    entityId: null,
    mainLocale: "ar",
    source: {},
    initial: {},
    edits: {},
    translationStatus: {},
    saving: false,
    error: null,
  };
}

function formReducer(
  state: TranslationFormState,
  action: TranslationFormAction,
): TranslationFormState {
  switch (action.type) {
    case "INIT": {
      const initial: Partial<Record<Locale, TranslationFieldsRecord>> = {};
      const translationStatus: Partial<Record<Locale, TranslationStatus>> = {};
      for (const translation of action.translations) {
        initial[translation.locale] = translation.fields;
        if (translation.status) {
          translationStatus[translation.locale] = translation.status;
        }
      }
      return {
        status: "ready",
        entityId: action.entityId,
        mainLocale: action.mainLocale,
        source: action.source,
        initial,
        edits: {},
        translationStatus,
        saving: false,
        error: null,
      };
    }

    case "EDIT_FIELD":
      return {
        ...state,
        edits: {
          ...state.edits,
          [action.locale]: {
            ...state.edits[action.locale],
            [action.field]: action.value,
          },
        },
      };

    case "SET_STATUS":
      return {
        ...state,
        translationStatus: {
          ...state.translationStatus,
          [action.locale]: action.status,
        },
      };

    case "MARK_INITIAL":
      return {
        ...state,
        // Populate initial[locale] with the just-saved fields so canPublish
        // becomes true immediately — no close/reopen required.
        initial: {
          ...state.initial,
          [action.locale]: action.fields,
        },
        // Clear in-progress edits for this locale since they are now persisted.
        edits: {
          ...state.edits,
          [action.locale]: {},
        },
      };

    case "SET_SAVING":
      return { ...state, saving: action.saving };

    case "SET_ERROR":
      return {
        ...state,
        error: action.error,
        // A failed initial load never reached INIT — surface it as a load error.
        // A failed save happens from "ready" and should keep the form usable.
        status: action.error && state.status === "loading" ? "error" : state.status,
      };

    default:
      return state;
  }
}

/** Current effective value for a field: an in-progress edit, else the last-saved value. */
export function getFieldValue(state: TranslationFormState, locale: Locale, field: string): string {
  const edited = state.edits[locale]?.[field];
  if (edited !== undefined) return edited;
  return state.initial[locale]?.[field] ?? "";
}

/** True if any field for this locale differs from its last-saved value. */
export function isLocaleDirty(state: TranslationFormState, locale: Locale): boolean {
  const edited = state.edits[locale];
  if (!edited) return false;
  const initial = state.initial[locale];
  return Object.entries(edited).some(([key, value]) => (initial?.[key] ?? "") !== value);
}

/** Creates the translation reducer state and dispatcher used by editor dialogs. */
export function useTranslationForm() {
  const [state, dispatch] = useReducer(formReducer, undefined, getInitialState);
  return { state, dispatch };
}
