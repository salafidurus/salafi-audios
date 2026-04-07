import { useLibrarySaved } from "../api/library.api";

export function useLibrarySavedScreen() {
  const { data, isFetching, error } = useLibrarySaved();

  return {
    items: data?.items ?? [],
    hasMore: data?.hasMore ?? false,
    nextCursor: data?.nextCursor,
    isFetching,
    error,
  };
}
