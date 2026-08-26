import type { LibraryItemDto } from "@sd/core-contracts";
import type { ListingProgress, Track } from "@sd/domain-audio";

import { describe, it, expect } from "bun:test";

import { mergeLiveProgress } from "./merge-live-progress";

const baseItem: LibraryItemDto = {
  id: "l1",
  listingId: "l1",
  listingTitle: "Lecture One",
  listingSlug: "lecture-one",
  scholarId: "s1",
  scholarSlug: "scholar-1",
  scholarName: "Scholar One",
  durationSeconds: 1000,
  progressSeconds: 100,
};

function liveProgress(overrides: Partial<ListingProgress> = {}): ListingProgress {
  return {
    listingSlug: "l1",
    positionSeconds: 500,
    durationSeconds: 1000,
    updatedAt: "2026-01-01T00:00:05.000Z",
    ...overrides,
  };
}

const standaloneTrack: Track = {
  id: "l2",
  slug: "lecture-two",
  title: "Lecture Two",
  artist: "Scholar Two",
  scholarSlug: "scholar-2",
  url: "",
  durationSeconds: 800,
  seriesId: null,
  seriesTitle: null,
};

describe("mergeLiveProgress", () => {
  it("overrides progressSeconds with the live store value for a listed item", () => {
    const result = mergeLiveProgress([baseItem], {
      "lecture-one": liveProgress({ listingSlug: "lecture-one" }),
    });

    expect(result[0]?.progressSeconds).toBe(500);
  });

  it("marks a listed item completed once the live store says so", () => {
    const result = mergeLiveProgress([baseItem], {
      "lecture-one": liveProgress({
        listingSlug: "lecture-one",
        completedAt: "2026-01-01T00:01:00.000Z",
      }),
    });

    expect(result[0]?.completedAt).toBe("2026-01-01T00:01:00.000Z");
  });

  it("leaves an item untouched when there is no live entry for it", () => {
    const result = mergeLiveProgress([baseItem], {});

    expect(result[0]).toEqual(baseItem);
  });

  it("adds a synthetic row for a just-started standalone lecture not yet in the list", () => {
    const result = mergeLiveProgress(
      [baseItem],
      { "lecture-two": liveProgress({ listingSlug: "lecture-two" }) },
      standaloneTrack,
    );

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ listingSlug: "lecture-two", listingTitle: "Lecture Two" });
  });

  it("does not duplicate a standalone lecture already present in the server list", () => {
    const result = mergeLiveProgress(
      [baseItem],
      { "lecture-one": liveProgress({ listingSlug: "lecture-one" }) },
      {
        ...standaloneTrack,
        id: "l1",
        slug: "lecture-one",
      },
    );

    expect(result).toHaveLength(1);
  });

  it("does not synthesize a row for a lesson nested in a series", () => {
    const nestedTrack: Track = { ...standaloneTrack, id: "lesson-1", seriesId: "series-1" };
    const result = mergeLiveProgress(
      [baseItem],
      { "lesson-1": liveProgress({ listingSlug: "lesson-1" }) },
      nestedTrack,
    );

    expect(result).toHaveLength(1);
  });

  it("does not synthesize a row once the currently-playing track is completed", () => {
    const result = mergeLiveProgress(
      [baseItem],
      {
        "lecture-two": liveProgress({
          listingSlug: "lecture-two",
          completedAt: "2026-01-01T00:01:00.000Z",
        }),
      },
      standaloneTrack,
    );

    expect(result).toHaveLength(1);
  });
});
