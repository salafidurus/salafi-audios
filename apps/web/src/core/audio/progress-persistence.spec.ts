import "@/test-setup";
import { httpClient } from "@sd/core-contracts";
import { syncProgressToBackend, useProgressStore } from "@sd/domain-audio";
import { describe, it, expect, beforeEach, vi } from "bun:test";

import { initProgressPersistence } from "./progress-persistence";

vi.mock("@sd/core-contracts", () => ({
  httpClient: vi.fn<(opts: { url: string }) => Promise<any>>(),
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

const USER_ID = "user-1";

function defaultHttpClientMock(opts: { url: string }) {
  if (opts.url === "/me/library/saved") return Promise.resolve({ items: [], hasMore: false });
  return Promise.resolve([]);
}

beforeEach(() => {
  vi.clearAllMocks();
  (httpClient as any).mockImplementation(defaultHttpClientMock);
  window.localStorage.clear();
  useProgressStore.setState({ progressMap: {}, savedMap: {}, lastSyncedAt: null });
});

describe("initProgressPersistence", () => {
  it("hydrates the store from the cached local entries for this user before hitting the network", () => {
    window.localStorage.setItem(
      `sd:progress-cache:v1:${USER_ID}`,
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

    expect(useProgressStore.getState().progressMap.l1?.positionSeconds).toBe(42);
    cleanup();
  });

  it("does not leak another user's cached entries into a different user's session", () => {
    window.localStorage.setItem(
      `sd:progress-cache:v1:other-user`,
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

    expect(useProgressStore.getState().progressMap.l1).toBeUndefined();
    cleanup();
  });

  it("fetches server progress once on init", () => {
    const cleanup = initProgressPersistence(USER_ID);

    expect(httpClient).toHaveBeenCalledWith({
      url: "/audio/progress",
      method: "GET",
      params: undefined,
    });
    cleanup();
  });

  it("fetches the server's saved-listings list once on init", () => {
    const cleanup = initProgressPersistence(USER_ID);

    expect(httpClient).toHaveBeenCalledWith({
      url: "/me/library/saved",
      method: "GET",
      params: undefined,
    });
    cleanup();
  });

  it("persists store changes to the per-user cache after the throttle window", async () => {
    const cleanup = initProgressPersistence(USER_ID, { persistThrottleMs: 10 });

    useProgressStore.getState().actions.setProgress("l2", 5, 100);
    await new Promise((resolve) => setTimeout(resolve, 30));

    const raw = window.localStorage.getItem(`sd:progress-cache:v1:${USER_ID}`);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.find((e: any) => e.listingId === "l2")?.positionSeconds).toBe(5);

    cleanup();
  });

  it("flushes a pending debounced update immediately when the tab becomes hidden", async () => {
    const cleanup = initProgressPersistence(USER_ID);
    syncProgressToBackend({ listingId: "l3", positionSeconds: 1, durationSeconds: 100 });
    (httpClient as any).mockClear();

    Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(httpClient).toHaveBeenCalledWith({
      url: "/audio/progress/l3",
      method: "PUT",
      body: { positionSeconds: 1, durationSeconds: 100 },
    });
    cleanup();
  });

  it("flushes a pending debounced update immediately on beforeunload", async () => {
    const cleanup = initProgressPersistence(USER_ID);
    syncProgressToBackend({ listingId: "l4", positionSeconds: 2, durationSeconds: 100 });
    (httpClient as any).mockClear();

    window.dispatchEvent(new Event("beforeunload"));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(httpClient).toHaveBeenCalledWith({
      url: "/audio/progress/l4",
      method: "PUT",
      body: { positionSeconds: 2, durationSeconds: 100 },
    });
    cleanup();
  });

  it("stops listening after cleanup is called", () => {
    const cleanup = initProgressPersistence(USER_ID);
    cleanup();
    (httpClient as any).mockClear();

    window.dispatchEvent(new Event("beforeunload"));

    expect(httpClient).not.toHaveBeenCalled();
  });
});
