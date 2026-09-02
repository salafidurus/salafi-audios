import type { Locale } from "@sd/core-i18n";

import i18next, { type i18n } from "i18next";
import { initReactI18next } from "react-i18next";

import { LocaleMessagesSchema, mergeLocaleMessages } from "./merge-locale-messages";

// JSON locale files from the shared core-i18n package
// Using require() because Next.js handles JSON imports differently in RSC vs client
/** Loads shared and web-specific locale messages into an isolated React i18next instance. */
const enShared = LocaleMessagesSchema.parse(require("@sd/core-i18n/locales/en.json"));
const arShared = LocaleMessagesSchema.parse(require("@sd/core-i18n/locales/ar.json"));
const enOverrides = LocaleMessagesSchema.parse(require("./overrides.en.json"));
const arOverrides = LocaleMessagesSchema.parse(require("./overrides.ar.json"));

/** Creates an i18n instance with English fallback and validated Arabic/English resources. */
export function createI18n(initialLocale: Locale): i18n {
  const instance = i18next.createInstance();
  instance.use(initReactI18next).init({
    lng: initialLocale,
    fallbackLng: "en",
    resources: {
      en: { translation: mergeLocaleMessages(enShared, enOverrides) },
      ar: { translation: mergeLocaleMessages(arShared, arOverrides) },
    },
    defaultNS: "translation",
    interpolation: { escapeValue: false },
  });
  return instance;
}
