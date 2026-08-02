import type { StorageAdapter } from "@sd/core-sync";

/** `@sd/core-sync` `StorageAdapter` backed by `window.localStorage`. */
export function createLocalStorageAdapter(): StorageAdapter {
  return {
    getItem: async (key) => {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    setItem: async (key, value) => {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        // Storage full/unavailable — best-effort only.
      }
    },
    removeItem: async (key) => {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // Storage full/unavailable — best-effort only.
      }
    },
  };
}
