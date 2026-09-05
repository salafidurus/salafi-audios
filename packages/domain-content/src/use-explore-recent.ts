import {
  httpClient,
  endpoints,
  queryKeys,
  parseFeedPageDto,
  type Locale,
  type FeedPageDto,
} from "@sd/core-contracts";
import { useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";

/** UseExploreRecentScreenOptions limits callers to page size and locale; recommendation context is never client-selected. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- The preceding TSDoc documents the intentionally narrow option contract.
export type UseExploreRecentScreenOptions = {
  limit?: number;
  /** Request locale included in the cache identity for localized recommendation pages. */
  locale?: Locale;
};

/** Reads API-composed recent Catalog pages for the Explore screen. */
export function useExploreRecentScreen({ limit, locale }: UseExploreRecentScreenOptions = {}) {
  const initialPageParam: string | undefined = undefined;
  const queryKey = [
    ...queryKeys.explore.feed(undefined),
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
      const response = await httpClient<unknown>({
        url: endpoints.explore.feed,
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
export function useHomeRecent(options: UseExploreRecentScreenOptions = {}) {
  return useExploreRecentScreen(options);
}
