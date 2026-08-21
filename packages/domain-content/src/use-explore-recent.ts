import { httpClient, endpoints, queryKeys, type FeedPageDto } from "@sd/core-contracts";
import { useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";

export type UseExploreRecentScreenOptions = {
  limit?: number;
};

export function useExploreRecentScreen({ limit }: UseExploreRecentScreenOptions = {}) {
  const initialPageParam: string | undefined = undefined;
  const queryKey = [...queryKeys.listings.all, "recent", limit ?? null] as const;

  return useInfiniteQuery<
    FeedPageDto,
    Error,
    InfiniteData<FeedPageDto>,
    typeof queryKey,
    string | undefined
  >({
    queryKey,
    queryFn: async ({ pageParam }) => {
      const params: Record<string, string> = {};
      if (pageParam) params.cursor = pageParam;
      if (limit) params.limit = String(limit);
      return httpClient<FeedPageDto>({
        url: endpoints.listings.recent,
        method: "GET",
        params,
      });
    },
    initialPageParam,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}
