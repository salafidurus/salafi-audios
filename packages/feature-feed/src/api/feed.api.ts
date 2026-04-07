import {
  endpoints,
  httpClient,
  queryKeys,
  useApiQuery,
  type FeedPageDto,
  type ScholarChipDto,
} from "@sd/core-contracts";

export function useFeedRecent(cursor?: string) {
  return useApiQuery(queryKeys.feed.recent(cursor), () =>
    httpClient<FeedPageDto>({
      url: endpoints.feed.recent,
      method: "GET",
      params: cursor ? { cursor } : undefined,
    }),
  );
}

export function useFeedFollowing(cursor?: string) {
  return useApiQuery(queryKeys.feed.following(cursor), () =>
    httpClient<FeedPageDto>({
      url: endpoints.feed.following,
      method: "GET",
      params: cursor ? { cursor } : undefined,
    }),
  );
}

export function useFeedList() {
  return useApiQuery(queryKeys.feed.list(), () =>
    httpClient<FeedPageDto>({
      url: endpoints.feed.list,
      method: "GET",
    }),
  );
}

export function useFeedScholars() {
  return useApiQuery<{ scholars: ScholarChipDto[] }>(queryKeys.feed.scholars(), () =>
    httpClient<{ scholars: ScholarChipDto[] }>({
      url: endpoints.feed.scholars,
      method: "GET",
    }),
  );
}
