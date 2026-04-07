import { httpClient, endpoints } from "@sd/core-contracts";
import type { ProgressUpdateDto } from "@sd/core-contracts";
import { useProgressStore } from "../store/progress.store";

let syncTimeout: ReturnType<typeof setTimeout> | null = null;
const SYNC_DEBOUNCE_MS = 5000;

const pendingUpdates = new Map<string, ProgressUpdateDto>();

function flushPending() {
  const updates = Array.from(pendingUpdates.values());
  pendingUpdates.clear();

  for (const update of updates) {
    httpClient({
      url: endpoints.progress.update,
      method: "POST",
      body: update,
    }).catch(() => {
      // Re-queue on failure for next flush
      pendingUpdates.set(update.lectureId, update);
    });
  }
}

/**
 * Enqueue a progress update for debounced sync to backend.
 * Multiple calls for the same lectureId within the debounce window
 * are collapsed into a single request.
 */
export function syncProgressToBackend(update: ProgressUpdateDto) {
  pendingUpdates.set(update.lectureId, update);

  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(flushPending, SYNC_DEBOUNCE_MS);
}

/**
 * Connect the playback store to progress tracking.
 * Call this once at app init to automatically record progress
 * as audio position changes.
 */
export function connectPlaybackToProgress(
  subscribeToPosition: (
    cb: (lectureId: string, position: number, duration: number) => void,
  ) => () => void,
) {
  return subscribeToPosition((lectureId, position, duration) => {
    const { actions } = useProgressStore.getState();
    actions.setProgress(lectureId, position, duration);
    syncProgressToBackend({ lectureId, positionSeconds: position, durationSeconds: duration });
  });
}
