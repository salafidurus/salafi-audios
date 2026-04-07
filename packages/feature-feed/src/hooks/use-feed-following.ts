import { useFeedFollowing } from "../api/feed.api";

export function useFeedFollowingScreen() {
  const { data, isFetching, error } = useFeedFollowing();

  return {
    items: data?.items ?? [],
    hasMore: data?.hasMore ?? false,
    nextCursor: data?.nextCursor,
    isFetching,
    error,
  };
}
