import { resolveLocale, type Locale } from "@sd/core-i18n";
import * as SecureStore from "expo-secure-store";

/** Initializes native localization, locale persistence, and translated message lookup. */
const KEY = "locale";

function getDeviceLocale(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale.split("-")[0] ?? null;
  } catch {
    return null;
  }
}

/** Returns the the stored locale used by native consumers. */
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

/** Defines the native store locale contract used by this module. */
export async function storeLocale(locale: Locale): Promise<void> {
  try {
    await SecureStore.setItemAsync(KEY, locale);
  } catch {
    // SecureStore unavailable — silently skip
  }
}
