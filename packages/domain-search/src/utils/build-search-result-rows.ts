import type {
  ListingFormat,
  SearchCatalogItemDto,
  SearchCatalogResultsDto,
} from "@sd/core-contracts";

import { pickContentField } from "@sd/core-i18n";

export type SearchResultRow = {
  id: string;
  slug: string;
  title: string;
  format: ListingFormat;
  scholarName: string;
  scholarSlug: string;
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
    (format: ListingFormat) =>
    (item: SearchCatalogItemDto): SearchResultRow => ({
      id: item.id,
      slug: item.slug,
      title: pickContentField(item.title, item.original?.title, showOriginal),
      format,
      scholarName: item.scholarName,
      scholarSlug: item.scholarSlug,
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
