import { httpClient, endpoints, queryKeys, type LibraryPageDto } from "@sd/core-contracts";
import { useInfiniteQuery } from "@tanstack/react-query";

export interface UseInfiniteLibraryProgressOptions {
  enabled?: boolean;
}

export function useInfiniteLibraryProgress(options?: UseInfiniteLibraryProgressOptions) {
  const initialPageParam: string | undefined = undefined;

  return useInfiniteQuery({
    queryKey: queryKeys.library.progress.infinite(),
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
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
    initialPageParam,
    getNextPageParam: () => undefined,
    enabled: options?.enabled !== false,
  });
}
