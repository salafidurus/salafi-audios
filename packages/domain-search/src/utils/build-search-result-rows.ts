import type { SearchCatalogItemDto, SearchCatalogResultsDto } from "@sd/core-contracts";
import { pickContentField } from "@sd/core-i18n";

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
  showOriginal = false,
): SearchResultRow[] {
  if (!data) {
    return [];
  }

  const toRow =
    (prefix: string) =>
    (item: SearchCatalogItemDto): SearchResultRow => ({
      id: `${prefix}:${item.id}`,
      title: pickContentField(item.title, item.original?.title, showOriginal),
      scholarName: item.scholarName,
      imageUrl: item.coverImageUrl ?? item.scholarImageUrl,
      lectureCount: item.lectureCount,
      durationSeconds: item.durationSeconds,
    });

  return [
    ...data.collections.map(toRow("collection")),
    ...data.series.map(toRow("series")),
    ...data.singles.map(toRow("single")),
  ];
}
