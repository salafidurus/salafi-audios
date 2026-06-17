export const SUPPORTED_LOCALES = ["en", "ar"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const RTL_LOCALES: readonly Locale[] = ["ar"];

/**
 * Original-language values for translatable content entities (lectures, series,
 * collections). Present on a read DTO only when the primary fields have been
 * resolved to a *translation* — so the client can flip to the original language
 * without an extra request. When absent, the primary fields already are the
 * original.
 */
export type ContentOriginalFields = {
  title?: string;
  description?: string;
};

/** Original-language values for scholar entities. See {@link ContentOriginalFields}. */
export type ScholarOriginalFields = {
  name?: string;
  bio?: string;
};
