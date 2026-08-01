import {
  endpoints,
  httpClient,
  queryKeys,
  useApiQuery,
  type ListingDetailDto,
  type ListingContentsDto,
  type LastPlayedLessonDto,
} from "@sd/core-contracts";

export function useListingDetail(id: string) {
  return useApiQuery(
    queryKeys.listings.detail(id, id),
    () =>
      httpClient<ListingDetailDto>({
        url: endpoints.listings.detail(id),
        method: "GET",
      }),
    { enabled: !!id },
  );
}

export function useListingContents(id: string) {
  return useApiQuery(
    queryKeys.listings.contents(id),
    () =>
      httpClient<ListingContentsDto>({
        url: endpoints.listings.contents(id),
        method: "GET",
      }),
    { enabled: !!id },
  );
}

export function useLastPlayedLesson(id: string, enabled = true) {
  return useApiQuery(
    queryKeys.listings.lastPlayed(id),
    () =>
      httpClient<LastPlayedLessonDto | null>({
        url: endpoints.listings.lastPlayed(id),
        method: "GET",
      }),
    { enabled: !!id && enabled },
  );
}
