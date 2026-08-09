import { useProgressStore, usePlaybackStore } from "@sd/domain-audio";
import { useMemo } from "react";

import { useLibraryProgress } from "./library.api";
import { localProgressItems } from "./library.local";
import { mergeLiveProgress } from "./utils/merge-live-progress";

export function useLibraryProgressScreen(isAuthenticated = false) {
  const { data, isFetching, error } = useLibraryProgress(undefined, isAuthenticated);
  const progressMap = useProgressStore((s) => s.progressMap);
  const currentTrack = usePlaybackStore((s) => s.currentTrack);

  const localItems = useMemo(() => localProgressItems(progressMap), [progressMap]);
  // Live position/completion always wins over the last-fetched server snapshot,
  // so a tick shows up instantly instead of waiting for the batched sync + refetch.
  const mergedItems = useMemo(
    () => mergeLiveProgress(data?.items ?? [], progressMap, currentTrack),
    [data?.items, progressMap, currentTrack],
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
    items: mergedItems,
    hasMore: data?.hasMore ?? false,
    nextCursor: data?.nextCursor,
    isFetching,
    error,
  };
}
