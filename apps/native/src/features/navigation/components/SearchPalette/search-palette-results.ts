/** Builds the bounded public-catalog result model consumed by the search palette. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- module responsibility is documented above.
import type {
  SearchCatalogItemDto,
  SearchCatalogResultsDto,
  ScholarListItemDto,
  TopicDetailDto,
} from "@sd/core-contracts";

import { getLocalizedName } from "@sd/core-i18n";

/**
 * Describes a navigable search-palette result; result groups retain topic, scholar, then listing
 * ordering, and the builder caps the final collection at eight entries.
 */
// oxlint-disable-next-line anti-slop/require-tsdoc -- the contract is documented in the summary above.
export type PaletteResult = {
  id: string;
  label: string;
  type: "topic" | "scholar" | "listing";
  /** Canonical slug used by the result's destination route. */
  slug: string;
  metadata?: string;
};

type ScholarPage = {
  items: ScholarListItemDto[];
  nextCursor?: string;
  hasMore?: boolean;
};

function matches(value: string, query: string) {
  return value.toLocaleLowerCase().includes(query.toLocaleLowerCase());
}

/** Builds the bounded, query-matched result list shown by the palette. */
// oxlint-disable-next-line complexity -- the bounded result groups are combined at one public seam.
export function buildPaletteResults(
  query: string,
  topics: TopicDetailDto[] | undefined,
  scholarPages: { pages: ScholarPage[]; pageParams?: unknown[] } | undefined,
  listingData: SearchCatalogResultsDto | undefined,
  language: string,
): PaletteResult[] {
  if (!query) return [];

  const topicResults = (topics ?? []).flatMap((topic) => {
    const label = getLocalizedName(topic.name, language);
    return matches(label, query)
      ? [{ id: `topic-${topic.id}`, label, type: "topic" as const, slug: topic.slug }]
      : [];
  });
  const scholarResults = (scholarPages?.pages.flatMap((page) => page.items) ?? []).flatMap(
    (scholar) =>
      matches(scholar.name, query)
        ? [
            {
              id: `scholar-${scholar.id}`,
              label: scholar.name,
              type: "scholar" as const,
              slug: scholar.slug,
            },
          ]
        : [],
  );
  const listings: SearchCatalogItemDto[] = [
    ...(listingData?.collections ?? []),
    ...(listingData?.series ?? []),
    ...(listingData?.singles ?? []),
  ];
  const listingResults = listings.map((listing) => ({
    id: `listing-${listing.id}`,
    label: listing.title,
    type: "listing" as const,
    slug: listing.slug,
    metadata: listing.scholarName,
  }));

  return [...topicResults, ...scholarResults, ...listingResults].slice(0, 8);
}
