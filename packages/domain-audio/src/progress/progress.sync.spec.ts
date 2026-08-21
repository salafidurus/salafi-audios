import { httpClient } from "@sd/core-contracts";
import { createFakeStorageAdapter } from "@sd/core-sync/test-utils";
import { vi, describe, it, expect, beforeEach } from "bun:test";

import { useProgressStore } from "./progress.store";
import {
  bulkSyncProgress,
  drainPendingProgress,
  flushPendingProgress,
  hydrateProgressFromServer,
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
  },
}));

describe("progress.sync", () => {
  beforeEach(async () => {
    (httpClient as any).mockReset();
    (httpClient as any).mockResolvedValue(undefined);
    // Drain any state left over from a previous test's debounce timer.
    await flushPendingProgress();
    (httpClient as any).mockClear();
    useProgressStore.setState({ progressMap: {}, lastSyncedAt: null });
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
      await initProgressSync(adapter, "user-1");

      (httpClient as any).mockRejectedValueOnce(new Error("network down"));
      syncProgressToBackend({ listingId: "l1", positionSeconds: 90, durationSeconds: 1800 });
      await flushPendingProgress();

      const persisted = await adapter.getItem("sd:outbox:progress:user-1");
      expect(persisted).not.toBeNull();
      expect(JSON.parse(persisted!)).toHaveLength(1);
    });

    it("recovers a queued push across a simulated restart and retries it via drainPendingProgress", async () => {
      const adapter = createFakeStorageAdapter();
      await initProgressSync(adapter, "user-1");

      (httpClient as any).mockRejectedValueOnce(new Error("network down"));
      syncProgressToBackend({ listingId: "l1", positionSeconds: 90, durationSeconds: 1800 });
      await flushPendingProgress();
      (httpClient as any).mockClear();

      // Simulate an app restart: re-init the same user against the same backing storage.
      (httpClient as any).mockResolvedValue(undefined);
      await initProgressSync(adapter, "user-1");
      await drainPendingProgress();

      expect(httpClient).toHaveBeenCalledWith({
        url: "/audio/progress/l1",
        method: "PUT",
        body: { positionSeconds: 90, durationSeconds: 1800 },
      });
      // The entry is removed on success; the outbox writes through an updated
      // (now-empty) array rather than deleting the storage key outright.
      expect(JSON.parse((await adapter.getItem("sd:outbox:progress:user-1"))!)).toEqual([]);
    });

    it("scopes the outbox by userId so a second user's session cannot see or retry the first user's queued push", async () => {
      const adapter = createFakeStorageAdapter();
      await initProgressSync(adapter, "user-1");
      (httpClient as any).mockRejectedValueOnce(new Error("network down"));
      syncProgressToBackend({ listingId: "l1", positionSeconds: 90, durationSeconds: 1800 });
      await flushPendingProgress();
      (httpClient as any).mockClear();

      // A different user signs in on the same device/browser.
      (httpClient as any).mockResolvedValue(undefined);
      await initProgressSync(adapter, "user-2");
      await drainPendingProgress();

      expect(httpClient).not.toHaveBeenCalled();
      // user-1's queued entry is untouched under its own key, not silently dropped.
      expect(JSON.parse((await adapter.getItem("sd:outbox:progress:user-1"))!)).toHaveLength(1);
    });

    it("clears the previous user's in-memory progress when the account changes", async () => {
      const adapter = createFakeStorageAdapter();
      await initProgressSync(adapter, "user-1");
      syncProgressToBackend({ listingId: "l1", positionSeconds: 90, durationSeconds: 1800 });

      await initProgressSync(adapter, "user-2");
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(useProgressStore.getState().actions.getProgress("l1")).toBeUndefined();
      expect(httpClient).not.toHaveBeenCalled();
    });

    it("notifies onProgressFlushed listeners when drainPendingProgress successfully retries an entry", async () => {
      const adapter = createFakeStorageAdapter();
      await initProgressSync(adapter, "user-1");
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
      await initProgressSync(adapter, "user-1");

      const listener = vi.fn();
      const unsubscribe = onProgressFlushed(listener);

      await drainPendingProgress();

      expect(listener).not.toHaveBeenCalled();
      unsubscribe();
    });
  });
});
