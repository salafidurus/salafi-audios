import type { SearchCatalogItemDto, SearchCatalogResultsDto } from "@sd/core-contracts";

export type SearchResultRow = SearchCatalogItemDto & { group: string };

export function buildSearchResultItems(
  data: SearchCatalogResultsDto | undefined,
): SearchResultRow[] {
  if (!data) {
    return [];
  }

  const collections = data.collections.map((item: SearchCatalogItemDto) => ({
    ...item,
    group: "Collection",
  }));
  const series = data.series.map((item: SearchCatalogItemDto) => ({ ...item, group: "Series" }));
  const lectures = data.lectures.map((item: SearchCatalogItemDto) => ({
    ...item,
    group: "Lecture",
  }));

  return [...collections, ...series, ...lectures];
}
