import { describe, expect, it } from "bun:test";

import { parseScholarPageFeedDto, ScholarPageFeedDtoSchema } from "./scholar-page-feed.types";

const scholar = {
  id: "scholar-1",
  slug: "ibn-baz",
  name: "Ibn Baz",
  title: "allamah" as const,
  lectureCount: 12,
};

const listing = {
  id: "listing-1",
  slug: "patience",
  title: "Patience",
  type: "single" as const,
  recencyAt: "2026-09-01T00:00:00.000Z",
  lectureCount: 1,
};

describe("Scholar page feed contract", () => {
  it("accepts a versioned ordered Allamah scholars batch", () => {
    const result = ScholarPageFeedDtoSchema.parse({
      schemaVersion: 1,
      batches: [
        {
          form: "scholars",
          id: "scholars:allamah",
          title: { kind: "allamah", id: "allamah_scholars", label: "Allamah scholars" },
          items: [scholar],
        },
      ],
      exhausted: true,
    });

    expect(result.batches[0]?.items).toEqual([scholar]);
  });

  it("keeps supported batches while ignoring unknown future forms", () => {
    const result = parseScholarPageFeedDto({
      schemaVersion: 1,
      batches: [
        {
          form: "future_form",
          id: "future:1",
          title: { kind: "future", id: "future", label: "Future" },
          items: [],
        },
        {
          form: "scholar_listings",
          id: "scholar-listings:ibn-baz",
          scholarSlug: "ibn-baz",
          title: { kind: "scholar_listings", id: "scholar_listings", label: "Ibn Baz listings" },
          scholar,
          items: [listing],
        },
        {
          form: "scholars",
          id: "scholars:allamah",
          title: { kind: "allamah", id: "allamah_scholars", label: "Allamah scholars" },
          items: [scholar],
        },
      ],
      exhausted: true,
    });

    expect(result.batches).toHaveLength(2);
    expect(result.batches[0]?.form).toBe("scholar_listings");
    expect(result.batches[1]?.form).toBe("scholars");
  });

  it("requires a public scholar slug and complete listing contents", () => {
    expect(() =>
      ScholarPageFeedDtoSchema.parse({
        schemaVersion: 1,
        batches: [
          {
            form: "scholar_listings",
            id: "scholar-listings:ibn-baz",
            scholarSlug: "",
            title: { kind: "scholar_listings", id: "scholar_listings", label: "Listings" },
            scholar,
            items: [listing],
          },
        ],
        exhausted: true,
      }),
    ).toThrow();
  });

  it("rejects a scholars batch with a non-Allamah title context", () => {
    expect(() =>
      ScholarPageFeedDtoSchema.parse({
        schemaVersion: 1,
        batches: [
          {
            form: "scholars",
            id: "scholars:allamah",
            title: { kind: "senior", id: "senior_scholars", label: "Senior scholars" },
            items: [scholar],
          },
        ],
        exhausted: true,
      }),
    ).toThrow();
  });
});
