import type { StoreApi, UseBoundStore } from "zustand";

import type { Outbox, JsonValue } from "../outbox/outbox.store";
import type { EntityStoreState, SyncableEntity } from "../store/entity-store";

import { drainOutbox } from "../outbox/outbox.drain";

const DEFAULT_DEBOUNCE_MS = 120_000;

export type SyncStore<T extends SyncableEntity> = {
  get: (id: string) => T | undefined;
  upsert: (entity: T) => void;
  mergeMany: (entities: T[]) => void;
};

type ZustandSyncStore<T extends SyncableEntity> = UseBoundStore<StoreApi<EntityStoreState<T>>>;

type SyncStoreInput<T extends SyncableEntity> = SyncStore<T> | ZustandSyncStore<T>;

export type SyncEngineOptions<T extends SyncableEntity & JsonValue> = {
  store: SyncStoreInput<T>;
  outbox: Outbox<T>;
  /** Tag written on outbox entries queued by this engine (e.g. "progress-update"). */
  entryType: string;
  /** Multiple `scheduleSync` calls for the same id within this window collapse into one push. */
  debounceMs?: number;
  /** Pushes one entity's current state to the backend. A rejection queues the entity for retry. */
  pushOne: (entity: T) => Promise<void>;
  /** Pushes a batch in one request. Falls back to per-entity `pushOne` calls if omitted. */
  pushBulk?: (entities: T[]) => Promise<void>;
  /** Pulls entities updated since the given ISO cursor (or everything, if omitted). */
  pullSince: (since?: string) => Promise<T[]>;
};

export type SyncEngine<T extends SyncableEntity & JsonValue> = {
  /** Optimistically writes the entity locally, then schedules a debounced push. */
  scheduleSync: (entity: T) => void;
  /** Immediately pushes any pending debounced writes, bypassing the debounce timer. */
  flush: () => Promise<void>;
  /** Delta-pulls from the server and LWW-merges the result into the local store. */
  hydrate: (since?: string) => Promise<T[]>;
  /** The newest cursor observed by `hydrate`, or null before the first pull. */
  getLastSyncedAt: () => string | null;
  /** Pushes a batch of entities immediately (not debounced). */
  bulkSync: (entities: T[]) => Promise<void>;
  /** Subscribes to "a flush just reached the server" notifications. Returns an unsubscribe fn. */
  onFlushed: (listener: () => void) => () => void;
  /** Retries any outbox entries left over from a previous session. Call after `outbox.hydrate()`. */
  drainPending: () => Promise<void>;
  /** Cancels scheduled work and prevents this engine from starting new work. */
  dispose: () => void;
};

function normalizeStore<T extends SyncableEntity>(store: SyncStoreInput<T>): SyncStore<T> {
  if ("get" in store) return store;

  return {
    get: (id) => store.getState().actions.get(id),
    upsert: (entity) => store.getState().actions.upsert(entity),
    mergeMany: (entities) => store.getState().actions.mergeMany(entities),
  };
}

export function createSyncEngine<T extends SyncableEntity & JsonValue>(
  options: SyncEngineOptions<T>,
): SyncEngine<T> {
  const {
    store,
    outbox,
    entryType,
    debounceMs = DEFAULT_DEBOUNCE_MS,
    pushOne,
    pushBulk,
    pullSince,
  } = options;

  const syncStore = normalizeStore(store);
  let timeout: ReturnType<typeof setTimeout> | null = null;
  const pendingIds = new Set<string>();
  const flushListeners = new Set<() => void>();
  let lastSyncedAt: string | null = null;
  let flushPromise: Promise<void> | null = null;
  let disposed = false;

  async function flushImpl(): Promise<void> {
    if (disposed) return;

    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }

    // Retry anything left over from a previous failed flush/session first, so a
    // failure is picked up again on the very next flush rather than requiring a
    // separate explicit `drainPending()` call.
    const drainResult = await drainOutbox(outbox, (entry) => pushOne(entry.payload));

    const ids = Array.from(pendingIds);
    pendingIds.clear();

    let attempted = drainResult.succeeded + drainResult.failed > 0;

    if (ids.length > 0) {
      attempted = true;
      await Promise.all(
        ids.map(async (id) => {
          const entity = syncStore.get(id);
          if (!entity) return;

          try {
            await pushOne(entity);
          } catch {
            // Persist for retry so this write survives an app restart/crash — this is
            // the fix for the historical "in-memory pendingUpdates lost on reload" gap.
            outbox.useOutboxStore.getState().actions.enqueue(entryType, entity);
          }
        }),
      );
    }

    if (attempted) {
      for (const listener of flushListeners) listener();
    }
  }

  function flush(): Promise<void> {
    if (disposed) return Promise.resolve();
    if (flushPromise) return flushPromise;
    flushPromise = flushImpl().finally(() => {
      flushPromise = null;
    });
    return flushPromise;
  }

  return {
    scheduleSync: (entity) => {
      if (disposed) return;
      syncStore.upsert(entity);
      pendingIds.add(entity.id);

      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => void flush(), debounceMs);
    },

    flush,

    hydrate: async (since = lastSyncedAt ?? undefined) => {
      if (disposed) return [];
      const entities = await pullSince(since);
      syncStore.mergeMany(entities);
      for (const entity of entities) {
        if (!lastSyncedAt || entity.updatedAt > lastSyncedAt) {
          lastSyncedAt = entity.updatedAt;
        }
      }
      return entities;
    },

    getLastSyncedAt: () => lastSyncedAt,

    bulkSync: async (entities) => {
      if (disposed) return;
      if (entities.length === 0) return;

      if (pushBulk) {
        await pushBulk(entities);
        return;
      }

      await Promise.all(entities.map((entity) => pushOne(entity)));
    },

    onFlushed: (listener) => {
      if (disposed) return () => {};
      flushListeners.add(listener);
      return () => flushListeners.delete(listener);
    },

    drainPending: async () => {
      if (disposed) return;
      const result = await drainOutbox(outbox, async (entry) => {
        await pushOne(entry.payload);
      });
      if (result.succeeded + result.failed > 0) {
        for (const listener of flushListeners) listener();
      }
    },

    dispose: () => {
      disposed = true;
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      pendingIds.clear();
      flushListeners.clear();
    },
  };
}
