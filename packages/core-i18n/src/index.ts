/** Public, framework-neutral localization primitives shared by every application. */
export { SUPPORTED_LOCALES, DEFAULT_LOCALE, RTL_LOCALES, type Locale } from "./supported-locales";
export { isRtl, localeToDir, resolveLocale } from "./locale-utils";
export { initI18nOptions, type I18nConfig } from "./i18n";
export { createLanguageStore, type LanguageStorageAdapter } from "./language-store";
export {
  pickContentField,
  createContentPreferenceStore,
  type ContentPreferenceStore,
} from "./content-preference";
export {
  SCHOLAR_TITLE_KEYS,
  getEmptyStateText,
  getErrorStateText,
  getLocalizedName,
  getScholarTitleLabel,
  type TranslateFn,
} from "./translation-helpers";
