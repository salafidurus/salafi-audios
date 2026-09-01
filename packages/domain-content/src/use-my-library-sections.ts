import { useProgressStore } from "@sd/domain-audio";
import { useMemo } from "react";

import { localCompletedItems, localProgressItems, localSavedItems } from "./my-library.local";
import { useSavedStore } from "./saved/saved.store";
import { useMyLibraryCompletedScreen } from "./use-my-library-completed";
import { useMyLibraryProgressScreen } from "./use-my-library-progress";
import { useMyLibrarySavedScreen } from "./use-my-library-saved";

/**
 * Selects a personal-state projection presented inside My Library.
 * `started`, `saved`, and `completed` are internal presentation choices; none
 * represents a router destination or changes the underlying domain contract.
 */
// oxlint-disable-next-line anti-slop/require-tsdoc -- the finite union is documented above.
export type MyLibrarySection = "started" | "saved" | "completed";

/** Describes the shared query and local-state result consumed by web and native presenters. */
export type MyLibrarySectionResult = {
  items: ReturnType<typeof useMyLibraryProgressScreen>["items"];
  hasMore: boolean;
  nextCursor: string | undefined;
  isFetching: boolean;
  /** Contains the request failure when the authenticated projection could not load. */
  error: ReturnType<typeof useMyLibraryProgressScreen>["error"];
  /** Retries the authenticated request; local-only projections provide a no-op. */
  refetch?: () => Promise<void>;
};

/** Names each shared My Library projection explicitly for consumers and type safety. */
export type MyLibrarySectionsResult = {
  started: MyLibrarySectionResult;
  saved: MyLibrarySectionResult;
  completed: MyLibrarySectionResult;
};

/**
 * Provides all My Library projections from one domain boundary.
 *
 * The caller owns which section is presented and how authentication is shown;
 * this hook owns the shared personal-state projections and their anonymous
 * local fallback. It does not create or inspect application routes.
 */
export function useMyLibrarySections(
  isAuthenticated = false,
  useLocalState = true,
): MyLibrarySectionsResult {
  const progress = useMyLibraryProgressScreen(isAuthenticated);
  const saved = useMyLibrarySavedScreen(isAuthenticated);
  const completed = useMyLibraryCompletedScreen(isAuthenticated);

  const progressMap = useProgressStore((state) => state.progressMap);
  const savedEntities = useSavedStore((state) => state.entities);

  const localProgress = useMemo(() => localProgressItems(progressMap), [progressMap]);
  const localSaved = useMemo(
    () => localSavedItems(Object.values(savedEntities).filter((entry) => !entry.deletedAt)),
    [savedEntities],
  );
  const localCompleted = useMemo(() => localCompletedItems(progressMap), [progressMap]);

  if (!isAuthenticated && useLocalState) {
    return {
      started: {
        items: localProgress,
        hasMore: false,
        nextCursor: undefined,
        isFetching: false,
        error: null,
        refetch: async () => {},
      },
      saved: {
        items: localSaved,
        hasMore: false,
        nextCursor: undefined,
        isFetching: false,
        error: null,
        refetch: async () => {},
      },
      completed: {
        items: localCompleted,
        hasMore: false,
        nextCursor: undefined,
        isFetching: false,
        error: null,
        refetch: async () => {},
      },
    };
  }

  if (!isAuthenticated) {
    const unauthenticated = {
      items: [],
      hasMore: false,
      nextCursor: undefined,
      isFetching: false,
      error: null,
      refetch: async () => {},
    } satisfies MyLibrarySectionResult;
    return {
      started: unauthenticated,
      saved: unauthenticated,
      completed: unauthenticated,
    };
  }

  return {
    started: progress,
    saved,
    completed,
  };
}
