import { describe, expect, it } from "bun:test";

import { HomePromotionsDtoSchema } from "./home.types";

describe("HomePromotionsDtoSchema", () => {
  it("parses the public hero and editors' picks response", () => {
    const result = HomePromotionsDtoSchema.safeParse({
      hero: {
        id: "hero-1",
        listingId: "listing-1",
        headline: "Featured study",
        listing: {
          kind: "single",
          id: "listing-1",
          title: "The Meaning of Worship",
          slug: "meaning-of-worship",
          scholarName: "Shaikh Salih al-Fawzan",
          scholarSlug: "salih-al-fawzan",
          scholarImageUrl: null,
          thumbnailUrl: null,
          durationSeconds: 1800,
          publishedAt: "2026-08-26T00:00:00.000Z",
        },
      },
      editorsPicks: [
        {
          id: "pick-1",
          listingId: "listing-2",
          listing: {
            kind: "series",
            id: "listing-2",
            title: "Foundations of Tawheed",
            slug: "foundations-of-tawheed",
            scholarName: "Shaikh Salih al-Fawzan",
            scholarSlug: "salih-al-fawzan",
            scholarImageUrl: null,
            thumbnailUrl: "https://cdn.example/cover.jpg",
            durationSeconds: 7200,
            publishedLectureCount: 12,
            publishedAt: "2026-08-25T00:00:00.000Z",
          },
        },
      ],
    });

    expect(result.success).toBe(true);
  });

  it("allows Home to have no active hero", () => {
    expect(HomePromotionsDtoSchema.parse({ hero: null, editorsPicks: [] })).toEqual({
      hero: null,
      editorsPicks: [],
    });
  });
});
