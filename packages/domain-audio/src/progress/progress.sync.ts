import { httpClient, endpoints } from "@sd/core-contracts";
import type { ProgressSyncDto, SavedSyncDto } from "@sd/core-contracts";
import { useProgressStore } from "./progress.store";

let syncTimeout: ReturnType<typeof setTimeout> | null = null;
const SYNC_DEBOUNCE_MS = 5000;

const pendingUpdates = new Map<string, { lectureId: string; positionSeconds: number; durationSeconds: number }>();

function flushPending() {
  const updates = Array.from(pendingUpdates.values());
  pendingUpdates.clear();

  for (const update of updates) {
    httpClient({
      url: endpoints.audio.progress.update(update.lectureId),
      method: "PUT",
      body: {
        positionSeconds: update.positionSeconds,
        durationSeconds: update.durationSeconds,
      },
    }).catch(() => {
      pendingUpdates.set(update.lectureId, update);
    });
  }
}

/**
 * Enqueue a progress update for debounced sync to backend.
 * Multiple calls for the same lectureId within the debounce window
 * are collapsed into a single request.
 */
export function syncProgressToBackend(update: { lectureId: string; positionSeconds: number; durationSeconds: number }) {
  pendingUpdates.set(update.lectureId, update);

  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(flushPending, SYNC_DEBOUNCE_MS);
}

/**
 * Bulk-sync all local progress and saved lectures to the server.
 * Sends progress entries to POST /audio/progress/sync and
 * saved lecture IDs to POST /me/library/saved/sync.
 */
export async function syncLocalToServer(): Promise<void> {
  const state = useProgressStore.getState();

  const progressEntries = Object.values(state.progressMap);
  const savedIds = state.actions.getSavedIds();

  const promises: Promise<unknown>[] = [];

  if (progressEntries.length > 0) {
    const body: ProgressSyncDto = {
      items: progressEntries.map((p) => ({
        lectureId: p.lectureId,
        positionSeconds: p.positionSeconds,
        durationSeconds: p.durationSeconds,
        completedAt: p.completedAt,
        updatedAt: p.updatedAt,
      })),
    };
    promises.push(httpClient({ url: endpoints.audio.progress.sync, method: "POST", body }));
  }

  if (savedIds.length > 0) {
    const body: SavedSyncDto = { lectureIds: savedIds };
    promises.push(httpClient({ url: endpoints.library.syncSaved, method: "POST", body }));
  }

  await Promise.all(promises);
}

/**
 * Save a lecture locally and sync to backend.
 */
export function saveLecture(lectureId: string) {
  const { actions } = useProgressStore.getState();
  actions.addSaved(lectureId);
  httpClient({
    url: endpoints.library.saveLecture(lectureId),
    method: "POST",
  }).catch(() => {
    // Keep local state; will sync on next bulk sync
  });
}

/**
 * Unsave a lecture locally and sync to backend.
 */
export function unsaveLecture(lectureId: string) {
  const { actions } = useProgressStore.getState();
  actions.removeSaved(lectureId);
  httpClient({
    url: endpoints.library.saveLecture(lectureId),
    method: "DELETE",
  }).catch(() => {
    // Re-add on failure; will correct on next sync
    actions.addSaved(lectureId);
  });
}
