import {
  httpClient,
  endpoints,
  queryKeys,
  parseFeedPageDto,
  type Locale,
  type FeedPageDto,
} from "@sd/core-contracts";
import { useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";

/** Fetches the public recent-feed Catalog surface with optional topic steering. */
/** Controls the recent Explore feed size and optional topic steering. */
export type UseExploreRecentScreenOptions = {
  limit?: number;
  /** Request locale included in the cache identity for localized recommendation pages. */
  locale?: Locale;
  /** Public topic identity used to steer, not strictly filter, the feed. */
  topicSlug?: string;
};

/** Reads API-composed recent Catalog pages for the Explore screen. */
export function useExploreRecentScreen({
  limit,
  locale,
  topicSlug,
}: UseExploreRecentScreenOptions = {}) {
  const initialPageParam: string | undefined = undefined;
  const queryKey = [
    ...queryKeys.listings.all,
    "recent",
    topicSlug ?? "",
    limit ?? null,
    locale ?? "default",
  ] as const;

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
      const response = await httpClient<unknown>({
        url: endpoints.listings.recent,
        method: "GET",
        params,
      });
      return parseFeedPageDto(response);
    },
    initialPageParam,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

/** Reads the Home recent-content slice without coupling Home callers to Explore screen behavior. */
export function useHomeRecent(options: Omit<UseExploreRecentScreenOptions, "topicSlug"> = {}) {
  return useExploreRecentScreen(options);
}
