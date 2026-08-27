import { useMemo } from "react";

import { useMyLibrarySaved } from "./my-library.api";
import { localSavedItems } from "./my-library.local";
import { useSavedStore } from "./saved/saved.store";

export function useMyLibrarySavedScreen(isAuthenticated = false) {
  const { data, isFetching, error } = useMyLibrarySaved(undefined, isAuthenticated);
  const entities = useSavedStore((s) => s.entities);

  const localItems = useMemo(
    () => localSavedItems(Object.values(entities).filter((entry) => !entry.deletedAt)),
    [entities],
  );

  return isAuthenticated
    ? {
        items: data?.items ?? [],
        hasMore: data?.hasMore ?? false,
        nextCursor: data?.nextCursor,
        isFetching,
        error,
      }
    : { items: localItems, hasMore: false, nextCursor: undefined, isFetching: false, error: null };
}
