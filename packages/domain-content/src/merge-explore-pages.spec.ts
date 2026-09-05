import type { FeedPageDto } from "@sd/core-contracts";

import { describe, expect, it } from "bun:test";

import { mergeExplorePages } from "./merge-explore-pages";

const page = (batches: FeedPageDto["batches"]): FeedPageDto => ({
  schemaVersion: 1,
  batches,
  exhausted: true,
});

describe("mergeExplorePages", () => {
  it("merges repeated batches and removes repeated item identities", () => {
    const result = mergeExplorePages([
      page([
        {
          kind: "listings",
          id: "listings:recent",
          title: { kind: "listings", id: "recent", label: "Recent" },
          reason: "deterministic_recent",
          items: [
            {
              kind: "single",
              id: "one",
              title: "One",
              slug: "one",
              scholarName: "S",
              scholarSlug: "s",
              scholarImageUrl: null,
              thumbnailUrl: null,
              durationSeconds: 1,
              publishedAt: "2026-01-01T00:00:00Z",
            },
          ],
        },
      ]),
      page([
        {
          kind: "listings",
          id: "listings:recent",
          title: { kind: "listings", id: "recent", label: "Recent" },
          reason: "deterministic_recent",
          items: [
            {
              kind: "single",
              id: "one",
              title: "One",
              slug: "one",
              scholarName: "S",
              scholarSlug: "s",
              scholarImageUrl: null,
              thumbnailUrl: null,
              durationSeconds: 1,
              publishedAt: "2026-01-01T00:00:00Z",
            },
            {
              kind: "single",
              id: "two",
              title: "Two",
              slug: "two",
              scholarName: "S",
              scholarSlug: "s",
              scholarImageUrl: null,
              thumbnailUrl: null,
              durationSeconds: 2,
              publishedAt: "2026-01-02T00:00:00Z",
            },
          ],
        },
      ]),
    ]);

    expect(result).toHaveLength(1);
    expect(result[0]?.items.map((item) => item.id)).toEqual(["one", "two"]);
  });
});
