"use client";

import {
  drainPendingProgress,
  flushPendingProgress,
  hydrateProgressFromServer,
  initProgressSync,
  onProgressFlushed,
  useProgressStore,
  type ListingProgress,
} from "@sd/domain-audio";
import {
  drainPendingSaved,
  flushPendingSaved,
  hydrateSavedFromServer,
  initSavedSync,
  onSavedFlushed,
} from "@sd/domain-content";

import { createLocalStorageAdapter } from "../sync/local-storage-adapter";

const STORAGE_KEY_PREFIX = "sd:progress-cache:v1:";
const DEFAULT_PERSIST_THROTTLE_MS = 5000;

function storageKey(userId: string): string {
  return `${STORAGE_KEY_PREFIX}${userId}`;
}

function readCachedProgress(userId: string): ListingProgress[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCachedProgress(userId: string, entries: ListingProgress[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(userId), JSON.stringify(entries));
  } catch {
    // Storage full/unavailable — best-effort only.
  }
}

/**
 * Wires local, per-user local-first sync for the current browser session —
 * both progress and saved/library state: hydrates progress from the local
 * cache immediately (before the network round-trip resolves), then both from
 * the server; persists progress store changes back to the cache (throttled);
 * and flushes any pending debounced sync (both progress and saved) when the
 * tab is hidden or closed, since a plain reload/close would otherwise race
 * the debounce timers. Call once per authenticated session; returns a
 * cleanup function.
 */
export function initProgressPersistence(
  userId: string,
  options: { persistThrottleMs?: number; onFlushed?: () => void } = {},
): () => void {
  const persistThrottleMs = options.persistThrottleMs ?? DEFAULT_PERSIST_THROTTLE_MS;

  const cached = readCachedProgress(userId);
  if (cached.length > 0) {
    useProgressStore.getState().actions.loadProgress(cached);
  }

  void initProgressSync(createLocalStorageAdapter(), userId).then(() => drainPendingProgress());
  void initSavedSync(createLocalStorageAdapter(), userId).then(() => drainPendingSaved());
  void hydrateProgressFromServer();
  void hydrateSavedFromServer();

  let writeTimeout: ReturnType<typeof setTimeout> | null = null;
  const unsubscribe = useProgressStore.subscribe(() => {
    if (writeTimeout) return;
    writeTimeout = setTimeout(() => {
      writeTimeout = null;
      writeCachedProgress(userId, Object.values(useProgressStore.getState().progressMap));
    }, persistThrottleMs);
  });

  const unsubscribeProgressFlushed = options.onFlushed
    ? onProgressFlushed(options.onFlushed)
    : undefined;
  const unsubscribeSavedFlushed = options.onFlushed ? onSavedFlushed(options.onFlushed) : undefined;

  const flush = () => {
    void flushPendingProgress();
    void flushPendingSaved();
  };
  const handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") flush();
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("beforeunload", flush);

  return () => {
    unsubscribe();
    unsubscribeProgressFlushed?.();
    unsubscribeSavedFlushed?.();
    if (writeTimeout) clearTimeout(writeTimeout);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("beforeunload", flush);
  };
}
