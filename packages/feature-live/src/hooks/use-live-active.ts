import { useLiveActive } from "../api/live.api";

export function useLiveActiveScreen() {
  const { data, isFetching, error } = useLiveActive();

  return {
    sessions: data?.items ?? [],
    hasMore: data?.hasMore ?? false,
    isFetching,
    error,
  };
}
