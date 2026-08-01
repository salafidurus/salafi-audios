import {
  endpoints,
  httpClient,
  queryKeys,
  useApiQuery,
  type LibraryPageDto,
} from "@sd/core-contracts";

export function useLibrarySaved(cursor?: string, enabled = true) {
  return useApiQuery(
    queryKeys.library.saved.all(),
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
    queryKeys.library.completed.all(),
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
    queryKeys.library.progress.all(),
    () =>
      httpClient<LibraryPageDto>({
        url: endpoints.library.progress,
        method: "GET",
        params: cursor ? { cursor } : undefined,
      }),
    { enabled },
  );
}
