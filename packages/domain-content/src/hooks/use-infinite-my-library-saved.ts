import { httpClient, endpoints, queryKeys, type MyLibraryPageDto } from "@sd/core-contracts";
import { useInfiniteQuery } from "@tanstack/react-query";

/** Adapts saved personal-library data to an infinite-query interface. */
/** Controls whether saved personal-library data is requested. */
export interface UseInfiniteMyLibrarySavedOptions {
  enabled?: boolean;
}

/** Fetches the authenticated user's saved My Library relationships. */
export function useInfiniteMyLibrarySaved(options?: UseInfiniteMyLibrarySavedOptions) {
  const initialPageParam: string | undefined = undefined;

  return useInfiniteQuery({
    queryKey: queryKeys.myLibrary.saved.infinite(),
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      if (pageParam) {
        return { items: [], nextCursor: undefined, hasMore: false };
      }

      const url = endpoints.myLibrary.saved;
      const response = await httpClient<MyLibraryPageDto>({ url, method: "GET" });

      return {
        items: response.items,
        nextCursor: undefined,
        hasMore: false,
      };
    },
    initialPageParam,
    getNextPageParam: () => undefined,
    enabled: options?.enabled !== false,
  });
}
