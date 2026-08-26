import AsyncStorage from "@react-native-async-storage/async-storage";
import { httpClient } from "@sd/core-contracts";
import { flushPendingProgress, syncProgressToBackend, useProgressStore } from "@sd/domain-audio";
import { hydrateSavedFromServer } from "@sd/domain-content";
import { AppState } from "react-native";

import { initProgressPersistence } from "./progress-persistence";

// Mocked (not just @sd/core-contracts) because @sd/domain-content's package
// root re-exports unrelated hooks/utils with their own module-level side
// effects (e.g. a fallback QueryClient instantiation) that don't play well
// with this file's minimal jest environment — same convention already used
// by other native specs that touch @sd/domain-content (e.g.
// library-saved.screen.spec.tsx). Saved-sync's real behavior is covered by
// @sd/domain-content's own saved.sync.spec.ts.
jest.mock("@sd/domain-content", () => ({
  initSavedSync: jest.fn(async () => {}),
  drainPendingSaved: jest.fn(async () => {}),
  hydrateSavedFromServer: jest.fn(async () => {}),
  flushPendingSaved: jest.fn(async () => {}),
  onSavedFlushed: jest.fn(() => () => {}),
}));

jest.mock("@sd/core-contracts", () => ({
  ...jest.requireActual("@sd/core-contracts"),
  httpClient: jest.fn(),
  endpoints: {
    audio: {
      progress: {
        get: "/audio/progress",
        sync: "/audio/progress/sync",
        update: (listingSlug: string) => `/audio/progress/${listingSlug}`,
      },
    },
  },
}));

jest.mock("expo-sqlite", () => {
  const store = new Map<string, string>();
  return {
    __store: store,
    openDatabaseAsync: jest.fn(async () => ({
      execAsync: jest.fn(async () => {}),
      runAsync: jest.fn(async (sql: string, key: string, value?: string) => {
        if (sql.startsWith("INSERT")) store.set(key, value as string);
        else if (sql.startsWith("DELETE")) store.delete(key);
      }),
      getFirstAsync: jest.fn(async (_sql: string, key: string) => {
        const value = store.get(key);
        return value === undefined ? null : { value };
      }),
    })),
  };
});

const mockedHttpClient = jest.mocked(httpClient);
const USER_ID = "user-1";

function storageKey(userId: string) {
  return `sd:progress-cache:v1:${userId}`;
}

function defaultHttpClientMock() {
  return Promise.resolve([]);
}

beforeEach(async () => {
  jest.clearAllMocks();
  mockedHttpClient.mockImplementation(defaultHttpClientMock as any);
  await AsyncStorage.clear();
  (jest.requireMock("expo-sqlite") as { __store: Map<string, string> }).__store.clear();
  useProgressStore.setState({ progressMap: {}, lastSyncedAt: null });
});

