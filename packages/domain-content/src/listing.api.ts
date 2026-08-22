import {
  endpoints,
  httpClient,
  queryKeys,
  useApiQuery,
  type ListingDetailDto,
  type ListingContentsDto,
  type LastPlayedLessonDto,
} from "@sd/core-contracts";

/**
 * Catalog reads resolve Listings through their public slug — the only external
 * identity a Listing route accepts. An ID-shaped value resolves as not found.
 */
export function useListingDetail(slug: string) {
  return useApiQuery(
    queryKeys.listings.detail(slug),
    () =>
      httpClient<ListingDetailDto>({
        url: endpoints.listings.detail(slug),
        method: "GET",
      }),
    { enabled: !!slug },
  );
}

export function useListingContents(slug: string) {
  return useApiQuery(
    queryKeys.listings.contents(slug),
    () =>
      httpClient<ListingContentsDto>({
        url: endpoints.listings.contents(slug),
        method: "GET",
      }),
    { enabled: !!slug },
  );
}

export function useLastPlayedLesson(slug: string, enabled = true) {
  return useApiQuery(
    queryKeys.listings.lastPlayed(slug),
    () =>
      httpClient<LastPlayedLessonDto | null>({
        url: endpoints.listings.lastPlayed(slug),
        method: "GET",
      }),
    { enabled: !!slug && enabled },
  );
}
