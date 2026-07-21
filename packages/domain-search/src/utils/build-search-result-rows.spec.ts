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
    expect(buildSearchResultRows({ collections: [], series: [], singles: [] })).toEqual([]);
  });
  it("maps collection id and slug", () => {
    const data: SearchCatalogResultsDto = {
      collections: [makeItem({ id: "c1", slug: "slug-c1" })],
      series: [],
      singles: [],
    };
    const rows = buildSearchResultRows(data);
    expect(rows[0]!.id).toBe("c1");
    expect(rows[0]!.slug).toBe("slug-c1");
  });
  it("maps series id and slug", () => {
    const data: SearchCatalogResultsDto = {
      collections: [],
      series: [makeItem({ id: "s1", slug: "slug-s1" })],
      singles: [],
    };
    const rows = buildSearchResultRows(data);
    expect(rows[0]!.id).toBe("s1");
    expect(rows[0]!.slug).toBe("slug-s1");
  });
  it("maps single id and slug", () => {
    const data: SearchCatalogResultsDto = {
      collections: [],
      series: [],
      singles: [makeItem({ id: "l1", slug: "slug-l1" })],
    };
    const rows = buildSearchResultRows(data);
    expect(rows[0]!.id).toBe("l1");
    expect(rows[0]!.slug).toBe("slug-l1");
  });
  it("orders collections then series then singles", () => {
    const data: SearchCatalogResultsDto = {
      collections: [makeItem({ id: "c1" })],
      series: [makeItem({ id: "s1" })],
      singles: [makeItem({ id: "l1" })],
    };
    expect(buildSearchResultRows(data).map((r) => r.id)).toEqual(["c1", "s1", "l1"]);
  });
  it("uses coverImageUrl when available", () => {
    const data: SearchCatalogResultsDto = {
      collections: [makeItem({ coverImageUrl: "cover.jpg", scholarImageUrl: "scholar.jpg" })],
      series: [],
      singles: [],
    };
    expect(buildSearchResultRows(data)[0]!.imageUrl).toBe("cover.jpg");
  });
  it("falls back to scholarImageUrl when coverImageUrl is absent", () => {
    const data: SearchCatalogResultsDto = {
      collections: [makeItem({ coverImageUrl: undefined, scholarImageUrl: "scholar.jpg" })],
      series: [],
      singles: [],
    };
    expect(buildSearchResultRows(data)[0]!.imageUrl).toBe("scholar.jpg");
  });
});
