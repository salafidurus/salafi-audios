/** Persistence adapter boundary shared by web, native, and other clients. */
/**
 * Platform-agnostic key/value persistence contract. `@sd/core-sync` never implements
 * this itself — each app injects a concrete adapter (localStorage on web, a SQLite
 * kv table on native) so this package stays free of platform-specific code. Mirrors
 * the existing `PlaybackEngine` DI pattern in `packages/domain-audio`.
 */
export type StorageAdapter = {
  /** Reads a persisted value, returning `null` when the key is absent. */
  getItem(key: string): Promise<string | null>;
  /** Persists a serialized value under a platform-owned key. */
  setItem(key: string, value: string): Promise<void>;
  /** Removes a persisted value from the platform store. */
  removeItem(key: string): Promise<void>;
};
