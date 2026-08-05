import { httpClient, endpoints, queryKeys, type FeedPageDto } from "@sd/core-contracts";
import { useInfiniteQuery } from "@tanstack/react-query";

export type UseExploreRecentScreenOptions = {
  limit?: number;
};

export function useExploreRecentScreen({ limit }: UseExploreRecentScreenOptions = {}) {
  return useInfiniteQuery<FeedPageDto>({
    queryKey: limit ? [...queryKeys.listings.recent(), { limit }] : queryKeys.listings.recent(),
    queryFn: async ({ pageParam }) => {
      const params: Record<string, string> = {};
      if (pageParam) params.cursor = pageParam as string;
      if (limit) params.limit = String(limit);
      return httpClient<FeedPageDto>({
        url: endpoints.listings.recent,
        method: "GET",
        params,
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}
