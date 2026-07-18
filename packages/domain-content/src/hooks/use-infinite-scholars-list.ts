import { useInfiniteQuery } from "@tanstack/react-query";
import { httpClient, endpoints, queryKeys, type ScholarListDto } from "@sd/core-contracts";

export interface UseInfiniteScholarsListOptions {
  enabled?: boolean;
}

export function useInfiniteScholarsList(options?: UseInfiniteScholarsListOptions) {
  return useInfiniteQuery({
    queryKey: queryKeys.scholars.list.infinite(),
    queryFn: async ({ pageParam }) => {
      // API returns full list (non-paginated), only fetch on first page
      if (pageParam) {
        return { items: [], nextCursor: undefined, hasMore: false };
      }

      const url = endpoints.scholars.list;
      const response = await httpClient<ScholarListDto>({ url, method: "GET" });

      return {
        items: response.scholars,
        nextCursor: undefined,
        hasMore: false,
      };
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: () => undefined,
    enabled: options?.enabled !== false,
  });
}
