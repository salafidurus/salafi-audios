import { useSyncExternalStore } from "react";
import * as SecureStore from "expo-secure-store";
import { createContentPreferenceStore, type LanguageStorageAdapter } from "@sd/core-i18n";

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

export const contentPreferenceStore = store;

/** Reactive access to the "show content in original language" preference. */
export function useShowOriginalContent(): boolean {
  return useSyncExternalStore(store.subscribe, store.getShowOriginal);
}

export function setShowOriginalContent(value: boolean): void {
  store.setShowOriginal(value);
}
