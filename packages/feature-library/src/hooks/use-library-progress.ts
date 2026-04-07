import { useLibraryProgress } from "../api/library.api";

export function useLibraryProgressScreen() {
  const { data, isFetching, error } = useLibraryProgress();

  return {
    items: data?.items ?? [],
    hasMore: data?.hasMore ?? false,
    nextCursor: data?.nextCursor,
    isFetching,
    error,
  };
}
