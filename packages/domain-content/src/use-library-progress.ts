import { useMemo } from "react";
import { useProgressStore } from "@sd/domain-progress";
import { useLibraryProgress } from "./library.api";
import { localProgressItems } from "./library.local";

export function useLibraryProgressScreen(isAuthenticated = false) {
  const { data, isFetching, error } = useLibraryProgress(undefined, isAuthenticated);
  const progressMap = useProgressStore((s) => s.progressMap);

  const localItems = useMemo(() => localProgressItems(progressMap), [progressMap]);

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
