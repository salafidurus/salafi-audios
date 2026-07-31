import { httpClient } from "@sd/core-contracts";
import { vi, describe, it, expect, beforeEach } from "bun:test";

import { useProgressStore } from "./progress.store";
import {
  bulkSyncProgress,
  flushPendingProgress,
  hydrateProgressFromServer,
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
});
