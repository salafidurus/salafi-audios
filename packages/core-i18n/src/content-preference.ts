import type { LanguageStorageAdapter } from "./language-store";

const STORAGE_KEY = "sd_show_original_content";

/**
 * Picks the value to display for a translatable field.
 *
 * When the user prefers original-language content, the original value is used
 * (when present); otherwise the translated/preferred value is shown. Falls back
 * to the translated value whenever the original is missing.
 */
export function pickContentField<T>(
  translated: T,
  original: T | null | undefined,
  showOriginal: boolean,
): T {
  return showOriginal && original != null ? original : translated;
}

/**
 * Reactive, framework-agnostic store for the "show content in original
 * language" preference. Holds a synchronous in-memory snapshot (so it can drive
 * `useSyncExternalStore`) and persists asynchronously via the supplied adapter
 * (cookie on web, SecureStore on native).
 */
export interface ContentPreferenceStore {
  /** Current synchronous value. */
  getShowOriginal(): boolean;
  /** Update the value, notify subscribers, and persist. */
  setShowOriginal(value: boolean): void;
  /** Subscribe to changes; returns an unsubscribe function. */
  subscribe(listener: () => void): () => void;
  /** Load the persisted value into memory and notify subscribers. */
  hydrate(): Promise<void>;
}

export function createContentPreferenceStore(
  adapter: LanguageStorageAdapter,
  initial = false,
): ContentPreferenceStore {
  let value = initial;
  const listeners = new Set<() => void>();

  const notify = () => {
    for (const listener of listeners) listener();
  };

  return {
    getShowOriginal: () => value,

    setShowOriginal(next: boolean) {
      if (next === value) return;
      value = next;
      notify();
      void adapter.setItem(STORAGE_KEY, next ? "1" : "0");
    },

    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    async hydrate() {
      const raw = await adapter.getItem(STORAGE_KEY);
      const next = raw === "1";
      if (next !== value) {
        value = next;
        notify();
      }
    },
  };
}
