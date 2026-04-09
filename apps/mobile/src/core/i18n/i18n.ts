import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { I18nManager } from "react-native";
import * as Updates from "expo-updates";
import { type Locale, isRtl } from "@sd/core-i18n";
import enShared from "@sd/core-i18n/locales/en.json";
import arShared from "@sd/core-i18n/locales/ar.json";
import enOverrides from "./overrides.en.json";
import arOverrides from "./overrides.ar.json";
import { mergeLocaleMessages } from "./merge-locale-messages";
import { getStoredLocale, storeLocale } from "./locale-storage";

export async function initI18n(): Promise<void> {
  const lng = await getStoredLocale();
  await i18next.use(initReactI18next).init({
    lng,
    fallbackLng: "en",
    resources: {
      en: {
        translation: mergeLocaleMessages(
          enShared as Record<string, unknown>,
          enOverrides as Record<string, unknown>,
        ),
      },
      ar: {
        translation: mergeLocaleMessages(
          arShared as Record<string, unknown>,
          arOverrides as Record<string, unknown>,
        ),
      },
    },
    defaultNS: "translation",
    interpolation: { escapeValue: false },
  });

  const shouldBeRtl = isRtl(lng);
  if (I18nManager.isRTL !== shouldBeRtl) {
    I18nManager.forceRTL(shouldBeRtl);
    await Updates.reloadAsync();
  }
}

export async function changeLocale(locale: Locale): Promise<void> {
  await storeLocale(locale);
  await i18next.changeLanguage(locale);
}

export default i18next;
