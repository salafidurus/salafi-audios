import { httpClient } from "@sd/core-contracts";
import { createFakeStorageAdapter } from "@sd/core-sync/test-utils";
import { vi, describe, it, expect, beforeEach } from "bun:test";

import { useProgressStore } from "./progress.store";
import {
  bulkSyncProgress,
  drainPendingProgress,
  flushPendingProgress,
  hydrateProgressFromServer,
  hydrateSavedFromServer,
  initProgressSync,
  onProgressFlushed,
  syncProgressToBackend,
} from "./progress.sync";

vi.mock("@sd/core-contracts", () => ({
  httpClient: vi.fn<() => Promise<any>>(),
  endpoints: {
    audio: {
      progress: {
        update: (listingId: string) => `/audio/progress/${listingId}`,
        get: "/audio/progress",
        sync: "/audio/progress/sync",
      },
    },
    library: {
      saved: "/me/library/saved",
    },
  },
}));

describe("progress.sync", () => {
  beforeEach(async () => {
    (httpClient as any).mockReset();
    (httpClient as any).mockResolvedValue(undefined);
    // Drain any state left over from a previous test's debounce timer.
    await flushPendingProgress();
    (httpClient as any).mockClear();
    useProgressStore.setState({ progressMap: {}, savedMap: {}, lastSyncedAt: null });
  });

  describe("syncProgressToBackend + flushPendingProgress", () => {
    it("immediately flushes a pending update, bypassing the debounce timer", async () => {
      syncProgressToBackend({ listingId: "l1", positionSeconds: 90, durationSeconds: 1800 });

      await flushPendingProgress();

      expect(httpClient).toHaveBeenCalledWith({
        url: "/audio/progress/l1",
        method: "PUT",
        body: { positionSeconds: 90, durationSeconds: 1800 },
      });
    });

    it("resolves without calling httpClient when there is nothing pending", async () => {
      await flushPendingProgress();

      expect(httpClient).not.toHaveBeenCalled();
    });

    it("re-queues a failed update so the next flush retries it", async () => {
      (httpClient as any).mockRejectedValueOnce(new Error("network down"));
      syncProgressToBackend({ listingId: "l1", positionSeconds: 90, durationSeconds: 1800 });
      await flushPendingProgress();
      expect(httpClient).toHaveBeenCalledTimes(1);

      (httpClient as any).mockResolvedValueOnce(undefined);
      await flushPendingProgress();

      expect(httpClient).toHaveBeenCalledTimes(2);
    });
  });

  describe("hydrateProgressFromServer", () => {
    it("fetches without a since param on first hydration and loads results into the store", async () => {
      (httpClient as any).mockResolvedValue([
        {
          listingId: "l1",
          positionSeconds: 100,
          durationSeconds: 200,
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ]);

      await hydrateProgressFromServer();

      expect(httpClient).toHaveBeenCalledWith({
        url: "/audio/progress",
        method: "GET",
        params: undefined,
      });
      expect(useProgressStore.getState().progressMap.l1).toEqual({
        listingId: "l1",
        positionSeconds: 100,
        durationSeconds: 200,
        updatedAt: "2026-01-01T00:00:00.000Z",
      });
      expect(useProgressStore.getState().lastSyncedAt).not.toBeNull();
    });

    it("passes the stored lastSyncedAt as since on a subsequent hydration", async () => {
      useProgressStore.setState({ lastSyncedAt: "2026-01-01T00:00:00.000Z" });
      (httpClient as any).mockResolvedValue([]);

      await hydrateProgressFromServer();

      expect(httpClient).toHaveBeenCalledWith({
        url: "/audio/progress",
        method: "GET",
        params: { since: "2026-01-01T00:00:00.000Z" },
      });
    });
  });

  describe("onProgressFlushed", () => {
    it("notifies subscribers after a flush completes, even a partially-failed one", async () => {
      const listener = vi.fn();
      const unsubscribe = onProgressFlushed(listener);

      syncProgressToBackend({ listingId: "l1", positionSeconds: 1, durationSeconds: 100 });
      await flushPendingProgress();

      expect(listener).toHaveBeenCalledTimes(1);
      unsubscribe();
    });

    it("stops notifying once unsubscribed", async () => {
      const listener = vi.fn();
      const unsubscribe = onProgressFlushed(listener);
      unsubscribe();

      syncProgressToBackend({ listingId: "l1", positionSeconds: 1, durationSeconds: 100 });
      await flushPendingProgress();

      expect(listener).not.toHaveBeenCalled();
    });

    it("does not notify when flushing with nothing pending", async () => {
      const listener = vi.fn();
      const unsubscribe = onProgressFlushed(listener);

      await flushPendingProgress();

      expect(listener).not.toHaveBeenCalled();
      unsubscribe();
    });
  });

  describe("hydrateSavedFromServer", () => {
    it("loads the first page's saved items into the store", async () => {
      (httpClient as any).mockResolvedValue({
        items: [{ listingId: "l1", savedAt: "2026-01-01T00:00:00.000Z" }],
        hasMore: false,
      });

      await hydrateSavedFromServer();

      expect(httpClient).toHaveBeenCalledWith({
        url: "/me/library/saved",
        method: "GET",
        params: undefined,
      });
      expect(useProgressStore.getState().savedMap.l1).toBe("2026-01-01T00:00:00.000Z");
    });

    it("pages through until hasMore is false", async () => {
      (httpClient as any)
        .mockResolvedValueOnce({
          items: [{ listingId: "l1", savedAt: "2026-01-01T00:00:00.000Z" }],
          hasMore: true,
          nextCursor: "l1",
        })
        .mockResolvedValueOnce({
          items: [{ listingId: "l2", savedAt: "2026-01-02T00:00:00.000Z" }],
          hasMore: false,
        });

      await hydrateSavedFromServer();

      expect(httpClient).toHaveBeenCalledTimes(2);
      expect(httpClient).toHaveBeenNthCalledWith(2, {
        url: "/me/library/saved",
        method: "GET",
        params: { cursor: "l1" },
      });
      expect(useProgressStore.getState().savedMap).toEqual({
        l1: "2026-01-01T00:00:00.000Z",
        l2: "2026-01-02T00:00:00.000Z",
      });
    });

    it("skips items with no savedAt", async () => {
      (httpClient as any).mockResolvedValue({
        items: [{ listingId: "l1", savedAt: undefined }],
        hasMore: false,
      });

      await hydrateSavedFromServer();

      expect(useProgressStore.getState().savedMap.l1).toBeUndefined();
    });
  });

  describe("bulkSyncProgress", () => {
    it("posts the given items to the sync endpoint", async () => {
      const items = [
        {
          listingId: "l1",
          positionSeconds: 10,
          durationSeconds: 100,
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ];

      await bulkSyncProgress(items);

      expect(httpClient).toHaveBeenCalledWith({
        url: "/audio/progress/sync",
        method: "POST",
        body: { items },
      });
    });

    it("does not call httpClient for an empty batch", async () => {
      await bulkSyncProgress([]);

      expect(httpClient).not.toHaveBeenCalled();
    });
  });

  describe("persisted retry queue (initProgressSync / drainPendingProgress)", () => {
    it("queues a failed push in the persisted outbox rather than only in-memory", async () => {
      const adapter = createFakeStorageAdapter();
      await initProgressSync(adapter);

      (httpClient as any).mockRejectedValueOnce(new Error("network down"));
      syncProgressToBackend({ listingId: "l1", positionSeconds: 90, durationSeconds: 1800 });
      await flushPendingProgress();

      const persisted = await adapter.getItem("sd:outbox:progress");
      expect(persisted).not.toBeNull();
      expect(JSON.parse(persisted!)).toHaveLength(1);
    });

    it("recovers a queued push across a simulated restart and retries it via drainPendingProgress", async () => {
      const adapter = createFakeStorageAdapter();
      await initProgressSync(adapter);

      (httpClient as any).mockRejectedValueOnce(new Error("network down"));
      syncProgressToBackend({ listingId: "l1", positionSeconds: 90, durationSeconds: 1800 });
      await flushPendingProgress();
      (httpClient as any).mockClear();

      // Simulate an app restart: re-init against the same backing storage.
      (httpClient as any).mockResolvedValue(undefined);
      await initProgressSync(adapter);
      await drainPendingProgress();

      expect(httpClient).toHaveBeenCalledWith({
        url: "/audio/progress/l1",
        method: "PUT",
        body: { positionSeconds: 90, durationSeconds: 1800 },
      });
      // The entry is removed on success; the outbox writes through an updated
      // (now-empty) array rather than deleting the storage key outright.
      expect(JSON.parse((await adapter.getItem("sd:outbox:progress"))!)).toEqual([]);
    });

    it("notifies onProgressFlushed listeners when drainPendingProgress successfully retries an entry", async () => {
      const adapter = createFakeStorageAdapter();
      await initProgressSync(adapter);
      (httpClient as any).mockRejectedValueOnce(new Error("network down"));
      syncProgressToBackend({ listingId: "l1", positionSeconds: 90, durationSeconds: 1800 });
      await flushPendingProgress();

      const listener = vi.fn();
      const unsubscribe = onProgressFlushed(listener);
      (httpClient as any).mockResolvedValue(undefined);

      await drainPendingProgress();

      expect(listener).toHaveBeenCalledTimes(1);
      unsubscribe();
    });

    it("drainPendingProgress does not notify listeners when there was nothing queued", async () => {
      const adapter = createFakeStorageAdapter();
      await initProgressSync(adapter);

      const listener = vi.fn();
      const unsubscribe = onProgressFlushed(listener);

      await drainPendingProgress();

      expect(listener).not.toHaveBeenCalled();
      unsubscribe();
    });
  });
});
