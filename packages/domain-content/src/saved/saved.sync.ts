import { httpClient, endpoints, type SavedDeltaItemDto } from "@sd/core-contracts";
import {
  createOutboxStore,
  createSyncEngine,
  type Outbox,
  type StorageAdapter,
  type SyncEngine,
} from "@sd/core-sync";

import {
  useSavedStore,
  markSavedLocally,
  markUnsavedLocally,
  type SavedEntry,
} from "./saved.store";

function createInMemoryStorageAdapter(): StorageAdapter {
  const backing = new Map<string, string>();
  return {
    getItem: async (key) => backing.get(key) ?? null,
    setItem: async (key, value) => void backing.set(key, value),
    removeItem: async (key) => void backing.delete(key),
  };
}

// In-memory by default so this module works standalone; apps upgrade it to a
// real persisted adapter via `initSavedSync` (see apps/*/core/audio/progress-persistence.ts,
// which wires progress and saved sync together at the same lifecycle points).
let delegateAdapter: StorageAdapter = createInMemoryStorageAdapter();
const proxyAdapter: StorageAdapter = {
  getItem: (key) => delegateAdapter.getItem(key),
  setItem: (key, value) => delegateAdapter.setItem(key, value),
  removeItem: (key) => delegateAdapter.removeItem(key),
};

function buildEngine(outbox: Outbox<SavedEntry>): SyncEngine<SavedEntry> {
  return createSyncEngine<SavedEntry>({
    store: useSavedStore,
    outbox,
    entryType: "saved-update",
    // Saves are low-frequency taps, not continuous ticks — a short debounce just
    // collapses an accidental double-tap rather than batching a stream of writes.
    debounceMs: 3_000,
    pushOne: async (entry) => {
      // Resolves by slug, not the uuid id (LibraryRepository.resolveListingId) —
      // fall back to id only if no slug was ever recorded for this entry.
      await httpClient({
        url: endpoints.library.saveListing(entry.slug ?? entry.id),
        method: entry.deletedAt ? "DELETE" : "POST",
      });
    },
    pushBulk: async (entries) => {
      await httpClient({
        url: endpoints.library.savedSync,
        method: "POST",
        body: {
          items: entries.map((entry) => ({
            listingId: entry.id,
            saved: !entry.deletedAt,
            updatedAt: entry.updatedAt,
          })),
        },
      });
    },
    pullSince: async (since) => {
      const entries = await httpClient<SavedDeltaItemDto[]>({
        url: endpoints.library.savedDelta,
        method: "GET",
        params: since ? { since } : undefined,
      });
      return entries.map((entry) => ({
        id: entry.listingId,
        updatedAt: entry.updatedAt,
        deletedAt: entry.deletedAt,
        savedAt: entry.savedAt,
      }));
    },
  });
}

// Namespaced by userId (see `initSavedSync`), same isolation rationale as progress's outbox.
let outbox = createOutboxStore<SavedEntry>(proxyAdapter, "saved");
let engine = buildEngine(outbox);
let lastSyncedAt: string | null = null;

/**
 * Upgrades the retry queue to a persisted `StorageAdapter`, scoped to `userId`,
 * and recovers any entries a previous session for that same user left queued.
 * Call once per authenticated session, before the first `markSaved`/`markUnsaved`
 * call, after the app's platform storage adapter is constructed.
 */
export async function initSavedSync(adapter: StorageAdapter, userId: string): Promise<void> {
  delegateAdapter = adapter;
  outbox = createOutboxStore<SavedEntry>(proxyAdapter, `saved:${userId}`);
  engine = buildEngine(outbox);
  lastSyncedAt = null;
  await outbox.hydrate();
}

/**
 * Optimistically marks a listing saved locally, then schedules a debounced
 * push. Pass `slug` whenever the caller has one (most call sites do) — it's
 * required for the push to actually resolve server-side.
 */
export function markSaved(listingId: string, slug?: string): void {
  markSavedLocally(listingId, slug);
  const entry = useSavedStore.getState().actions.get(listingId);
  if (entry) engine.scheduleSync(entry);
}

/** Optimistically marks a listing unsaved locally, then schedules a debounced push. */
export function markUnsaved(listingId: string, slug?: string): void {
  markUnsavedLocally(listingId, slug);
  const entry = useSavedStore.getState().actions.get(listingId);
  if (entry) engine.scheduleSync(entry);
}

/** Immediately flushes any pending debounced saves, bypassing the debounce timer. */
export function flushPendingSaved(): Promise<void> {
  return engine.flush();
}

/** Retries any pushes left queued from a previous session (or a previous failed flush). */
export function drainPendingSaved(): Promise<void> {
  return engine.drainPending();
}

/** Subscribes to "a saved-state flush just reached the server." Returns an unsubscribe fn. */
export function onSavedFlushed(listener: () => void): () => void {
  return engine.onFlushed(listener);
}

/**
 * Delta-pulls saved/unsaved changes since the last call this session and merges
 * them into the store (LWW, tombstones included). Unlike progress, the cursor
 * is not persisted across app restarts — a cold start does one full pull, same
 * as before this module existed; only within-session refreshes narrow by `since`.
 */
export async function hydrateSavedFromServer(): Promise<void> {
  const entries = await engine.hydrate(lastSyncedAt ?? undefined);
  for (const entry of entries) {
    if (!lastSyncedAt || entry.updatedAt > lastSyncedAt) lastSyncedAt = entry.updatedAt;
  }
}
