import { httpClient, endpoints } from "@sd/core-contracts";

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
