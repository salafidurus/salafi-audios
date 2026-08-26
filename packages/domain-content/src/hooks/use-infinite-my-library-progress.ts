import { httpClient, endpoints, queryKeys, type MyLibraryPageDto } from "@sd/core-contracts";
import { useInfiniteQuery } from "@tanstack/react-query";

export interface UseInfiniteMyLibraryProgressOptions {
  enabled?: boolean;
}

export function useInfiniteMyLibraryProgress(options?: UseInfiniteMyLibraryProgressOptions) {
  const initialPageParam: string | undefined = undefined;

  return useInfiniteQuery({
    queryKey: queryKeys.myLibrary.progress.infinite(),
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      if (pageParam) {
        return { items: [], nextCursor: undefined, hasMore: false };
      }

      const url = endpoints.myLibrary.progress;
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
