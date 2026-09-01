import { httpClient, endpoints, queryKeys, type MyLibraryPageDto } from "@sd/core-contracts";
import { useInfiniteQuery } from "@tanstack/react-query";

/** Adapts in-progress personal-library data to an infinite-query interface. */
/** Controls whether in-progress personal-library data is requested. */
export interface UseInfiniteMyLibraryProgressOptions {
  enabled?: boolean;
}

/** Fetches the authenticated user's unfinished My Library relationships. */
export function useInfiniteMyLibraryProgress(options?: UseInfiniteMyLibraryProgressOptions) {
  const initialPageParam: string | undefined = undefined;

  return useInfiniteQuery({
    queryKey: queryKeys.myLibrary.progress.infinite(),
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      const url = endpoints.myLibrary.progress;
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
