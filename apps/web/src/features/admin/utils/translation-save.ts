import type { Locale } from "@sd/core-contracts";

import type { TranslationEntityConfig } from "@/features/admin/components/Translation/translation-entities";

import {
  getFieldValue,
  isLocaleDirty,
  type TranslationFormState,
} from "@/features/admin/hooks/Translation/useTranslationForm";

/** Documents this module's responsibility and public boundary. */
/** Result of validating dirty secondary locales before persistence. */
export interface LocalesToSaveResult {
  /** Locales that are dirty and safe to persist, with their merged field values. */
  toSave: Map<Locale, Record<string, string>>;
  /** Dirty locales missing a required field that still has other content — block the save. */
  errorLocales: Locale[];
}

function collectLocaleFields(
  config: TranslationEntityConfig,
  state: TranslationFormState,
  locale: Locale,
) {
  const merged: Record<string, string> = {};
  let hasContent = false;
  let missingRequired = false;
  for (const field of config.fields) {
    const value = getFieldValue(state, locale, field.key);
    merged[field.key] = value;
    if (value.trim()) hasContent = true;
    if (field.required && !value.trim()) missingRequired = true;
  }
  return { merged, hasContent, missingRequired };
}

/**
 * Shared by the root listing/scholar/topic locale tabs and the translation
 * modal's sub-listing child detail view: figures out which dirty locales are
 * safe to persist vs. which are blocked by a cleared required field.
 */
export function computeLocalesToSave(
  config: TranslationEntityConfig,
  state: TranslationFormState,
  secondaryLocales: Locale[],
): LocalesToSaveResult {
  const toSave = new Map<Locale, Record<string, string>>();
  const errorLocales: Locale[] = [];

  for (const locale of secondaryLocales) {
    if (!isLocaleDirty(state, locale)) continue;

    const { merged, hasContent, missingRequired } = collectLocaleFields(config, state, locale);

    if (missingRequired && hasContent) {
      errorLocales.push(locale);
      continue;
    }
    if (missingRequired && !hasContent) continue; // fully cleared — nothing to persist

    toSave.set(locale, merged);
  }

  return { toSave, errorLocales };
}
