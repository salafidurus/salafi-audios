import AsyncStorage from "@react-native-async-storage/async-storage";
import { resolveLocale, type Locale } from "@sd/core-i18n";
import { getLocales } from "expo-localization";

const KEY = "locale";

export async function getStoredLocale(): Promise<Locale> {
  const stored = await AsyncStorage.getItem(KEY);
  if (stored) return resolveLocale(stored);
  return resolveLocale(getLocales()[0]?.languageCode ?? null);
}

export async function storeLocale(locale: Locale): Promise<void> {
  await AsyncStorage.setItem(KEY, locale);
}
