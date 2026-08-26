import {
  endpoints,
  httpClient,
  queryKeys,
  useApiQuery,
  type MyLibraryPageDto,
} from "@sd/core-contracts";

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
