import type { SearchCatalogItemDto, SearchCatalogResultsDto } from "@sd/core-contracts";

export type SearchResultRow = {
  id: string;
  title: string;
  scholarName: string;
  imageUrl?: string;
  lectureCount: number;
  durationSeconds?: number;
};

export function buildSearchResultRows(
  data: SearchCatalogResultsDto | undefined,
): SearchResultRow[] {
  if (!data) {
    return [];
  }

  const collections = data.collections.map((item: SearchCatalogItemDto) => ({
    id: `collection:${item.id}`,
    title: item.title,
    scholarName: item.scholarName,
    imageUrl: item.coverImageUrl ?? item.scholarImageUrl,
    lectureCount: item.lectureCount,
    durationSeconds: item.durationSeconds,
  }));

  const series = data.series.map((item: SearchCatalogItemDto) => ({
    id: `series:${item.id}`,
    title: item.title,
    scholarName: item.scholarName,
    imageUrl: item.coverImageUrl ?? item.scholarImageUrl,
    lectureCount: item.lectureCount,
    durationSeconds: item.durationSeconds,
  }));

  const lectures = data.lectures.map((item: SearchCatalogItemDto) => ({
    id: `lecture:${item.id}`,
    title: item.title,
    scholarName: item.scholarName,
    imageUrl: item.coverImageUrl ?? item.scholarImageUrl,
    lectureCount: item.lectureCount,
    durationSeconds: item.durationSeconds,
  }));

  return [...collections, ...series, ...lectures];
}
