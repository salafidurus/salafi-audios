import { httpClient } from "@sd/core-contracts";
import { createFakeStorageAdapter } from "@sd/core-sync/test-utils";
import { vi, describe, it, expect, beforeEach } from "bun:test";

import { useSavedStore, isSaved } from "./saved.store";
import {
  drainPendingSaved,
  flushPendingSaved,
  hydrateSavedFromServer,
  initSavedSync,
  markSaved,
  markUnsaved,
  onSavedFlushed,
} from "./saved.sync";

vi.mock("@sd/core-contracts", () => ({
  httpClient: vi.fn<() => Promise<any>>(),
  endpoints: {
    library: {
      saveListing: (listingId: string) => `/me/library/save/${listingId}`,
      savedSync: "/me/library/saved/sync",
      savedDelta: "/me/library/saved/delta",
    },
  },
}));

describe("saved.sync", () => {
  beforeEach(async () => {
    (httpClient as any).mockReset();
    (httpClient as any).mockResolvedValue(undefined);
    await initSavedSync(createFakeStorageAdapter(), "user-1");
    await flushPendingSaved();
    (httpClient as any).mockClear();
    useSavedStore.setState({ entities: {} });
  });

  describe("markSaved / markUnsaved + flushPendingSaved", () => {
    it("optimistically marks saved locally, then pushes a POST on flush", async () => {
      markSaved("l1");
      expect(isSaved("l1")).toBe(true);

      await flushPendingSaved();

      expect(httpClient).toHaveBeenCalledWith({
        url: "/me/library/save/l1",
        method: "POST",
      });
    });

    it("optimistically marks unsaved locally, then pushes a DELETE on flush", async () => {
      markSaved("l1");
      await flushPendingSaved();
      (httpClient as any).mockClear();

      markUnsaved("l1");
      expect(isSaved("l1")).toBe(false);

      await flushPendingSaved();

      expect(httpClient).toHaveBeenCalledWith({
        url: "/me/library/save/l1",
        method: "DELETE",
      });
    });

    it("pushes by slug, not the uuid id — the single-item endpoint only resolves by slug", async () => {
      markSaved("l1", "tafsir-al-fatiha");

      await flushPendingSaved();

      expect(httpClient).toHaveBeenCalledWith({
        url: "/me/library/save/tafsir-al-fatiha",
        method: "POST",
      });
    });

    it("falls back to the id when no slug was ever recorded", async () => {
      markSaved("l1");

      await flushPendingSaved();

      expect(httpClient).toHaveBeenCalledWith({
        url: "/me/library/save/l1",
        method: "POST",
      });
    });

    it("re-queues a failed push in the persisted outbox for the next flush", async () => {
      (httpClient as any).mockRejectedValueOnce(new Error("network down"));
      markSaved("l1");
      await flushPendingSaved();
      expect(httpClient).toHaveBeenCalledTimes(1);

      (httpClient as any).mockResolvedValueOnce(undefined);
      await flushPendingSaved();

      expect(httpClient).toHaveBeenCalledTimes(2);
    });
  });

  describe("onSavedFlushed", () => {
    it("notifies subscribers after a flush completes", async () => {
      const listener = vi.fn();
      const unsubscribe = onSavedFlushed(listener);

      markSaved("l1");
      await flushPendingSaved();

      expect(listener).toHaveBeenCalledTimes(1);
      unsubscribe();
    });
  });

  describe("hydrateSavedFromServer", () => {
    it("fetches the delta endpoint and merges results into the store", async () => {
      (httpClient as any).mockResolvedValue([
        {
          listingId: "l1",
          updatedAt: "2026-01-01T00:00:00.000Z",
          savedAt: "2026-01-01T00:00:00.000Z",
        },
      ]);

      await hydrateSavedFromServer();

      expect(httpClient).toHaveBeenCalledWith({
        url: "/me/library/saved/delta",
        method: "GET",
        params: undefined,
      });
      expect(isSaved("l1")).toBe(true);
    });

    it("removes a locally-saved entry when the server delta reports a newer tombstone", async () => {
      markSaved("l1");
      await flushPendingSaved();
      // Must postdate the local write above, or LWW correctly keeps the local
      // "saved" state and this assertion would be testing the wrong thing.
      const future = new Date(Date.now() + 60_000).toISOString();
      (httpClient as any).mockResolvedValue([
        { listingId: "l1", updatedAt: future, deletedAt: future },
      ]);

      await hydrateSavedFromServer();

      expect(isSaved("l1")).toBe(false);
    });

    it("passes the last-seen updatedAt as since on a subsequent call within the same session", async () => {
      (httpClient as any).mockResolvedValueOnce([
        {
          listingId: "l1",
          updatedAt: "2026-01-01T00:00:00.000Z",
          savedAt: "2026-01-01T00:00:00.000Z",
        },
      ]);
      await hydrateSavedFromServer();
      (httpClient as any).mockResolvedValueOnce([]);

      await hydrateSavedFromServer();

      expect(httpClient).toHaveBeenNthCalledWith(2, {
        url: "/me/library/saved/delta",
        method: "GET",
        params: { since: "2026-01-01T00:00:00.000Z" },
      });
    });
  });

  describe("drainPendingSaved", () => {
    it("retries a push left queued from a previous failed flush", async () => {
      (httpClient as any).mockRejectedValueOnce(new Error("network down"));
      markSaved("l1");
      await flushPendingSaved();
      (httpClient as any).mockClear();
      (httpClient as any).mockResolvedValue(undefined);

      await drainPendingSaved();

      expect(httpClient).toHaveBeenCalledWith({
        url: "/me/library/save/l1",
        method: "POST",
      });
    });
  });
});
