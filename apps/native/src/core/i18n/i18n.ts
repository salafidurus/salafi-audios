import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { I18nManager } from "react-native";
import { type Locale, isRtl } from "@sd/core-i18n";
import enShared from "@sd/core-i18n/locales/en.json";
import arShared from "@sd/core-i18n/locales/ar.json";
import arOverrides from "./overrides.ar.json";
import enOverrides from "./overrides.en.json";
import { getStoredLocale, storeLocale } from "./locale-storage";
import { mergeLocaleMessages } from "./merge-locale-messages";

export const i18n = i18next;

let initPromise: Promise<void> | null = null;

export async function initI18n(): Promise<void> {
  if (i18n.isInitialized) {
    return;
  }

  if (!initPromise) {
    initPromise = (async () => {
      let locale: Locale;
      try {
        locale = await getStoredLocale();
      } catch {
        locale = "en" as Locale;
      }

      if (!i18n.isInitialized) {
        await i18n.use(initReactI18next).init({
          lng: locale,
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
      }

      const shouldBeRtl = isRtl(locale);

      if (I18nManager.isRTL !== shouldBeRtl) {
        I18nManager.forceRTL(shouldBeRtl);
        if (!__DEV__) {
          try {
            const { reloadAsync } = await import("expo-updates");
            await reloadAsync();
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
      // DevSettings only available in development builds
      const { DevSettings } = await import("react-native");
      DevSettings.reload();
    } else {
      try {
        const { reloadAsync } = await import("expo-updates");
        await reloadAsync();
      } catch {
        // expo-updates not available in this build
      }
    }
  }
}
