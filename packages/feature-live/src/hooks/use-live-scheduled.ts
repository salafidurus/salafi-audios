import { useLiveScheduled } from "../api/live.api";

export function useLiveScheduledScreen() {
  const { data, isFetching, error } = useLiveScheduled();

  return {
    sessions: data?.items ?? [],
    hasMore: data?.hasMore ?? false,
    isFetching,
    error,
  };
}
