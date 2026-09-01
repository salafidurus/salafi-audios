import { useMemo } from "react";

import { useMyLibrarySaved } from "./my-library.api";
import { localSavedItems } from "./my-library.local";
import { useSavedStore } from "./saved/saved.store";

/** Selects saved My Library rows from remote or local personal state. */
/** Returns saved Library data without requesting private state anonymously. */
export function useMyLibrarySavedScreen(isAuthenticated = false) {
  const { data, isFetching, error, refetch } = useMyLibrarySaved(undefined, isAuthenticated);
  const entities = useSavedStore((s) => s.entities);

  const localItems = useMemo(
    () => localSavedItems(Object.values(entities).filter((entry) => !entry.deletedAt)),
    [entities],
  );

  const remoteState = () => ({
    items: data?.items ?? [],
    hasMore: data?.hasMore ?? false,
    nextCursor: data?.nextCursor,
    isFetching,
    error,
    refetch: async () => {
      await refetch();
    },
  });
  const localState = () => ({
    items: localItems,
    hasMore: false,
    nextCursor: undefined,
    isFetching: false,
    error: null,
    refetch: async () => {},
  });
  return isAuthenticated ? remoteState() : localState();
}
