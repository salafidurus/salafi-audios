import type { SearchCatalogItemDto, SearchCatalogResultsDto } from "@sd/core-contracts";
import { pickContentField } from "@sd/core-i18n";

export type SearchResultRow = {
  id: string;
  slug: string;
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

  const toRow = (item: SearchCatalogItemDto): SearchResultRow => ({
    id: item.id,
    slug: item.slug,
    title: pickContentField(item.title, item.original?.title, showOriginal),
    scholarName: item.scholarName,
    imageUrl: item.coverImageUrl ?? item.scholarImageUrl,
    lectureCount: item.lectureCount,
    durationSeconds: item.durationSeconds,
  });

  return [...data.collections.map(toRow), ...data.series.map(toRow), ...data.singles.map(toRow)];
}
