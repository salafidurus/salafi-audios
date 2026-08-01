import AsyncStorage from "@react-native-async-storage/async-storage";
import { httpClient } from "@sd/core-contracts";
import { syncProgressToBackend, useProgressStore } from "@sd/domain-audio";
import { AppState } from "react-native";

import { initProgressPersistence } from "./progress-persistence";

jest.mock("@sd/core-contracts", () => ({
  httpClient: jest.fn(),
  endpoints: {
    audio: {
      progress: {
        get: "/audio/progress",
        sync: "/audio/progress/sync",
        update: (listingId: string) => `/audio/progress/${listingId}`,
      },
    },
    library: {
      saved: "/me/library/saved",
    },
  },
}));

const mockedHttpClient = jest.mocked(httpClient);
const USER_ID = "user-1";

function storageKey(userId: string) {
  return `sd:progress-cache:v1:${userId}`;
}

function defaultHttpClientMock(opts: { url: string }) {
  if (opts.url === "/me/library/saved") return Promise.resolve({ items: [], hasMore: false });
  return Promise.resolve([]);
}

beforeEach(async () => {
  jest.clearAllMocks();
  mockedHttpClient.mockImplementation(defaultHttpClientMock as any);
  await AsyncStorage.clear();
  useProgressStore.setState({ progressMap: {}, savedMap: {}, lastSyncedAt: null });
});

describe("initProgressPersistence", () => {
  it("hydrates the store from the cached local entries for this user before hitting the network", async () => {
    await AsyncStorage.setItem(
      storageKey(USER_ID),
      JSON.stringify([
        {
          listingId: "l1",
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
          listingId: "l1",
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

  it("fetches the server's saved-listings list once on init", () => {
    const cleanup = initProgressPersistence(USER_ID);

    expect(mockedHttpClient).toHaveBeenCalledWith({
      url: "/me/library/saved",
      method: "GET",
      params: undefined,
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
    expect(parsed.find((e: any) => e.listingId === "l2")?.positionSeconds).toBe(5);

    cleanup();
  });

  it("flushes a pending debounced update immediately when the app backgrounds", async () => {
    const addListenerSpy = jest.spyOn(AppState, "addEventListener");
    const cleanup = initProgressPersistence(USER_ID);
    syncProgressToBackend({ listingId: "l3", positionSeconds: 1, durationSeconds: 100 });
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
});
