import type { Locale } from '@sd/core-contracts';
import { resolveTranslatedFields } from './resolve-translated-fields';

export type ContentTranslationResult<
  F extends Record<string, string | null | undefined>,
> = {
  /** Preferred-language fields: the published translation overlaid on the base,
   * falling back to the base for any field the translation omits. */
  fields: F;
  /** Language the base fields are written in, when known. */
  originalLanguage?: Locale;
  /** Base (original-language) fields — present only when a translation was
   * actually applied, so the client can flip to the original without refetching. */
  original?: F;
};

/**
 * Resolves a single translatable entity to the target locale.
 *
 * The base entity columns already hold the *original*-language text, so we only
 * need the published translation for the target locale. A translation is applied
 * when one exists and the target differs from the original language; otherwise
 * the base fields are returned unchanged (no `original` block).
 */
export function resolveContentTranslation<
  F extends Record<string, string | null | undefined>,
>(args: {
  base: F;
  originalLanguage?: Locale | null;
  targetLocale: Locale;
  publishedTranslation?: Partial<F> | null;
}): ContentTranslationResult<F> {
  const { base, originalLanguage, targetLocale, publishedTranslation } = args;

  const result: ContentTranslationResult<F> = { fields: base };
  if (originalLanguage) result.originalLanguage = originalLanguage;

  const sameAsOriginal =
    originalLanguage != null && targetLocale === originalLanguage;

  if (publishedTranslation && !sameAsOriginal) {
    const merged = resolveTranslatedFields(base, publishedTranslation);
    const changed = (Object.keys(base) as (keyof F)[]).some(
      (key) => merged[key] !== base[key],
    );
    if (changed) {
      result.fields = merged;
      result.original = { ...base };
    }
  }

  return result;
}
