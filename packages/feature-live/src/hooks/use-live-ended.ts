import { useLiveEnded } from "../api/live.api";

export function useLiveEndedScreen() {
  const { data, isFetching, error } = useLiveEnded();

  return {
    sessions: data?.items ?? [],
    hasMore: data?.hasMore ?? false,
    nextCursor: data?.nextCursor,
    isFetching,
    error,
  };
}
