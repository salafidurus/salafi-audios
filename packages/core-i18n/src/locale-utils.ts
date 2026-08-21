import { DEFAULT_LOCALE, RTL_LOCALES, SUPPORTED_LOCALES, type Locale } from "./supported-locales";

export function isSupportedLocale(value: string): value is Locale {
  return SUPPORTED_LOCALES.some((locale) => locale === value);
}

export function isRtl(locale: Locale): boolean {
  return RTL_LOCALES.some((rtlLocale) => rtlLocale === locale);
}

export function localeToDir(locale: Locale): "ltr" | "rtl" {
  return isRtl(locale) ? "rtl" : "ltr";
}

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
