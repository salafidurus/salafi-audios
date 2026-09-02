import { type MyLibraryItemDto } from "@sd/core-contracts";
import { usePlaybackStore, useProgressStore } from "@sd/domain-audio";
import { useMemo } from "react";

import { useInfiniteMyLibraryCompleted } from "./hooks/use-infinite-my-library-completed";
import { useInfiniteMyLibraryProgress } from "./hooks/use-infinite-my-library-progress";
import { useInfiniteMyLibrarySaved } from "./hooks/use-infinite-my-library-saved";
import { useEnrichedLocalLibraryItems } from "./my-library.catalog";
import { localCompletedItems, localProgressItems, localSavedItems } from "./my-library.local";
import { useSavedStore } from "./saved/saved.store";
import { mergeLiveProgress } from "./utils/merge-live-progress";

/**
 * Selects a personal-state projection presented inside My Library.
 * `started`, `saved`, and `completed` are internal presentation choices; none
 * represents a router destination or changes the underlying domain contract.
 */
// oxlint-disable-next-line anti-slop/require-tsdoc -- the finite union is documented above.
export type MyLibrarySection = "started" | "saved" | "completed";

/** Describes the shared query and local-state result consumed by web and native presenters. */
export type MyLibrarySectionResult = {
  items: MyLibraryItemDto[];
  hasMore: boolean;
  nextCursor: string | undefined;
  isFetching: boolean;
  isFetchingNextPage: boolean;
  /** Contains the request failure when the authenticated projection could not load. */
  error: Error | null;
  /** Retries the authenticated request; local-only projections provide a no-op. */
  refetch?: () => Promise<void>;
  /** Fetches the next cursor page when the remote projection has more results. */
  fetchNextPage?: () => Promise<void>;
};

/** Names each shared My Library projection explicitly for consumers and type safety. */
export type MyLibrarySectionsResult = {
  started: MyLibrarySectionResult;
  saved: MyLibrarySectionResult;
  completed: MyLibrarySectionResult;
};

/** Configures authentication, anonymous fallback, and the one active projection to request. */
export type UseMyLibrarySectionsOptions = {
  isAuthenticated?: boolean;
  localFallback?: boolean;
  activeSection: MyLibrarySection;
};

const EMPTY_REMOTE_STATE: MyLibrarySectionResult = {
  items: [],
  hasMore: false,
  nextCursor: undefined,
  isFetching: false,
  isFetchingNextPage: false,
  error: null,
};

function localState(items: MyLibraryItemDto[]): MyLibrarySectionResult {
  return {
    ...EMPTY_REMOTE_STATE,
    items,
    refetch: async () => {},
    fetchNextPage: async () => {},
  };
}

type MyLibraryQuery = ReturnType<typeof useInfiniteMyLibraryProgress>;

// eslint-disable-next-line complexity -- normalizes the enabled/disabled infinite-query state.
function remoteState(
  query: MyLibraryQuery,
  items: MyLibraryItemDto[],
  enabled: boolean,
): MyLibrarySectionResult {
  if (!enabled) return EMPTY_REMOTE_STATE;
  const lastPage = query.data?.pages.at(-1);
  return {
    items,
    hasMore: lastPage?.hasMore ?? false,
    nextCursor: lastPage?.nextCursor,
    isFetching: query.isFetching,
    isFetchingNextPage: query.isFetchingNextPage,
    error:
      query.error instanceof Error
        ? query.error
        : query.error
          ? new Error(String(query.error))
          : null,
    refetch: async () => {
      await query.refetch();
    },
    fetchNextPage: async () => {
      if (query.hasNextPage && !query.isFetchingNextPage) await query.fetchNextPage();
    },
  };
}

/**
 * Provides all My Library projections from one domain boundary.
 *
 * The caller owns which section is presented and how authentication is shown;
 * this hook owns the shared personal-state projections and their anonymous
 * local fallback. It does not create or inspect application routes.
 */
// eslint-disable-next-line complexity -- this boundary explicitly selects auth and local policies.
export function useMyLibrarySections({
  isAuthenticated = false,
  localFallback = true,
  activeSection,
}: UseMyLibrarySectionsOptions): MyLibrarySectionsResult {
  const progressQuery = useInfiniteMyLibraryProgress({
    enabled: isAuthenticated && activeSection === "started",
  });
  const savedQuery = useInfiniteMyLibrarySaved({
    enabled: isAuthenticated && activeSection === "saved",
  });
  const completedQuery = useInfiniteMyLibraryCompleted({
    enabled: isAuthenticated && activeSection === "completed",
  });

  const progressMap = useProgressStore((state) => state.progressMap);
  const currentTrack = usePlaybackStore((state) => state.currentTrack);
  const savedEntities = useSavedStore((state) => state.entities);

  const localProgress = useMemo(() => localProgressItems(progressMap), [progressMap]);
  const localSaved = useMemo(
    () => localSavedItems(Object.values(savedEntities).filter((entry) => !entry.deletedAt)),
    [savedEntities],
  );
  const localCompleted = useMemo(() => localCompletedItems(progressMap), [progressMap]);
  const enrichedLocalProgress = useEnrichedLocalLibraryItems(
    localProgress,
    !isAuthenticated && localFallback,
  );
  const enrichedLocalSaved = useEnrichedLocalLibraryItems(
    localSaved,
    !isAuthenticated && localFallback,
  );
  const enrichedLocalCompleted = useEnrichedLocalLibraryItems(
    localCompleted,
    !isAuthenticated && localFallback,
  );

  const remoteProgressItems = useMemo(
    () =>
      mergeLiveProgress(
        progressQuery.data?.pages.flatMap((page) => page.items) ?? [],
        progressMap,
        currentTrack,
      ),
    [progressQuery.data?.pages, progressMap, currentTrack],
  );

  if (!isAuthenticated && localFallback) {
    return {
      started: localState(enrichedLocalProgress),
      saved: localState(enrichedLocalSaved),
      completed: localState(enrichedLocalCompleted),
    };
  }

  if (!isAuthenticated) {
    return {
      started: EMPTY_REMOTE_STATE,
      saved: EMPTY_REMOTE_STATE,
      completed: EMPTY_REMOTE_STATE,
    };
  }

  return {
    started: remoteState(progressQuery, remoteProgressItems, activeSection === "started"),
    saved: remoteState(
      savedQuery,
      savedQuery.data?.pages.flatMap((page) => page.items) ?? [],
      activeSection === "saved",
    ),
    completed: remoteState(
      completedQuery,
      completedQuery.data?.pages.flatMap((page) => page.items) ?? [],
      activeSection === "completed",
    ),
  };
}
