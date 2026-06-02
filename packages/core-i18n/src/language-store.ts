import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from "./supported-locales";
import { resolveLocale } from "./locale-utils";

/**
 * Minimal async storage interface that both web (localStorage adapter) and
 * native (AsyncStorage / expo-secure-store adapter) can implement.
 */
export interface LanguageStorageAdapter {
  getItem(key: string): string | null | Promise<string | null>;
  setItem(key: string, value: string): void | Promise<void>;
}

const STORAGE_KEY = "sd_locale";

export interface LanguageStore {
  /** Read the persisted locale, resolving to a supported Locale. */
  getLanguage(): Promise<Locale>;
  /** Persist a locale selection. */
  setLanguage(locale: Locale): Promise<void>;
}

/**
 * Create a language store bound to a storage adapter.
 *
 * Usage:
 *   const store = createLanguageStore(localStorageAdapter);
 *   const locale = await store.getLanguage();
 *   await store.setLanguage("ar");
 */
export function createLanguageStore(adapter: LanguageStorageAdapter): LanguageStore {
  return {
    async getLanguage(): Promise<Locale> {
      const raw = await adapter.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_LOCALE;
      const candidate = (SUPPORTED_LOCALES as readonly string[]).includes(raw)
        ? raw
        : resolveLocale(raw);
      return candidate as Locale;
    },

    async setLanguage(locale: Locale): Promise<void> {
      await adapter.setItem(STORAGE_KEY, locale);
    },
  };
}
