import { useFeedRecent } from "../api/feed.api";

export function useFeedRecentScreen() {
  const { data, isFetching, error } = useFeedRecent();

  return {
    items: data?.items ?? [],
    hasMore: data?.hasMore ?? false,
    nextCursor: data?.nextCursor,
    isFetching,
    error,
  };
}
