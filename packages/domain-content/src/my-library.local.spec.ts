import type { ListingProgress } from "@sd/domain-audio";

import { describe, it, expect } from "bun:test";

import { localProgressItems, localSavedItems, localCompletedItems } from "./my-library.local";

const makeProgress = (
  listingSlug: string,
  positionSeconds: number,
  durationSeconds: number,
  extra?: Partial<ListingProgress>,
): ListingProgress => ({
  listingSlug,
  positionSeconds,
  durationSeconds,
  updatedAt: "2024-01-01T00:00:00Z",
  ...extra,
});

describe("localProgressItems", () => {
  it("returns empty array for empty progress map", () => {
    expect(localProgressItems({})).toEqual([]);
  });

  it("includes entries with positionSeconds > 0 and no completedAt", () => {
    const entry = makeProgress("lec1", 100, 600);
    const result = localProgressItems({ lec1: entry });
    expect(result).toHaveLength(1);
    expect(result[0]!.listingSlug).toBe("lec1");
    expect(result[0]!.progressSeconds).toBe(100);
    expect(result[0]!.durationSeconds).toBe(600);
  });

  it("excludes entries where positionSeconds is 0", () => {
    const entry = makeProgress("lec1", 0, 600);
    expect(localProgressItems({ lec1: entry })).toHaveLength(0);
  });

  it("excludes completed entries", () => {
    const entry = makeProgress("lec1", 600, 600, {
      completedAt: "2024-01-01T00:00:00Z",
    });
    expect(localProgressItems({ lec1: entry })).toHaveLength(0);
  });

  it("sorts by updatedAt descending (newest first)", () => {
    const map = {
      lec1: makeProgress("lec1", 10, 600, { updatedAt: "2024-01-01T00:00:00Z" }),
      lec2: makeProgress("lec2", 20, 600, { updatedAt: "2024-02-01T00:00:00Z" }),
    };
    const result = localProgressItems(map);
    expect(result[0]!.listingSlug).toBe("lec2");
    expect(result[1]!.listingSlug).toBe("lec1");
  });

  it("maps to MyLibraryItemDto shape", () => {
    const entry = makeProgress("lec1", 50, 300);
    const [item] = localProgressItems({ lec1: entry });
    expect(item).toMatchObject({
      id: "lec1",
      listingId: "lec1",
      progressSeconds: 50,
      durationSeconds: 300,
      scholarId: "",
      scholarSlug: "",
      scholarName: "",
    });
  });
});

describe("localSavedItems", () => {
  it("returns empty array for no saved entries", () => {
    expect(localSavedItems([])).toEqual([]);
  });

  it("converts saved entries to MyLibraryItemDto", () => {
    const result = localSavedItems([
      { id: "lec1", updatedAt: "2024-01-01T00:00:00Z", savedAt: "2024-01-01T00:00:00Z" },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0]!.listingSlug).toBe("lec1");
    expect(result[0]!.savedAt).toBe("2024-01-01T00:00:00Z");
  });

  it("sorts by savedAt descending (newest first)", () => {
    const entries = [
      { id: "lec1", updatedAt: "2024-01-01T00:00:00Z", savedAt: "2024-01-01T00:00:00Z" },
      { id: "lec2", updatedAt: "2024-02-01T00:00:00Z", savedAt: "2024-02-01T00:00:00Z" },
    ];
    const result = localSavedItems(entries);
    expect(result[0]!.listingSlug).toBe("lec2");
    expect(result[1]!.listingSlug).toBe("lec1");
  });

  it("maps to MyLibraryItemDto shape", () => {
    const [item] = localSavedItems([
      { id: "lec1", updatedAt: "2024-01-15T12:00:00Z", savedAt: "2024-01-15T12:00:00Z" },
    ]);
    expect(item).toMatchObject({
      id: "lec1",
      listingId: "lec1",
      savedAt: "2024-01-15T12:00:00Z",
      scholarId: "",
      scholarSlug: "",
      scholarName: "",
    });
  });

  it("excludes a tombstoned entry with no savedAt (defensive — callers should already filter via getActive)", () => {
    const result = localSavedItems([{ id: "lec1", updatedAt: "2024-01-01T00:00:00Z" }]);
    expect(result).toEqual([]);
  });
});

describe("localCompletedItems", () => {
  it("returns empty array for empty progress map", () => {
    expect(localCompletedItems({})).toEqual([]);
  });

  it("includes only entries with completedAt set", () => {
    const map = {
      lec1: makeProgress("lec1", 600, 600, { completedAt: "2024-01-01T00:00:00Z" }),
      lec2: makeProgress("lec2", 100, 600),
    };
    const result = localCompletedItems(map);
    expect(result).toHaveLength(1);
    expect(result[0]!.listingId).toBe("lec1");
  });

  it("sorts by completedAt descending (newest first)", () => {
    const map = {
      lec1: makeProgress("lec1", 600, 600, { completedAt: "2024-01-01T00:00:00Z" }),
      lec2: makeProgress("lec2", 600, 600, { completedAt: "2024-02-01T00:00:00Z" }),
    };
    const result = localCompletedItems(map);
    expect(result[0]!.listingId).toBe("lec2");
    expect(result[1]!.listingId).toBe("lec1");
  });

  it("maps to MyLibraryItemDto shape", () => {
    const entry = makeProgress("lec1", 600, 600, { completedAt: "2024-01-01T00:00:00Z" });
    const [item] = localCompletedItems({ lec1: entry });
    expect(item).toMatchObject({
      id: "lec1",
      listingId: "lec1",
      completedAt: "2024-01-01T00:00:00Z",
      progressSeconds: 600,
      durationSeconds: 600,
      scholarId: "",
      scholarName: "",
    });
  });
});
