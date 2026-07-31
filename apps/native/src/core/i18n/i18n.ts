import type { Locale } from "@sd/core-i18n";

import i18next from "i18next";
import { initReactI18next } from "react-i18next";

import { syncDirectionToLocale } from "../styles/theme/direction-sync";
import { syncTypographyToLocale } from "../styles/theme/typography-sync";
import { getStoredLocale, storeLocale } from "./locale-storage";
import { mergeLocaleMessages } from "./merge-locale-messages";

export const i18n = i18next;

const loadedLocaleBundles = new Set<Locale>();

function loadLocaleBundle(locale: Locale): Record<string, unknown> {
  if (locale === "ar") {
    const arShared = require("@sd/core-i18n/locales/ar.json") as Record<string, unknown>;
    const arOverrides = require("./overrides.ar.json") as Partial<Record<string, unknown>>;
    return mergeLocaleMessages(arShared, arOverrides);
  }
  const enShared = require("@sd/core-i18n/locales/en.json") as Record<string, unknown>;
  const enOverrides = require("./overrides.en.json") as Partial<Record<string, unknown>>;
  return mergeLocaleMessages(enShared, enOverrides);
}

// Ensures a locale's translation bundle has been merged and registered with
// i18next. The require()+merge work only runs once per locale per app
// session (cached in loadedLocaleBundles) — safe to call repeatedly.
function ensureLocaleLoaded(locale: Locale): void {
  if (loadedLocaleBundles.has(locale)) return;

  const bundle = loadLocaleBundle(locale);
  if (i18n.isInitialized) {
    i18n.addResourceBundle(locale, "translation", bundle, true, true);
  }
  loadedLocaleBundles.add(locale);
}

if (!i18n.isInitialized) {
  // Only the initial "en" bundle is loaded synchronously here — "ar" is
  // loaded lazily via ensureLocaleLoaded(), the first time it's actually
  // needed (initI18n() resolving a stored "ar" locale, or changeLocale("ar")).
  const initialBundle = loadLocaleBundle("en");
  loadedLocaleBundles.add("en");

  i18n.use(initReactI18next).init({
    lng: "en",
    fallbackLng: "en",
    resources: {
      en: {
        translation: initialBundle,
      },
    },
    defaultNS: "translation",
    interpolation: { escapeValue: false },
  });
}

let initPromise: Promise<void> | null = null;

export async function initI18n(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      let locale: Locale;
      try {
        locale = await getStoredLocale();
      } catch {
        locale = "en" as Locale;
      }

      ensureLocaleLoaded(locale);

      if (i18n.language !== locale) {
        await i18n.changeLanguage(locale);
      }

      syncDirectionToLocale(locale);
    })();
  }

  await initPromise;
}

export async function changeLocale(locale: Locale): Promise<void> {
  await storeLocale(locale);
  ensureLocaleLoaded(locale);
  await i18n.changeLanguage(locale);
  syncTypographyToLocale(locale);
  syncDirectionToLocale(locale);
}
