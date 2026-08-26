import { httpClient, endpoints, queryKeys, type MyLibraryPageDto } from "@sd/core-contracts";
import { useInfiniteQuery } from "@tanstack/react-query";

export interface UseInfiniteMyLibrarySavedOptions {
  enabled?: boolean;
}

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
