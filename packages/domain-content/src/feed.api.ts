import { useInfiniteQuery } from "@tanstack/react-query";
import {
  endpoints,
  httpClient,
  queryKeys,
  useApiQuery,
  type FeedPageDto,
} from "@sd/core-contracts";

export function useFeedRecent() {
  return useInfiniteQuery<FeedPageDto>({
    queryKey: [...queryKeys.feed.all, "recent"],
    queryFn: async ({ pageParam }) => {
      const params: Record<string, string> = {};
      if (pageParam) params.cursor = pageParam as string;
      return httpClient<FeedPageDto>({
        url: endpoints.feed.recent,
        method: "GET",
        params,
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

export function useFeedFollowing() {
  return useInfiniteQuery<FeedPageDto>({
    queryKey: [...queryKeys.feed.all, "following"],
    queryFn: async ({ pageParam }) => {
      const params: Record<string, string> = {};
      if (pageParam) params.cursor = pageParam as string;
      return httpClient<FeedPageDto>({
        url: endpoints.feed.following,
        method: "GET",
        params,
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

export function useFeedList() {
  return useApiQuery(queryKeys.feed.list(), () =>
    httpClient<FeedPageDto>({
      url: endpoints.feed.list,
      method: "GET",
    }),
  );
}
