import type { StorageAdapter } from "../storage/storage-adapter";

/** In-memory persistence support for synchronization unit tests. */
/**
 * In-memory `StorageAdapter` backed by a `Map` that outlives any single store
 * instance — tests construct a fresh `createOutboxStore`/`createSyncEngine` against
 * the *same* `FakeStorageAdapter` instance to simulate "app restarted, storage
 * survived" without needing a real platform storage engine.
 */
export function createFakeStorageAdapter(): StorageAdapter {
  const backing = new Map<string, string>();

  return {
    getItem: async (key) => backing.get(key) ?? null,
    setItem: async (key, value) => {
      backing.set(key, value);
    },
    removeItem: async (key) => {
      backing.delete(key);
    },
  };
}
