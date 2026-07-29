import { type Locale, isRtl } from "@sd/core-i18n";
import * as Updates from "expo-updates";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { DevSettings, I18nManager } from "react-native";

import { getStoredLocale, storeLocale } from "./locale-storage";
import { mergeLocaleMessages } from "./merge-locale-messages";

const enShared = require("@sd/core-i18n/locales/en.json") as Record<string, unknown>;
const arShared = require("@sd/core-i18n/locales/ar.json") as Record<string, unknown>;
const enOverrides = require("./overrides.en.json") as Partial<Record<string, unknown>>;
const arOverrides = require("./overrides.ar.json") as Partial<Record<string, unknown>>;

export const i18n = i18next;

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    lng: "en",
    fallbackLng: "en",
    resources: {
      en: {
        translation: mergeLocaleMessages(enShared, enOverrides),
      },
      ar: {
        translation: mergeLocaleMessages(arShared, arOverrides),
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

      if (i18n.language !== locale) {
        await i18n.changeLanguage(locale);
      }

      const shouldBeRtl = isRtl(locale);

      if (I18nManager.isRTL !== shouldBeRtl) {
        I18nManager.forceRTL(shouldBeRtl);
        if (!__DEV__) {
          try {
            await Updates.reloadAsync();
          } catch {
            // expo-updates not available in this build
          }
        }
      }
    })();
  }

  await initPromise;
}

export async function changeLocale(locale: Locale): Promise<void> {
  await storeLocale(locale);
  await i18n.changeLanguage(locale);

  const shouldBeRtl = isRtl(locale);
  if (I18nManager.isRTL !== shouldBeRtl) {
    I18nManager.forceRTL(shouldBeRtl);
    if (__DEV__) {
      DevSettings.reload();
    } else {
      try {
        await Updates.reloadAsync();
      } catch {
        // expo-updates not available in this build
      }
    }
  }
}
