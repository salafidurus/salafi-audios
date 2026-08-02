import { describe, it, expect, beforeEach } from "bun:test";

import { useProgressStore } from "./progress.store";

describe("useProgressStore.actions.loadProgress", () => {
  beforeEach(() => {
    useProgressStore.setState({ progressMap: {}, lastSyncedAt: null });
  });

  it("inserts entries that have no local counterpart", () => {
    useProgressStore.getState().actions.loadProgress([
      {
        listingId: "l1",
        positionSeconds: 10,
        durationSeconds: 100,
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    ]);

    expect(useProgressStore.getState().progressMap.l1?.positionSeconds).toBe(10);
  });

  it("applies last-write-wins: a newer incoming entry replaces the local one", () => {
    useProgressStore.getState().actions.loadProgress([
      {
        listingId: "l1",
        positionSeconds: 10,
        durationSeconds: 100,
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    ]);

    useProgressStore.getState().actions.loadProgress([
      {
        listingId: "l1",
        positionSeconds: 50,
        durationSeconds: 100,
        updatedAt: "2026-01-02T00:00:00.000Z",
      },
    ]);

    expect(useProgressStore.getState().progressMap.l1?.positionSeconds).toBe(50);
  });

  it("keeps a newer unsynced local edit over a stale incoming (server-pulled) entry", () => {
    // Simulates: setProgress() ran locally (fresh updatedAt, not yet pushed), then a
    // hydrate pulled in an older row from a not-yet-caught-up backend/another device.
    useProgressStore.getState().actions.setProgress("l1", 90, 100);
    const localUpdatedAt = useProgressStore.getState().progressMap.l1?.updatedAt;
    expect(localUpdatedAt).toBeDefined();

    useProgressStore.getState().actions.loadProgress([
      {
        listingId: "l1",
        positionSeconds: 5,
        durationSeconds: 100,
        updatedAt: "2020-01-01T00:00:00.000Z", // deliberately far in the past
      },
    ]);

    expect(useProgressStore.getState().progressMap.l1?.positionSeconds).toBe(90);
    expect(useProgressStore.getState().progressMap.l1?.updatedAt).toBe(localUpdatedAt!);
  });
});
