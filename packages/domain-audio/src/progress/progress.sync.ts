import {
  httpClient,
  endpoints,
  type AudioProgressDto,
  type ProgressSyncItemDto,
  type LibraryPageDto,
} from "@sd/core-contracts";

import { useProgressStore } from "./progress.store";

let syncTimeout: ReturnType<typeof setTimeout> | null = null;
// Batched: individual position ticks debounce into one write per listing every
// couple of minutes rather than every few seconds. `flushPendingProgress` is
// still called directly at lesson-end and app-background, so completion and
// backgrounding are never delayed by this window.
const SYNC_DEBOUNCE_MS = 120_000;

const pendingUpdates = new Map<
  string,
  { listingId: string; positionSeconds: number; durationSeconds: number }
>();

const flushListeners = new Set<() => void>();

/**
 * Subscribes to "a progress flush just completed" — used by each app's
 * progress-persistence layer to invalidate library queries once fresh data
 * has actually reached the server, without domain-audio depending on
 * react-query. Returns an unsubscribe function.
 */
export function onProgressFlushed(listener: () => void): () => void {
  flushListeners.add(listener);
  return () => flushListeners.delete(listener);
}

async function flushPending(): Promise<void> {
  const updates = Array.from(pendingUpdates.values());
  if (updates.length === 0) return;
  pendingUpdates.clear();

  await Promise.all(
    updates.map((update) =>
      httpClient({
        url: endpoints.audio.progress.update(update.listingId),
        method: "PUT",
        body: {
          positionSeconds: update.positionSeconds,
          durationSeconds: update.durationSeconds,
        },
      }).catch(() => {
        pendingUpdates.set(update.listingId, update);
      }),
    ),
  );

  for (const listener of flushListeners) listener();
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
  syncTimeout = setTimeout(() => {
    void flushPending();
  }, SYNC_DEBOUNCE_MS);
}

/**
 * Immediately flushes any pending debounced progress updates, bypassing the
 * debounce timer. Intended for app-background/tab-close hooks, wired at the
 * app layer (this package has no lifecycle-event access of its own).
 */
export function flushPendingProgress(): Promise<void> {
  if (syncTimeout) {
    clearTimeout(syncTimeout);
    syncTimeout = null;
  }
  return flushPending();
}

/**
 * Fetches the user's progress from the server and merges it into
 * `useProgressStore`. Uses the store's own `lastSyncedAt` as a delta cursor
 * after the first call, so repeated calls within a session only pull changes.
 */
export async function hydrateProgressFromServer(): Promise<void> {
  const since = useProgressStore.getState().lastSyncedAt ?? undefined;

  const entries = await httpClient<AudioProgressDto[]>({
    url: endpoints.audio.progress.get,
    method: "GET",
    params: since ? { since } : undefined,
  });

  useProgressStore.getState().actions.loadProgress(entries);
  useProgressStore.getState().actions.setLastSyncedAt(new Date().toISOString());
}

const MAX_SAVED_HYDRATION_PAGES = 20;

/**
 * Fetches the user's full saved-listings list from the server and loads it
 * into `useProgressStore.savedMap`, so the saved heart/button reflects
 * server truth everywhere a listing is rendered, not just on the
 * `/library/saved` screen (which queries the same endpoint independently).
 */
export async function hydrateSavedFromServer(): Promise<void> {
  const entries: { listingId: string; savedAt: string }[] = [];
  let cursor: string | undefined;

  for (let page = 0; page < MAX_SAVED_HYDRATION_PAGES; page++) {
    const response = await httpClient<LibraryPageDto>({
      url: endpoints.library.saved,
      method: "GET",
      params: cursor ? { cursor } : undefined,
    });

    for (const item of response.items) {
      if (item.savedAt) entries.push({ listingId: item.listingId, savedAt: item.savedAt });
    }

    if (!response.hasMore || !response.nextCursor) break;
    cursor = response.nextCursor;
  }

  useProgressStore.getState().actions.loadSaved(entries);
}

/** Bulk-syncs a batch of progress entries to the server in one request. */
export async function bulkSyncProgress(items: ProgressSyncItemDto[]): Promise<void> {
  if (items.length === 0) return;

  await httpClient({
    url: endpoints.audio.progress.sync,
    method: "POST",
    body: { items },
  });
}
