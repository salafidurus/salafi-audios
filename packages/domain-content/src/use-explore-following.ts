import { useInfiniteQuery } from "@tanstack/react-query";
import { httpClient, endpoints, queryKeys, type FeedPageDto } from "@sd/core-contracts";

export function useExploreFollowingScreen() {
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
