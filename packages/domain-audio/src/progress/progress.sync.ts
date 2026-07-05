import { httpClient, endpoints } from "@sd/core-contracts";
import type { ProgressSyncDto, SavedSyncDto } from "@sd/core-contracts";
import { useProgressStore } from "./progress.store";

let syncTimeout: ReturnType<typeof setTimeout> | null = null;
const SYNC_DEBOUNCE_MS = 5000;

const pendingUpdates = new Map<
  string,
  { listingId: string; positionSeconds: number; durationSeconds: number }
>();

function flushPending() {
  const updates = Array.from(pendingUpdates.values());
  pendingUpdates.clear();

  for (const update of updates) {
    httpClient({
      url: endpoints.audio.progress.update(update.listingId),
      method: "PUT",
      body: {
        positionSeconds: update.positionSeconds,
        durationSeconds: update.durationSeconds,
      },
    }).catch(() => {
      pendingUpdates.set(update.listingId, update);
    });
  }
}

/**
 * Enqueue a progress update for debounced sync to backend.
 * Multiple calls for the same listingId within the debounce window
 * are collapsed into a single request.
 */
export function syncProgressToBackend(update: {
  listingId: string;
  positionSeconds: number;
  durationSeconds: number;
}) {
  pendingUpdates.set(update.listingId, update);

  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(flushPending, SYNC_DEBOUNCE_MS);
}

/**
 * Bulk-sync all local progress and saved listings to the server.
 * Sends progress entries to POST /audio/progress/sync and
 * saved listing IDs to POST /me/library/saved/sync.
 */
export async function syncLocalToServer(): Promise<void> {
  const state = useProgressStore.getState();

  const progressEntries = Object.values(state.progressMap);
  const savedIds = state.actions.getSavedIds();

  const promises: Promise<unknown>[] = [];

  if (progressEntries.length > 0) {
    const body: ProgressSyncDto = {
      items: progressEntries.map((p) => ({
        listingId: p.listingId,
        positionSeconds: p.positionSeconds,
        durationSeconds: p.durationSeconds,
        completedAt: p.completedAt,
        updatedAt: p.updatedAt,
      })),
    };
    promises.push(httpClient({ url: endpoints.audio.progress.sync, method: "POST", body }));
  }

  if (savedIds.length > 0) {
    const body: SavedSyncDto = { listingIds: savedIds };
    promises.push(httpClient({ url: endpoints.library.syncSaved, method: "POST", body }));
  }

  await Promise.all(promises);
}

/**
 * Save a listing locally and sync to backend.
 */
export function saveListing(listingId: string) {
  const { actions } = useProgressStore.getState();
  actions.addSaved(listingId);
  httpClient({
    url: endpoints.library.saveListing(listingId),
    method: "POST",
  }).catch(() => {
    // Keep local state; will sync on next bulk sync
  });
}

/**
 * Unsave a listing locally and sync to backend.
 */
export function unsaveListing(listingId: string) {
  const { actions } = useProgressStore.getState();
  actions.removeSaved(listingId);
  httpClient({
    url: endpoints.library.saveListing(listingId),
    method: "DELETE",
  }).catch(() => {
    // Re-add on failure; will correct on next sync
    actions.addSaved(listingId);
  });
}
