import { useMemo } from "react";

import { useLibrarySaved } from "./library.api";
import { localSavedItems } from "./library.local";
import { useSavedStore } from "./saved/saved.store";

export function useLibrarySavedScreen(isAuthenticated = false) {
  const { data, isFetching, error } = useLibrarySaved(undefined, isAuthenticated);
  const entities = useSavedStore((s) => s.entities);

  const localItems = useMemo(
    () => localSavedItems(Object.values(entities).filter((entry) => !entry.deletedAt)),
    [entities],
  );

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
