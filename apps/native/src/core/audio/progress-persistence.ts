import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  flushPendingProgress,
  hydrateProgressFromServer,
  hydrateSavedFromServer,
  useProgressStore,
  type ListingProgress,
} from "@sd/domain-audio";
import { AppState, type AppStateStatus } from "react-native";

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
    return Array.isArray(parsed) ? parsed : [];
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
 * Wires local, per-user progress persistence for the current app session:
 * hydrates from the local cache immediately (before the network round-trip
 * resolves), then from the server; persists store changes back to the cache
 * (throttled); and flushes any pending debounced sync when the app leaves
 * the foreground, since a force-quit would otherwise race the 5s debounce
 * timer in progress.sync.ts. Call once per authenticated session; returns a
 * cleanup function.
 */
export function initProgressPersistence(
  userId: string,
  options: { persistThrottleMs?: number } = {},
): () => void {
  const persistThrottleMs = options.persistThrottleMs ?? DEFAULT_PERSIST_THROTTLE_MS;
  let cancelled = false;

  void readCachedProgress(userId).then((cached) => {
    if (cancelled || cached.length === 0) return;
    useProgressStore.getState().actions.loadProgress(cached);
  });

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

  const handleAppStateChange = (nextState: AppStateStatus) => {
    if (nextState === "background" || nextState === "inactive") {
      void flushPendingProgress();
    }
  };
  const subscription = AppState.addEventListener("change", handleAppStateChange);

  return () => {
    cancelled = true;
    unsubscribe();
    if (writeTimeout) clearTimeout(writeTimeout);
    subscription.remove();
  };
}
