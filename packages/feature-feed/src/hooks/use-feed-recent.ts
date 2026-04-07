import { useFeedRecent } from "../api/feed.api";

export function useFeedRecentScreen() {
  const { data, isFetching, error } = useFeedRecent();

  return {
    items: data?.items ?? [],
    nextCursor: data?.nextCursor,
    isFetching,
    error,
  };
}
