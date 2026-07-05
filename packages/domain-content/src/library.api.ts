import {
  endpoints,
  httpClient,
  queryKeys,
  useApiQuery,
  type LibraryPageDto,
} from "@sd/core-contracts";

export function useLibrarySaved(cursor?: string, enabled = true) {
  return useApiQuery(
    queryKeys.library.saved(cursor),
    () =>
      httpClient<LibraryPageDto>({
        url: endpoints.library.saved,
        method: "GET",
        params: cursor ? { cursor } : undefined,
      }),
    { enabled },
  );
}

export function useLibraryCompleted(cursor?: string, enabled = true) {
  return useApiQuery(
    queryKeys.library.completed(cursor),
    () =>
      httpClient<LibraryPageDto>({
        url: endpoints.library.completed,
        method: "GET",
        params: cursor ? { cursor } : undefined,
      }),
    { enabled },
  );
}

export function useLibraryProgress(cursor?: string, enabled = true) {
  return useApiQuery(
    queryKeys.library.progress(cursor),
    () =>
      httpClient<LibraryPageDto>({
        url: endpoints.library.progress,
        method: "GET",
        params: cursor ? { cursor } : undefined,
      }),
    { enabled },
  );
}
