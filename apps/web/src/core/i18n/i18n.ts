import i18next from "i18next";
import type { i18n } from "i18next";
import { initReactI18next } from "react-i18next";
import type { Locale } from "@sd/core-i18n";
import { mergeLocaleMessages } from "./merge-locale-messages";

// JSON locale files from the shared core-i18n package
// Using require() because Next.js handles JSON imports differently in RSC vs client
const enShared = require("@sd/core-i18n/locales/en.json") as Record<string, unknown>;
const arShared = require("@sd/core-i18n/locales/ar.json") as Record<string, unknown>;
const enOverrides = require("./overrides.en.json") as Partial<Record<string, unknown>>;
const arOverrides = require("./overrides.ar.json") as Partial<Record<string, unknown>>;

export function createI18n(initialLocale: Locale): i18n {
  const instance = i18next.createInstance();
  void instance.use(initReactI18next).init({
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
