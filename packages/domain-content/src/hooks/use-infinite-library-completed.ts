import { useInfiniteQuery } from "@tanstack/react-query";
import { httpClient, endpoints, queryKeys, type LibraryPageDto } from "@sd/core-contracts";

export interface UseInfiniteLibraryCompletedOptions {
  enabled?: boolean;
}

export function useInfiniteLibraryCompleted(options?: UseInfiniteLibraryCompletedOptions) {
  return useInfiniteQuery({
    queryKey: queryKeys.library.completed.infinite(),
    queryFn: async ({ pageParam }) => {
      if (pageParam) {
        return { items: [], nextCursor: undefined, hasMore: false };
      }

      const url = endpoints.library.completed;
      const response = await httpClient<LibraryPageDto>({ url, method: "GET" });

      return {
        items: response.items,
        nextCursor: undefined,
        hasMore: false,
      };
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: () => undefined,
    enabled: options?.enabled !== false,
  });
}
