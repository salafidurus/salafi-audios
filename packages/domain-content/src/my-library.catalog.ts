import {
  endpoints,
  httpClient,
  queryKeys,
  type ListingDetailDto,
  type MyLibraryItemDto,
} from "@sd/core-contracts";
import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";

/** Enriches locally stored Library relationships with public catalog presentation data. */
const LOCAL_TITLE_FALLBACK = "Untitled listing";

/** Adds public catalog metadata to rows that originated in local personal-state stores. */
export function useEnrichedLocalLibraryItems(items: MyLibraryItemDto[], enabled: boolean) {
  const slugs = useMemo(
    () => [...new Set(items.flatMap((item) => (item.listingSlug ? [item.listingSlug] : [])))],
    [items],
  );
  const details = useQueries({
    queries: slugs.map((slug) => ({
      queryKey: queryKeys.listings.detail(slug),
      queryFn: () =>
        httpClient<ListingDetailDto>({
          url: endpoints.listings.detail(slug),
          method: "GET",
        }),
      enabled,
      staleTime: 30_000,
    })),
  });

  return useMemo(() => {
    const detailBySlug = new Map(slugs.map((slug, index) => [slug, details[index]?.data] as const));
    return items.map((item) => {
      const detail = detailBySlug.get(item.listingSlug);
      if (!detail) {
        return {
          ...item,
          listingTitle:
            item.listingTitle === item.listingSlug ? LOCAL_TITLE_FALLBACK : item.listingTitle,
        };
      }
      return {
        ...item,
        listingId: detail.id,
        listingTitle: detail.title,
        originalListingTitle: detail.original?.title,
        scholarId: detail.scholar.id,
        scholarSlug: detail.scholar.slug,
        scholarName: detail.scholar.name,
        scholarTitle: detail.scholar.title,
        coverImageUrl: detail.coverImageUrl,
        scholarImageUrl: detail.scholar.imageUrl,
        seriesTitle: detail.seriesContext?.seriesTitle,
      };
    });
  }, [details, items, slugs]);
}
