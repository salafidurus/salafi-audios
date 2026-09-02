import { httpClient, endpoints, queryKeys, type ScholarListDto } from "@sd/core-contracts";
import { useInfiniteQuery } from "@tanstack/react-query";

/** Adapts the public scholar catalog endpoint to an infinite-query interface. */
/** Controls whether the public scholar list is requested. */
export interface UseInfiniteScholarsListOptions {
  enabled?: boolean;
}

/** Fetches the complete public scholar list on the first query page. */
export function useInfiniteScholarsList(options?: UseInfiniteScholarsListOptions) {
  const initialPageParam: string | undefined = undefined;

  return useInfiniteQuery({
    queryKey: queryKeys.scholars.list.infinite(),
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
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
    initialPageParam,
    getNextPageParam: () => undefined,
    enabled: options?.enabled !== false,
  });
}
