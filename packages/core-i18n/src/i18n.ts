import i18nextLib from "i18next";
import { type InitOptions } from "i18next";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "./supported-locales";

export interface I18nConfig {
  locale?: string;
  resources?: Record<string, Record<string, Record<string, string>>>;
}

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

// Initialize i18next once at module load
if (!i18nextLib.isInitialized) {
  i18nextLib.init(initI18nOptions()).catch((err) => {
    console.error("Failed to initialize i18n:", err);
  });
}

export const i18next = i18nextLib;
