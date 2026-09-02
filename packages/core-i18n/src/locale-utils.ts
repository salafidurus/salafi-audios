import { DEFAULT_LOCALE, RTL_LOCALES, SUPPORTED_LOCALES, type Locale } from "./supported-locales";

/** Normalizes browser and application locale values into the platform's canonical locale model. */
/** Reports whether a value is one of the repository's canonical locale identifiers. */
export function isSupportedLocale(value: string): value is Locale {
  return SUPPORTED_LOCALES.some((locale) => locale === value);
}

/** Reports whether a canonical locale uses right-to-left presentation. */
export function isRtl(locale: Locale): boolean {
  return RTL_LOCALES.some((rtlLocale) => rtlLocale === locale);
}

/** Converts a canonical locale into the direction expected by layout APIs. */
export function localeToDir(locale: Locale): "ltr" | "rtl" {
  return isRtl(locale) ? "rtl" : "ltr";
}

/** Selects the first supported language tag from a browser-style locale candidate list. */
export function resolveLocale(candidate: string | null | undefined): Locale {
  if (!candidate) return DEFAULT_LOCALE;
  const tags = candidate.split(/[,;]/).map((t) => t.trim().split(";")[0]?.trim() ?? "");
  for (const tag of tags) {
    const lang = tag.split("-")[0]?.toLowerCase() ?? "";
    if (isSupportedLocale(lang)) {
      return lang;
    }
  }
  return DEFAULT_LOCALE;
}