describe("initProgressPersistence", () => {
  it("hydrates the store from the cached local entries for this user before hitting the network", async () => {
    await AsyncStorage.setItem(
      storageKey(USER_ID),
      JSON.stringify([
        {
          listingSlug: "l1",
          positionSeconds: 42,
          durationSeconds: 100,
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ]),
    );

    const cleanup = initProgressPersistence(USER_ID);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(useProgressStore.getState().progressMap.l1?.positionSeconds).toBe(42);
    cleanup();
  });

  it("does not leak another user's cached entries into a different user's session", async () => {
    await AsyncStorage.setItem(
      storageKey("other-user"),
      JSON.stringify([
        {
          listingSlug: "l1",
          positionSeconds: 42,
          durationSeconds: 100,
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ]),
    );

    const cleanup = initProgressPersistence(USER_ID);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(useProgressStore.getState().progressMap.l1).toBeUndefined();
    cleanup();
  });

  it("fetches server progress once on init", () => {
    const cleanup = initProgressPersistence(USER_ID);

    expect(mockedHttpClient).toHaveBeenCalledWith({
      url: "/audio/progress",
      method: "GET",
      params: undefined,
    });
    cleanup();
  });

  it("hydrates saved/library state from the server once on init", () => {
    const cleanup = initProgressPersistence(USER_ID);

    expect(hydrateSavedFromServer).toHaveBeenCalledTimes(1);
    cleanup();
  });

  it("retries a progress push left queued in SQLite from a previous session", async () => {
    const { __store } = jest.requireMock("expo-sqlite") as { __store: Map<string, string> };
    __store.set(
      `sd:outbox:progress:${USER_ID}`,
      JSON.stringify([
        {
          id: "outbox-1",
          type: "progress-update",
          payload: { listingSlug: "l9", positionSeconds: 30, durationSeconds: 200 },
          createdAt: Date.now(),
          retries: 0,
        },
      ]),
    );

    const cleanup = initProgressPersistence(USER_ID);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockedHttpClient).toHaveBeenCalledWith({
      url: "/audio/progress/l9",
      method: "PUT",
      body: { positionSeconds: 30, durationSeconds: 200 },
    });
    cleanup();
  });

  it("does not retry a push queued under a different user's outbox key", async () => {
    const { __store } = jest.requireMock("expo-sqlite") as { __store: Map<string, string> };
    __store.set(
      `sd:outbox:progress:other-user`,
      JSON.stringify([
        {
          id: "outbox-1",
          type: "progress-update",
          payload: { listingSlug: "l9", positionSeconds: 30, durationSeconds: 200 },
          createdAt: Date.now(),
          retries: 0,
        },
      ]),
    );

    const cleanup = initProgressPersistence(USER_ID);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockedHttpClient).not.toHaveBeenCalledWith({
      url: "/audio/progress/l9",
      method: "PUT",
      body: { positionSeconds: 30, durationSeconds: 200 },
    });
    cleanup();
  });

  it("persists store changes to the per-user cache after the throttle window", async () => {
    const cleanup = initProgressPersistence(USER_ID, { persistThrottleMs: 10 });

    useProgressStore.getState().actions.setProgress("l2", 5, 100);
    await new Promise((resolve) => setTimeout(resolve, 40));

    const raw = await AsyncStorage.getItem(storageKey(USER_ID));
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.find((e: any) => e.listingSlug === "l2")?.positionSeconds).toBe(5);

    cleanup();
  });

  it("flushes a pending debounced update immediately when the app backgrounds", async () => {
    const addListenerSpy = jest.spyOn(AppState, "addEventListener");
    const cleanup = initProgressPersistence(USER_ID);
    syncProgressToBackend({ listingSlug: "l3", positionSeconds: 1, durationSeconds: 100 });
    mockedHttpClient.mockClear();

    const onChange = addListenerSpy.mock.calls.find((call) => call[0] === "change")?.[1];
    onChange?.("background");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockedHttpClient).toHaveBeenCalledWith({
      url: "/audio/progress/l3",
      method: "PUT",
      body: { positionSeconds: 1, durationSeconds: 100 },
    });
    cleanup();
    addListenerSpy.mockRestore();
  });

  it("stops listening after cleanup is called", () => {
    const removeSpy = jest.fn();
    jest.spyOn(AppState, "addEventListener").mockReturnValue({ remove: removeSpy } as any);

    const cleanup = initProgressPersistence(USER_ID);
    cleanup();

    expect(removeSpy).toHaveBeenCalled();
    jest.restoreAllMocks();
  });

  it("calls onFlushed once a debounced progress sync actually reaches the server", async () => {
    const addListenerSpy = jest.spyOn(AppState, "addEventListener");
    const onFlushed = jest.fn();
    const cleanup = initProgressPersistence(USER_ID, { onFlushed });

    syncProgressToBackend({ listingSlug: "l5", positionSeconds: 3, durationSeconds: 100 });
    const onChange = addListenerSpy.mock.calls.find((call) => call[0] === "change")?.[1];
    onChange?.("background");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(onFlushed).toHaveBeenCalledTimes(1);
    cleanup();
    addListenerSpy.mockRestore();
  });

  it("stops calling onFlushed after cleanup", async () => {
    jest.spyOn(AppState, "addEventListener").mockReturnValue({ remove: jest.fn() } as any);
    const onFlushed = jest.fn();
    const cleanup = initProgressPersistence(USER_ID, { onFlushed });
    cleanup();

    syncProgressToBackend({ listingSlug: "l6", positionSeconds: 3, durationSeconds: 100 });
    await flushPendingProgress();

    expect(onFlushed).not.toHaveBeenCalled();
    jest.restoreAllMocks();
  });
});
