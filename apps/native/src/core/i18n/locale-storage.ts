import * as SecureStore from "expo-secure-store";
import { resolveLocale, type Locale } from "@sd/core-i18n";

const KEY = "locale";

function getDeviceLocale(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale.split("-")[0] ?? null;
  } catch {
    return null;
  }
}

export async function getStoredLocale(): Promise<Locale> {
  try {
    const stored = await SecureStore.getItemAsync(KEY);
    if (stored) {
      return resolveLocale(stored);
    }
  } catch {
    // SecureStore unavailable — fall through to device locale
  }

  return resolveLocale(getDeviceLocale());
}

export async function storeLocale(locale: Locale): Promise<void> {
  try {
    await SecureStore.setItemAsync(KEY, locale);
  } catch {
    // SecureStore unavailable — silently skip
  }
}
