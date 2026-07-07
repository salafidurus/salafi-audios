import { useInfiniteQuery } from "@tanstack/react-query";
import {
  endpoints,
  httpClient,
  queryKeys,
  useApiQuery,
  type FeedPageDto,
} from "@sd/core-contracts";

export function useExploreRecent() {
  return useInfiniteQuery<FeedPageDto>({
    queryKey: [...queryKeys.explore.all, "recent"],
    queryFn: async ({ pageParam }) => {
      const params: Record<string, string> = {};
      if (pageParam) params.cursor = pageParam as string;
      return httpClient<FeedPageDto>({
        url: endpoints.explore.recent,
        method: "GET",
        params,
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

export function useExploreFollowing() {
  return useInfiniteQuery<FeedPageDto>({
    queryKey: [...queryKeys.explore.all, "following"],
    queryFn: async ({ pageParam }) => {
      const params: Record<string, string> = {};
      if (pageParam) params.cursor = pageParam as string;
      return httpClient<FeedPageDto>({
        url: endpoints.explore.following,
        method: "GET",
        params,
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

export function useExploreList() {
  return useApiQuery(queryKeys.explore.list(), () =>
    httpClient<FeedPageDto>({
      url: endpoints.explore.list,
      method: "GET",
    }),
  );
}
