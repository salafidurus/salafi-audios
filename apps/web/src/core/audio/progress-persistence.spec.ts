import "@/test-setup";
import { httpClient } from "@sd/core-contracts";
import { flushPendingProgress, syncProgressToBackend, useProgressStore } from "@sd/domain-audio";
import { describe, it, expect, beforeEach, vi } from "bun:test";

import { initProgressPersistence } from "./progress-persistence";

vi.mock("@sd/core-contracts", () => ({
  httpClient: vi.fn<(opts: { url: string }) => Promise<any>>(),
  endpoints: {
    audio: {
      progress: {
        get: "/audio/progress",
        sync: "/audio/progress/sync",
        update: (listingSlug: string) => `/audio/progress/${listingSlug}`,
      },
    },
    library: {
      saved: "/me/my-library/saved",
      savedDelta: "/me/my-library/saved/delta",
      savedSync: "/me/my-library/saved/sync",
      saveListing: (listingId: string) => `/me/my-library/save/${listingId}`,
    },
  },
}));

const USER_ID = "user-1";

function defaultHttpClientMock(opts: { url: string }) {
  if (opts.url === "/me/my-library/saved/delta") return Promise.resolve([]);
  return Promise.resolve([]);
}

beforeEach(() => {
  vi.clearAllMocks();
  (httpClient as any).mockImplementation(defaultHttpClientMock);
  window.localStorage.clear();
  useProgressStore.setState({ progressMap: {}, lastSyncedAt: null });
});

describe("initProgressPersistence", () => {
  it("hydrates the store from the cached local entries for this user before hitting the network", () => {
    window.localStorage.setItem(
      `sd:progress-cache:v1:${USER_ID}`,
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

    expect(useProgressStore.getState().progressMap.l1?.positionSeconds).toBe(42);
    cleanup();
  });

  it("does not leak another user's cached entries into a different user's session", () => {
    window.localStorage.setItem(
      `sd:progress-cache:v1:other-user`,
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

  it("fetches the server's saved-listings delta once on init", () => {
    const cleanup = initProgressPersistence(USER_ID);

    expect(httpClient).toHaveBeenCalledWith({
      url: "/me/my-library/saved/delta",
      method: "GET",
      params: undefined,
    });
    cleanup();
  });

  it("retries a progress push left queued in localStorage from a previous session", async () => {
    window.localStorage.setItem(
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

    expect(httpClient).toHaveBeenCalledWith({
      url: "/audio/progress/l9",
      method: "PUT",
      body: { positionSeconds: 30, durationSeconds: 200 },
    });
    cleanup();
  });

  it("does not retry a push queued under a different user's outbox key", async () => {
    window.localStorage.setItem(
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

    expect(httpClient).not.toHaveBeenCalledWith({
      url: "/audio/progress/l9",
      method: "PUT",
      body: { positionSeconds: 30, durationSeconds: 200 },
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
    expect(parsed.find((e: any) => e.listingSlug === "l2")?.positionSeconds).toBe(5);

    cleanup();
  });

  it("flushes a pending debounced update immediately when the tab becomes hidden", async () => {
    const cleanup = initProgressPersistence(USER_ID);
    syncProgressToBackend({ listingSlug: "l3", positionSeconds: 1, durationSeconds: 100 });
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
    syncProgressToBackend({ listingSlug: "l4", positionSeconds: 2, durationSeconds: 100 });
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

  it("calls onFlushed once a debounced progress sync actually reaches the server", async () => {
    const onFlushed = vi.fn();
    const cleanup = initProgressPersistence(USER_ID, { onFlushed });

    syncProgressToBackend({ listingSlug: "l5", positionSeconds: 3, durationSeconds: 100 });
    Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(onFlushed).toHaveBeenCalledTimes(1);
    cleanup();
  });

  it("stops calling onFlushed after cleanup", async () => {
    const onFlushed = vi.fn();
    const cleanup = initProgressPersistence(USER_ID, { onFlushed });
    cleanup();

    syncProgressToBackend({ listingSlug: "l6", positionSeconds: 3, durationSeconds: 100 });
    await flushPendingProgress();

    expect(onFlushed).not.toHaveBeenCalled();
  });
});
