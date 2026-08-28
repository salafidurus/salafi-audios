import { type InitOptions } from "i18next";

import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "./supported-locales";

/** Framework-neutral i18next option construction for shared locale behavior. */
/** Options used to initialize shared i18next configuration without owning an app provider. */
export interface I18nConfig {
  /** Locale requested by the consuming application before fallback resolution. */
  locale?: string;
  /** Translation resources keyed by locale and namespace. */
  resources?: Record<string, Record<string, Record<string, string>>>;
}

/** Builds consistent i18next defaults for web, native, and non-UI consumers. */
export function initI18nOptions(config: I18nConfig = {}): InitOptions {
  const locale = config.locale ?? DEFAULT_LOCALE;

  return {
    lng: locale,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: SUPPORTED_LOCALES,
    resources: config.resources ?? {},
    interpolation: {
      escapeValue: false,
    },
    ns: ["translation"],
    defaultNS: "translation",
  };
}
