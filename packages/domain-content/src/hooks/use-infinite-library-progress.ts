import { useInfiniteQuery } from "@tanstack/react-query";
import { httpClient, endpoints, queryKeys, type LibraryPageDto } from "@sd/core-contracts";

export interface UseInfiniteLibraryProgressOptions {
  enabled?: boolean;
}

export function useInfiniteLibraryProgress(options?: UseInfiniteLibraryProgressOptions) {
  return useInfiniteQuery({
    queryKey: queryKeys.library.progress.infinite(),
    queryFn: async ({ pageParam }) => {
      if (pageParam) {
        return { items: [], nextCursor: undefined, hasMore: false };
      }

      const url = endpoints.library.progress;
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
