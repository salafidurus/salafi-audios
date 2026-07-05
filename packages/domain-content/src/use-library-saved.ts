import { useMemo } from "react";
import { useProgressStore } from "@sd/domain-audio";
import { useLibrarySaved } from "./library.api";
import { localSavedItems } from "./library.local";

export function useLibrarySavedScreen(isAuthenticated = false) {
  const { data, isFetching, error } = useLibrarySaved(undefined, isAuthenticated);
  const savedMap = useProgressStore((s) => s.savedMap);

  const localItems = useMemo(() => localSavedItems(savedMap), [savedMap]);

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
