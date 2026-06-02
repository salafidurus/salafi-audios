import { buildSearchResultRows } from "./build-search-result-rows";
import type { SearchCatalogItemDto, SearchCatalogResultsDto } from "@sd/core-contracts";

const makeItem = (overrides: Partial<SearchCatalogItemDto> = {}): SearchCatalogItemDto => ({
  id: "1",
  slug: "slug",
  title: "Title",
  scholarName: "Scholar",
  scholarSlug: "scholar-slug",
  lectureCount: 5,
  ...overrides,
});

describe("buildSearchResultRows", () => {
  it("returns empty array for undefined input", () => {
    expect(buildSearchResultRows(undefined)).toEqual([]);
  });
  it("returns empty array when all categories are empty", () => {
    expect(buildSearchResultRows({ collections: [], series: [], lectures: [] })).toEqual([]);
  });
  it("prefixes collection IDs", () => {
    const data: SearchCatalogResultsDto = { collections: [makeItem({ id: "c1" })], series: [], lectures: [] };
    expect(buildSearchResultRows(data)[0].id).toBe("collection:c1");
  });
  it("prefixes series IDs", () => {
    const data: SearchCatalogResultsDto = { collections: [], series: [makeItem({ id: "s1" })], lectures: [] };
    expect(buildSearchResultRows(data)[0].id).toBe("series:s1");
  });
  it("prefixes lecture IDs", () => {
    const data: SearchCatalogResultsDto = { collections: [], series: [], lectures: [makeItem({ id: "l1" })] };
    expect(buildSearchResultRows(data)[0].id).toBe("lecture:l1");
  });
  it("orders collections then series then lectures", () => {
    const data: SearchCatalogResultsDto = {
      collections: [makeItem({ id: "c1" })],
      series: [makeItem({ id: "s1" })],
      lectures: [makeItem({ id: "l1" })],
    };
    expect(buildSearchResultRows(data).map((r) => r.id)).toEqual(["collection:c1", "series:s1", "lecture:l1"]);
  });
  it("uses coverImageUrl when available", () => {
    const data: SearchCatalogResultsDto = {
      collections: [makeItem({ coverImageUrl: "cover.jpg", scholarImageUrl: "scholar.jpg" })],
      series: [], lectures: [],
    };
    expect(buildSearchResultRows(data)[0].imageUrl).toBe("cover.jpg");
  });
  it("falls back to scholarImageUrl when coverImageUrl is absent", () => {
    const data: SearchCatalogResultsDto = {
      collections: [makeItem({ coverImageUrl: undefined, scholarImageUrl: "scholar.jpg" })],
      series: [], lectures: [],
    };
    expect(buildSearchResultRows(data)[0].imageUrl).toBe("scholar.jpg");
  });
});