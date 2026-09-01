import { useProgressStore } from "@sd/domain-audio";
import { useMemo } from "react";

import { useMyLibraryCompleted } from "./my-library.api";
import { localCompletedItems } from "./my-library.local";

/** Selects completed My Library rows from remote or local personal state. */
/** Returns completed Library data without requesting private state anonymously. */
export function useMyLibraryCompletedScreen(isAuthenticated = false) {
  const { data, isFetching, error, refetch } = useMyLibraryCompleted(undefined, isAuthenticated);
  const progressMap = useProgressStore((s) => s.progressMap);

  const localItems = useMemo(() => localCompletedItems(progressMap), [progressMap]);

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
