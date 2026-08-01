import { describe, it, expect } from "bun:test";

import { getLibraryItemPercent } from "./library-item-progress";

const baseItem = {
  id: "lib-1",
  listingId: "l1",
  listingTitle: "Test",
  listingSlug: "test",
  scholarId: "s1",
  scholarSlug: "scholar",
  scholarName: "Scholar",
};

describe("getLibraryItemPercent", () => {
  it("uses the lesson-count rollup when present", () => {
    const percent = getLibraryItemPercent({
      ...baseItem,
      totalLeafCount: 5,
      completedLeafCount: 2,
      durationSeconds: 1000,
      progressSeconds: 999,
    });

    expect(percent).toBe(40);
  });

  it("treats a missing completedLeafCount as zero", () => {
    const percent = getLibraryItemPercent({ ...baseItem, totalLeafCount: 4 });

    expect(percent).toBe(0);
  });

  it("falls back to position/duration when there is no rollup", () => {
    const percent = getLibraryItemPercent({
      ...baseItem,
      durationSeconds: 200,
      progressSeconds: 50,
    });

    expect(percent).toBe(25);
  });

  it("returns null when neither rollup nor duration/position is available", () => {
    expect(getLibraryItemPercent({ ...baseItem })).toBeNull();
  });
});
