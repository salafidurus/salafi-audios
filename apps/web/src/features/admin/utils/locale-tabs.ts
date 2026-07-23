import { SUPPORTED_LOCALES, type Locale } from "@sd/core-contracts";

export function getSecondaryLocales(mainLocale: Locale): Locale[] {
  return SUPPORTED_LOCALES.filter((locale) => locale !== mainLocale);
}

export function getLocaleLabel(locale: Locale): string {
  return locale === "en" ? "English" : "العربية";
}

export function buildTranslationsPayload<T extends Record<string, unknown>>(
  translationChanges: Partial<Record<Locale, T>>,
  locales: Locale[],
  hasContent: (value: T | undefined) => boolean,
): (T & { locale: Locale })[] | undefined {
  const entries = locales.reduce<(T & { locale: Locale })[]>((acc, locale) => {
    if (hasContent(translationChanges[locale])) {
      acc.push({ locale, ...(translationChanges[locale] as T) });
    }
    return acc;
  }, []);
  return entries.length > 0 ? entries : undefined;
}
