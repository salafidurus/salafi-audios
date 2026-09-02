import { createContentPreferenceStore, type LanguageStorageAdapter } from "@sd/core-i18n";
import * as SecureStore from "expo-secure-store";
import { useSyncExternalStore } from "react";

/** Persists the native reader's content-language preference in SecureStore. */
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

/** Exposes the hydrated preference store for native consumers and tests. */
export const contentPreferenceStore = store;

/** Reactive access to the "show content in original language" preference. */
export function useShowOriginalContent(): boolean {
  return useSyncExternalStore(store.subscribe, store.getShowOriginal);
}

/** Records the reader's original-language preference and notifies subscribers. */
export function setShowOriginalContent(value: boolean): void {
  store.setShowOriginal(value);
}
