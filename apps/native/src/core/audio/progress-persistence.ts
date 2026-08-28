import AsyncStorage from "@react-native-async-storage/async-storage";
import { ListingProgressDtoSchema } from "@sd/core-contracts";
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
import { AppState, type AppStateStatus } from "react-native";

import { createSqliteKvAdapter } from "../sync/sqlite-kv-adapter";

/** Coordinates native playback progress and persistence around the audio engine. */
const STORAGE_KEY_PREFIX = "sd:progress-cache:v1:";
const DEFAULT_PERSIST_THROTTLE_MS = 5000;

function storageKey(userId: string): string {
  return `${STORAGE_KEY_PREFIX}${userId}`;
}

async function readCachedProgress(userId: string): Promise<ListingProgress[]> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.flatMap((entry) => {
          const result = ListingProgressDtoSchema.safeParse(entry);
          return result.success ? [result.data] : [];
        })
      : [];
  } catch {
    return [];
  }
}

async function writeCachedProgress(userId: string, entries: ListingProgress[]): Promise<void> {
  try {
    await AsyncStorage.setItem(storageKey(userId), JSON.stringify(entries));
  } catch {
    // Storage full/unavailable — best-effort only.
  }
}

/**
 * Wires local, per-user local-first sync for the current app session — both
 * progress and saved/my-library state: hydrates progress from the local cache
 * immediately (before the network round-trip resolves), then both from the
 * server; persists progress store changes back to the cache (throttled); and
 * flushes any pending debounced sync (both progress and saved) when the app
 * leaves the foreground, since a force-quit would otherwise race the debounce
 * timers. Call once per authenticated session; returns a cleanup function.
 */
export function initProgressPersistence(
  userId: string,
  options: { persistThrottleMs?: number; onFlushed?: () => void } = {},
): () => void {
  const persistThrottleMs = options.persistThrottleMs ?? DEFAULT_PERSIST_THROTTLE_MS;
  let cancelled = false;

  void readCachedProgress(userId).then((cached) => {
    if (cancelled || cached.length === 0) return;
    useProgressStore.getState().actions.loadProgress(cached);
  });

  void initProgressSync(createSqliteKvAdapter(), userId).then(() => drainPendingProgress());
  void initSavedSync(createSqliteKvAdapter(), userId).then(() => drainPendingSaved());
  void hydrateProgressFromServer();
  void hydrateSavedFromServer();

  let writeTimeout: ReturnType<typeof setTimeout> | null = null;
  const unsubscribe = useProgressStore.subscribe(() => {
    if (writeTimeout) return;
    writeTimeout = setTimeout(() => {
      writeTimeout = null;
      void writeCachedProgress(userId, Object.values(useProgressStore.getState().progressMap));
    }, persistThrottleMs);
  });

  const unsubscribeProgressFlushed = options.onFlushed
    ? onProgressFlushed(options.onFlushed)
    : undefined;
  const unsubscribeSavedFlushed = options.onFlushed ? onSavedFlushed(options.onFlushed) : undefined;

  const handleAppStateChange = (nextState: AppStateStatus) => {
    if (nextState === "background" || nextState === "inactive") {
      void flushPendingProgress();
      void flushPendingSaved();
    }
  };
  const subscription = AppState.addEventListener("change", handleAppStateChange);

  return () => {
    cancelled = true;
    unsubscribe();
    unsubscribeProgressFlushed?.();
    unsubscribeSavedFlushed?.();
    if (writeTimeout) clearTimeout(writeTimeout);
    subscription.remove();
  };
}
