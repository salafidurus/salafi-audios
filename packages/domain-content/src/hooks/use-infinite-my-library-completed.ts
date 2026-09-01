import { httpClient, endpoints, queryKeys, type MyLibraryPageDto } from "@sd/core-contracts";
import { useInfiniteQuery } from "@tanstack/react-query";

/** Adapts completed personal-library data to an infinite-query interface. */
/** Controls whether completed personal-library data is requested. */
export interface UseInfiniteMyLibraryCompletedOptions {
  enabled?: boolean;
}

/** Fetches the authenticated user's completed My Library relationships. */
export function useInfiniteMyLibraryCompleted(options?: UseInfiniteMyLibraryCompletedOptions) {
  const initialPageParam: string | undefined = undefined;

  return useInfiniteQuery({
    queryKey: queryKeys.myLibrary.completed.infinite(),
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      const url = endpoints.myLibrary.completed;
      const response = await httpClient<MyLibraryPageDto>({
        url,
        method: "GET",
        params: pageParam ? { cursor: pageParam } : undefined,
      });

      return {
        items: response.items,
        nextCursor: response.nextCursor,
        hasMore: response.hasMore,
      };
    },
    initialPageParam,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: options?.enabled !== false,
  });
}
