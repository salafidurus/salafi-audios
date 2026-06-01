import { DEFAULT_LOCALE, RTL_LOCALES, SUPPORTED_LOCALES, type Locale } from "./supported-locales";

export function isRtl(locale: Locale): boolean {
  return (RTL_LOCALES as readonly string[]).includes(locale);
}

export function localeToDir(locale: Locale): "ltr" | "rtl" {
  return isRtl(locale) ? "rtl" : "ltr";
}

export function resolveLocale(candidate: string | null | undefined): Locale {
  if (!candidate) return DEFAULT_LOCALE;
  const tags = candidate.split(/[,;]/).map((t) => t.trim().split(";")[0]?.trim() ?? "");
  for (const tag of tags) {
    const lang = tag.split("-")[0]?.toLowerCase() ?? "";
    if ((SUPPORTED_LOCALES as readonly string[]).includes(lang)) {
      return lang as Locale;
    }
  }
  return DEFAULT_LOCALE;
}
