import { useFeedFollowing } from "../api/feed.api";

export function useFeedFollowingScreen() {
  const { data, isFetching, error } = useFeedFollowing();

  return {
    items: data?.items ?? [],
    nextCursor: data?.nextCursor,
    isFetching,
    error,
  };
}
