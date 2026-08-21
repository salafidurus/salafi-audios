import {
  httpClient,
  endpoints,
  type AudioProgressDto,
  type ProgressSyncItemDto,
} from "@sd/core-contracts";
import {
  createOutboxStore,
  createSyncEngine,
  type Outbox,
  type StorageAdapter,
  type SyncEngine,
  type SyncStore,
} from "@sd/core-sync";

import { useProgressStore, type ListingProgress, type ProgressSyncEntity } from "./progress.store";

type ProgressUpdateBody = {
  positionSeconds: number;
  durationSeconds: number;
  isCompleted?: boolean;
};

function createInMemoryStorageAdapter(): StorageAdapter {
  const backing = new Map<string, string>();
  return {
    getItem: async (key) => backing.get(key) ?? null,
    setItem: async (key, value) => void backing.set(key, value),
    removeItem: async (key) => void backing.delete(key),
  };
}

function toProgressEntity(
  entry: ListingProgress,
  serverListingId = entry.listingId,
): ProgressSyncEntity {
  const entity: ProgressSyncEntity = {
    ...entry,
    id: entry.listingId,
  };
  if (serverListingId !== entry.listingId) entity.serverListingId = serverListingId;
  return entity;
}

function fromProgressEntity(entity: ProgressSyncEntity): ListingProgress {
  const { id: _id, serverListingId: _serverListingId, ...entry } = entity;
  return entry;
}

const progressStore: SyncStore<ProgressSyncEntity> = {
  get: (id) => {
    const entry = useProgressStore.getState().actions.getProgress(id);
    return entry ? toProgressEntity(entry) : undefined;
  },
  upsert: (entity) => {
    useProgressStore.getState().actions.upsertProgress(fromProgressEntity(entity));
  },
  mergeMany: (entities) => {
    useProgressStore.getState().actions.loadProgress(entities.map(fromProgressEntity));
  },
};

let delegateAdapter: StorageAdapter = createInMemoryStorageAdapter();
const proxyAdapter: StorageAdapter = {
  getItem: (key) => delegateAdapter.getItem(key),
  setItem: (key, value) => delegateAdapter.setItem(key, value),
  removeItem: (key) => delegateAdapter.removeItem(key),
};

let activeUserId: string | null = null;
let outbox: Outbox<ProgressSyncEntity> = createOutboxStore(proxyAdapter, "progress");
let engine: SyncEngine<ProgressSyncEntity>;

function buildEngine(nextOutbox: Outbox<ProgressSyncEntity>): SyncEngine<ProgressSyncEntity> {
  return createSyncEngine<ProgressSyncEntity>({
    store: progressStore,
    outbox: nextOutbox,
    entryType: "progress-update",
    pushOne: async (entry) => {
      const body: ProgressUpdateBody = {
        positionSeconds: entry.positionSeconds,
        durationSeconds: entry.durationSeconds,
      };
      if (entry.completedAt) body.isCompleted = true;

      await httpClient({
        url: endpoints.audio.progress.update(entry.serverListingId ?? entry.listingId),
        method: "PUT",
        body,
      });
    },
    pullSince: async (since) => {
      const entries = await httpClient<AudioProgressDto[]>({
        url: endpoints.audio.progress.get,
        method: "GET",
        params: since ? { since } : undefined,
      });
      return entries.map((entry) => toProgressEntity(entry));
    },
  });
}

engine = buildEngine(outbox);

/**
 * Initializes persisted progress sync for a user. A changed user gets a clean
 * in-memory view, while the first initialization preserves any cache loaded by
 * the app before the platform adapter became available.
 */
export async function initProgressSync(adapter: StorageAdapter, userId: string): Promise<void> {
  if (activeUserId && activeUserId !== userId) {
    useProgressStore.setState({ progressMap: {} });
  }
  activeUserId = userId;
  useProgressStore.setState({ lastSyncedAt: null });
  delegateAdapter = adapter;
  outbox = createOutboxStore(proxyAdapter, `progress:${userId}`);
  engine = buildEngine(outbox);
  await outbox.hydrate();
}

/** Enqueues a progress update for shared debounced synchronization. */
export function syncProgressToBackend(update: {
  listingId: string;
  localListingId?: string;
  positionSeconds: number;
  durationSeconds: number;
}): void {
  const localListingId = update.localListingId ?? update.listingId;
  const current = useProgressStore.getState().actions.getProgress(localListingId);
  const entry: ProgressSyncEntity = {
    id: localListingId,
    listingId: localListingId,
    positionSeconds: update.positionSeconds,
    durationSeconds: update.durationSeconds,
    completedAt: current?.completedAt,
    updatedAt: current?.updatedAt ?? new Date().toISOString(),
  };
  if (update.listingId !== localListingId) entry.serverListingId = update.listingId;
  engine.scheduleSync(entry);
}

/** Immediately flushes debounced progress and retries persisted failures. */
export function flushPendingProgress(): Promise<void> {
  return engine.flush();
}

/** Retries progress entries left by a previous failed flush or session. */
export function drainPendingProgress(): Promise<void> {
  return engine.drainPending();
}

/** Subscribes to successful or attempted flush notifications. */
export function onProgressFlushed(listener: () => void): () => void {
  return engine.onFlushed(listener);
}

/** Pulls the next progress delta and reconciles it through the shared engine. */
export async function hydrateProgressFromServer(): Promise<void> {
  await engine.hydrate();
  useProgressStore
    .getState()
    .actions.setLastSyncedAt(engine.getLastSyncedAt() ?? new Date().toISOString());
}

/** Bulk-syncs a batch of progress entries to the server. */
export async function bulkSyncProgress(items: ProgressSyncItemDto[]): Promise<void> {
  if (items.length === 0) return;

  await httpClient({
    url: endpoints.audio.progress.sync,
    method: "POST",
    body: { items },
  });
}
