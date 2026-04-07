import {
  endpoints,
  httpClient,
  queryKeys,
  useApiQuery,
  type FeedPageDto,
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
