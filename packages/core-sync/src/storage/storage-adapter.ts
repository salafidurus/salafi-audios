/**
 * Platform-agnostic key/value persistence contract. `@sd/core-sync` never implements
 * this itself — each app injects a concrete adapter (localStorage on web, a SQLite
 * kv table on native) so this package stays free of platform-specific code. Mirrors
 * the existing `PlaybackEngine` DI pattern in `packages/domain-audio`.
 */
export type StorageAdapter = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};
