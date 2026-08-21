import { httpClient, endpoints, queryKeys, type LibraryPageDto } from "@sd/core-contracts";
import { useInfiniteQuery } from "@tanstack/react-query";

export interface UseInfiniteLibraryCompletedOptions {
  enabled?: boolean;
}

export function useInfiniteLibraryCompleted(options?: UseInfiniteLibraryCompletedOptions) {
  const initialPageParam: string | undefined = undefined;

  return useInfiniteQuery({
    queryKey: queryKeys.library.completed.infinite(),
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
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
    initialPageParam,
    getNextPageParam: () => undefined,
    enabled: options?.enabled !== false,
  });
}
