import { resolveLocale, type Locale } from "@sd/core-i18n";

const KEY = "locale";

async function getSecureStore() {
  try {
    const mod = await import("expo-secure-store");
    return mod;
  } catch {
    return null;
  }
}

function getDeviceLocale(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale.split("-")[0] ?? null;
  } catch {
    return null;
  }
}

export async function getStoredLocale(): Promise<Locale> {
  const SecureStore = await getSecureStore();
  const stored = SecureStore ? await SecureStore.getItemAsync(KEY) : null;

  if (stored) {
    return resolveLocale(stored);
  }

  return resolveLocale(getDeviceLocale());
}

export async function storeLocale(locale: Locale): Promise<void> {
  const SecureStore = await getSecureStore();
  if (SecureStore) {
    await SecureStore.setItemAsync(KEY, locale);
  }
}
