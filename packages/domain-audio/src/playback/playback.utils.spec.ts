import { describe, expect, test } from "bun:test";

import { getProgressPercent, isTrackActiveForListing } from "./playback.utils";

describe("playback utilities", () => {
  test("matches the current track using the listing format identity", () => {
    expect(
      isTrackActiveForListing(
        { id: "series-1", slug: "series-slug", format: "series" },
        { slug: "lesson-1", seriesId: "series-1" },
      ),
    ).toBe(true);
    expect(
      isTrackActiveForListing(
        { id: "series-1", slug: "series-slug", format: "series" },
        { slug: "series-slug", seriesId: "other-series" },
      ),
    ).toBe(false);
  });

  test("clamps progress percentage and handles missing duration", () => {
    expect(getProgressPercent(50, 100)).toBe(50);
    expect(getProgressPercent(-1, 100)).toBe(0);
    expect(getProgressPercent(150, 100)).toBe(100);
    expect(getProgressPercent(50, 0)).toBe(0);
  });
});
