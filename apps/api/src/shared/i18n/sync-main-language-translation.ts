import type { Locale } from '@sd/core-contracts';

/**
 * Keeps a `*Translation` row for the current main language in sync with an
 * entity's base (main-language) columns, and preserves the previous main
 * language's content as a translation when the main language itself changes.
 *
 * `upsert` is caller-supplied (not a Prisma model call baked in here) because
 * each entity's translation table has a different shape (e.g. `status` exists
 * on Scholar/Listing translations but not on Topic translations) and must run
 * inside the caller's own transaction.
 */
export async function syncMainLanguageTranslation<
  F extends Record<string, string | null | undefined>,
>(args: {
  upsert: (locale: Locale, fields: F) => Promise<unknown>;
  oldLocale?: Locale | null;
  oldFields?: F | null;
  newLocale: Locale;
  newFields: F;
}): Promise<void> {
  const { upsert, oldLocale, oldFields, newLocale, newFields } = args;

  if (oldLocale != null && oldLocale !== newLocale && oldFields) {
    await upsert(oldLocale, oldFields);
  }

  await upsert(newLocale, newFields);
}
