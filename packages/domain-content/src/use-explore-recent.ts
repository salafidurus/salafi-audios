import { httpClient, endpoints, queryKeys, type FeedPageDto } from "@sd/core-contracts";
import { useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";

/** Fetches the public recent-feed Catalog surface with optional topic steering. */
/** Controls the recent Explore feed size and optional topic steering. */
export type UseExploreRecentScreenOptions = {
  limit?: number;
  /** Public topic identity used to steer, not strictly filter, the feed. */
  topicSlug?: string;
};

/** Reads API-composed recent Catalog pages for the Explore screen. */
export function useExploreRecentScreen({ limit, topicSlug }: UseExploreRecentScreenOptions = {}) {
  const initialPageParam: string | undefined = undefined;
  const queryKey = [...queryKeys.listings.all, "recent", topicSlug ?? "", limit ?? null] as const;

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
      if (topicSlug) params.topic = topicSlug;
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
