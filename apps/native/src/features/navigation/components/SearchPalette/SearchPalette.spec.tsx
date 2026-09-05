import type { SearchCatalogResultsDto, ScholarListDto, TopicDetailDto } from "@sd/core-contracts";

import { buildPaletteResults } from "./search-palette-results";

describe("buildPaletteResults", () => {
  it("combines matching topics, scholars, and listings in one palette result set", () => {
    const topics = [
      { id: "topic-1", slug: "aqeedah", name: { ar: "العقيدة", en: "Aqeedah" } },
    ] as TopicDetailDto[];
    const scholars = [
      { id: "scholar-1", slug: "scholar-one", name: "Scholar One", lectureCount: 1 },
    ] as ScholarListDto["scholars"];
    const listings = {
      collections: [],
      series: [],
      singles: [
        {
          id: "listing-1",
          slug: "listing-one",
          title: "Listing One",
          scholarName: "Scholar One",
          scholarSlug: "scholar-one",
          lectureCount: 1,
        },
      ],
    } as SearchCatalogResultsDto;

    const results = buildPaletteResults("one", topics, scholars, listings, "en");

    expect(results.map((result) => result.type)).toEqual(["scholar", "listing"]);
    expect(results.map((result) => result.slug)).toEqual(["scholar-one", "listing-one"]);
  });
});
