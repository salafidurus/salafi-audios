import type { StoreApi, UseBoundStore } from "zustand";

import type { Outbox } from "../outbox/outbox.store";
import type { EntityStoreState, SyncableEntity } from "../store/entity-store";

import { drainOutbox } from "../outbox/outbox.drain";

const DEFAULT_DEBOUNCE_MS = 120_000;

export type SyncEngineOptions<T extends SyncableEntity> = {
  store: UseBoundStore<StoreApi<EntityStoreState<T>>>;
  outbox: Outbox;
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

export type SyncEngine<T extends SyncableEntity> = {
  /** Optimistically writes the entity locally, then schedules a debounced push. */
  scheduleSync: (entity: T) => void;
  /** Immediately pushes any pending debounced writes, bypassing the debounce timer. */
  flush: () => Promise<void>;
  /** Delta-pulls from the server and LWW-merges the result into the local store. */
  hydrate: (since?: string) => Promise<T[]>;
  /** Pushes a batch of entities immediately (not debounced). */
  bulkSync: (entities: T[]) => Promise<void>;
  /** Subscribes to "a flush just reached the server" notifications. Returns an unsubscribe fn. */
  onFlushed: (listener: () => void) => () => void;
  /** Retries any outbox entries left over from a previous session. Call after `outbox.hydrate()`. */
  drainPending: () => Promise<void>;
};

export function createSyncEngine<T extends SyncableEntity>(
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

  let timeout: ReturnType<typeof setTimeout> | null = null;
  const pendingIds = new Set<string>();
  const flushListeners = new Set<() => void>();

  async function flush(): Promise<void> {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }

    const ids = Array.from(pendingIds);
    pendingIds.clear();
    if (ids.length === 0) return;

    await Promise.all(
      ids.map(async (id) => {
        const entity = store.getState().actions.get(id);
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

    for (const listener of flushListeners) listener();
  }

  return {
    scheduleSync: (entity) => {
      store.getState().actions.upsert(entity);
      pendingIds.add(entity.id);

      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => void flush(), debounceMs);
    },

    flush,

    hydrate: async (since) => {
      const entities = await pullSince(since);
      store.getState().actions.mergeMany(entities);
      return entities;
    },

    bulkSync: async (entities) => {
      if (entities.length === 0) return;

      if (pushBulk) {
        await pushBulk(entities);
        return;
      }

      await Promise.all(entities.map((entity) => pushOne(entity)));
    },

    onFlushed: (listener) => {
      flushListeners.add(listener);
      return () => flushListeners.delete(listener);
    },

    drainPending: async () => {
      await drainOutbox(outbox, async (entry) => {
        await pushOne(entry.payload as T);
      });
    },
  };
}
