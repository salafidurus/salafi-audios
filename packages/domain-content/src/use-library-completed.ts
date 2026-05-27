import { useMemo } from "react";
import { useProgressStore } from "@sd/domain-audio";
import { useLibraryCompleted } from "./library.api";
import { localCompletedItems } from "./library.local";

export function useLibraryCompletedScreen(isAuthenticated = false) {
  const { data, isFetching, error } = useLibraryCompleted(undefined, isAuthenticated);
  const progressMap = useProgressStore((s) => s.progressMap);

  const localItems = useMemo(() => localCompletedItems(progressMap), [progressMap]);

  if (!isAuthenticated) {
    return {
      items: localItems,
      hasMore: false,
      nextCursor: undefined,
      isFetching: false,
      error: null,
    };
  }

  return {
    items: data?.items ?? [],
    hasMore: data?.hasMore ?? false,
    nextCursor: data?.nextCursor,
    isFetching,
    error,
  };
}
