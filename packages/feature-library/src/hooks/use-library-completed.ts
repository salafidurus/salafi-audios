import { useLibraryCompleted } from "../api/library.api";

export function useLibraryCompletedScreen() {
  const { data, isFetching, error } = useLibraryCompleted();

  return {
    items: data?.items ?? [],
    hasMore: data?.hasMore ?? false,
    nextCursor: data?.nextCursor,
    isFetching,
    error,
  };
}
