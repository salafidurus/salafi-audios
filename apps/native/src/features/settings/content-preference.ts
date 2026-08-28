import { createContentPreferenceStore, type LanguageStorageAdapter } from "@sd/core-i18n";
import * as SecureStore from "expo-secure-store";
import { useSyncExternalStore } from "react";

/** Provides native account, preference, support, and settings workflows. */
const secureStoreAdapter: LanguageStorageAdapter = {
  async getItem(key) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async setItem(key, value) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // SecureStore unavailable — silently skip
    }
  },
};

const store = createContentPreferenceStore(secureStoreAdapter);
void store.hydrate();

/** Reactive access to the "show content in original language" preference. */
export function useShowOriginalContent(): boolean {
  return useSyncExternalStore(store.subscribe, store.getShowOriginal);
}

/** Persists the listener’s original-language content preference for native readers. */
export function setShowOriginalContent(value: boolean): void {
  store.setShowOriginal(value);
}
