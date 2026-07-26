import { SUPPORTED_LOCALES, type Locale } from "@sd/core-contracts";

export function getSecondaryLocales(mainLocale: Locale): Locale[] {
  return SUPPORTED_LOCALES.filter((locale) => locale !== mainLocale);
}

export function getLocaleLabel(locale: Locale): string {
  return locale === "en" ? "English" : "العربية";
}
