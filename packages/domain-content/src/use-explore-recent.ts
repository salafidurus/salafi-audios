import { useInfiniteQuery } from "@tanstack/react-query";
import { httpClient, endpoints, queryKeys, type FeedPageDto } from "@sd/core-contracts";

export function useExploreRecentScreen() {
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
