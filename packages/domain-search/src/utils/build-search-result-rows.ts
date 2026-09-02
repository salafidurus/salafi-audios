import type {
  ListingFormat,
  SearchCatalogItemDto,
  SearchCatalogResultsDto,
} from "@sd/core-contracts";

import { pickContentField } from "@sd/core-i18n";

/** Converts API search groups into the flat rows consumed by discovery views. */
/** A display-ready row representing one public Listing search result. */
export type SearchResultRow = {
  id: string;
  /** Public Listing identity used for navigation and cache keys. */
  slug: string;
  title: string;
  format: ListingFormat;
  scholarName: string;
  /** Public scholar identity used for stable matching across locales. */
  scholarSlug: string;
  imageUrl?: string;
  lectureCount: number;
  /** Total playable duration when the API provides it. */
  durationSeconds?: number;
};

/** Flattens collection, series, and single result groups without changing identity. */
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
