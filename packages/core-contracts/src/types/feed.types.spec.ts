import { describe, expect, it } from "bun:test";

import {
  ExploreListingsBatchDtoSchema,
  ExploreScholarsBatchDtoSchema,
  FeedPageDtoSchema,
} from "./feed.types";

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

const scholar = {
  id: "scholar-1",
  slug: "scholar-1",
  name: "A scholar",
  imageUrl: "https://cdn.example.com/scholar.jpg",
  mainLanguage: "ar" as const,
  title: "allamah" as const,
  lectureCount: 12,
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

  it("accepts a typed senior scholars batch with display-ready contents", () => {
    const result = ExploreScholarsBatchDtoSchema.parse({
      kind: "scholars",
      id: "scholars:senior",
      title: { kind: "scholars", id: "senior_scholars", label: "Senior Scholars" },
      reason: "deterministic_senior_scholars",
      items: [scholar],
    });

    expect(result.items[0]?.slug).toBe("scholar-1");
  });

  it("preserves listings then scholar batch order in a page", () => {
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
        {
          kind: "scholars",
          id: "scholars:senior",
          title: { kind: "scholars", id: "senior_scholars", label: "Senior Scholars" },
          reason: "deterministic_senior_scholars",
          items: [scholar],
        },
      ],
      exhausted: true,
    });

    expect(result.batches.map((batch) => batch.kind)).toEqual(["listings", "scholars"]);
  });

  it("rejects unsupported scholar title contexts", () => {
    expect(() =>
      ExploreScholarsBatchDtoSchema.parse({
        kind: "scholars",
        id: "scholars:senior",
        title: { kind: "scholars", id: "popular", label: "Popular Scholars" },
        reason: "deterministic_senior_scholars",
        items: [scholar],
      }),
    ).toThrow();
  });
});
