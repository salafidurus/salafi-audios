import { useProgressStore } from "@sd/domain-audio";
import { useMemo } from "react";

import { useMyLibraryCompleted } from "./my-library.api";
import { localCompletedItems } from "./my-library.local";

export function useMyLibraryCompletedScreen(isAuthenticated = false) {
  const { data, isFetching, error } = useMyLibraryCompleted(undefined, isAuthenticated);
  const progressMap = useProgressStore((s) => s.progressMap);

  const localItems = useMemo(() => localCompletedItems(progressMap), [progressMap]);

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
