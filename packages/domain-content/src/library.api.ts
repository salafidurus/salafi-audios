import {
  endpoints,
  httpClient,
  queryKeys,
  useApiQuery,
  type LibraryPageDto,
} from "@sd/core-contracts";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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

/** Saves or unsaves a listing on the server, then invalidates the saved-library queries. */
export function useToggleSaved() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listingId, saved }: { listingId: string; saved: boolean }) =>
      httpClient<void>({
        url: endpoints.library.saveListing(listingId),
        method: saved ? "POST" : "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.library.saved.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.library.saved.infinite() });
    },
  });
}
