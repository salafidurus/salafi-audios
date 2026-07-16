"use client";

import { useSyncExternalStore } from "react";
import { createContentPreferenceStore, type LanguageStorageAdapter } from "@sd/core-i18n";

/** Cookie-backed adapter so the preference survives reloads and is readable by
 * the server when rendering. Keyed by the storage key the store passes in. */
const cookieAdapter: LanguageStorageAdapter = {
  getItem(key) {
    if (typeof document === "undefined") {
      return null;
    }
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const eqIdx = cookie.indexOf("=");
      if (eqIdx !== -1) {
        const name = cookie.slice(0, eqIdx).trim();
        if (name === key) {
          return decodeURIComponent(cookie.slice(eqIdx + 1));
        }
      }
    }
    return null;
  },
  setItem(key, value) {
    if (typeof document === "undefined") {
      return;
    }
    document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax`;
  },
};

const store = createContentPreferenceStore(cookieAdapter);
store.hydrate();

export const contentPreferenceStore = store;

/** Reactive access to the "show content in original language" preference. */
export function useShowOriginalContent(): boolean {
  return useSyncExternalStore(store.subscribe, store.getShowOriginal, () => false);
}

export function setShowOriginalContent(value: boolean): void {
  store.setShowOriginal(value);
}
