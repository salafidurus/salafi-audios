import { describe, expect, it } from "bun:test";

import { ExploreListingsBatchDtoSchema, FeedPageDtoSchema } from "./feed.types";

const listing = {
  kind: "single" as const,
  id: "listing-1",
  title: "A lesson",
  slug: "a-lesson",
  scholarName: "A scholar",
  scholarSlug: "a-scholar",
  scholarImageUrl: null,
  thumbnailUrl: null,
  durationSeconds: 120,
  publishedAt: "2026-09-05T00:00:00.000Z",
};

describe("Explore recommendation contract", () => {
  it("accepts a versioned ordered listings batch", () => {
    const result = FeedPageDtoSchema.parse({
      schemaVersion: 1,
      batches: [
        {
          kind: "listings",
          id: "listings:recent",
          title: { kind: "listings", id: "recent", label: "Continue exploring" },
          reason: "deterministic_recent",
          items: [listing],
        },
      ],
      exhausted: true,
    });

    expect(result.batches[0]?.items[0]?.slug).toBe("a-lesson");
  });

  it("accepts topic context and rejects unsupported title combinations", () => {
    expect(
      ExploreListingsBatchDtoSchema.parse({
        kind: "listings",
        id: "listings:topic:aqeedah",
        title: { kind: "topic_listings", topicSlug: "aqeedah", label: "Aqeedah" },
        reason: "deterministic_recent",
        items: [listing],
      }),
    ).toBeTruthy();

    expect(() =>
      ExploreListingsBatchDtoSchema.parse({
        kind: "listings",
        id: "bad",
        title: { kind: "listings", id: "recent" },
        reason: "deterministic_recent",
        items: [],
      }),
    ).toThrow();
  });
});
