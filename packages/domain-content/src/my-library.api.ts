/** Query hooks for the authenticated user's saved, completed, and in-progress Library. */
import {
  endpoints,
  httpClient,
  queryKeys,
  useApiQuery,
  type MyLibraryPageDto,
} from "@sd/core-contracts";

/** Provides API queries for the three distinct My Library relationship states. */
/** Reads saved Listing relationships, optionally starting after a cursor. */
export function useMyLibrarySaved(cursor?: string, enabled = true) {
  return useApiQuery(
    queryKeys.myLibrary.saved.all(),
    () =>
      httpClient<MyLibraryPageDto>({
        url: endpoints.myLibrary.saved,
        method: "GET",
        params: cursor ? { cursor } : undefined,
      }),
    { enabled },
  );
}

/** Reads completed Listing relationships, optionally starting after a cursor. */
export function useMyLibraryCompleted(cursor?: string, enabled = true) {
  return useApiQuery(
    queryKeys.myLibrary.completed.all(),
    () =>
      httpClient<MyLibraryPageDto>({
        url: endpoints.myLibrary.completed,
        method: "GET",
        params: cursor ? { cursor } : undefined,
      }),
    { enabled },
  );
}

/** Reads unfinished Listing relationships, optionally starting after a cursor. */
export function useMyLibraryProgress(cursor?: string, enabled = true) {
  return useApiQuery(
    queryKeys.myLibrary.progress.all(),
    () =>
      httpClient<MyLibraryPageDto>({
        url: endpoints.myLibrary.progress,
        method: "GET",
        params: cursor ? { cursor } : undefined,
      }),
    { enabled },
  );
}
