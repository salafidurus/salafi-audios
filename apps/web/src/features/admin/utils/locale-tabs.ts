import { SUPPORTED_LOCALES, type Locale } from "@sd/core-contracts";

/** Documents this module's responsibility and public boundary. */
/** Returns every supported locale except the locale already used as the primary tab. */
export function getSecondaryLocales(mainLocale: Locale): Locale[] {
  return SUPPORTED_LOCALES.filter((locale) => locale !== mainLocale);
}

/** Converts a locale code into the human-readable label shown in the tab selector. */
export function getLocaleLabel(locale: Locale): string {
  return locale === "en" ? "English" : "العربية";
}
