import { useInfiniteQuery } from "@tanstack/react-query";
import { httpClient, endpoints, queryKeys, type LibraryPageDto } from "@sd/core-contracts";

export interface UseInfiniteLibraryCompletedOptions {
  enabled?: boolean;
}

export function useInfiniteLibraryCompleted(options?: UseInfiniteLibraryCompletedOptions) {
  return useInfiniteQuery({
    queryKey: queryKeys.library.completed.infinite(),
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      if (pageParam) params.append("cursor", pageParam);

      const url = `${endpoints.library.completed}${params.size > 0 ? `?${params}` : ""}`;
      const response = await httpClient<LibraryPageDto>({ url, method: "GET" });

      return {
        items: response.items,
        nextCursor: response.nextCursor,
        hasMore: response.hasMore ?? false,
      };
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: options?.enabled !== false,
  });
}
