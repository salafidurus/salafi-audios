import {
  endpoints,
  httpClient,
  queryKeys,
  useApiQuery,
  type LibraryPageDto,
} from "@sd/core-contracts";

export function useLibrarySaved(cursor?: string) {
  return useApiQuery(queryKeys.library.saved(cursor), () =>
    httpClient<LibraryPageDto>({
      url: endpoints.library.saved,
      method: "GET",
      params: cursor ? { cursor } : undefined,
    }),
  );
}

export function useLibraryCompleted(cursor?: string) {
  return useApiQuery(queryKeys.library.completed(cursor), () =>
    httpClient<LibraryPageDto>({
      url: endpoints.library.completed,
      method: "GET",
      params: cursor ? { cursor } : undefined,
    }),
  );
}
