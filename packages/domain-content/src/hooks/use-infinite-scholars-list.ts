import { useInfiniteQuery } from "@tanstack/react-query";
import { httpClient, endpoints, queryKeys, type ScholarListDto } from "@sd/core-contracts";

export interface UseInfiniteScholarsListOptions {
  enabled?: boolean;
}

export function useInfiniteScholarsList(options?: UseInfiniteScholarsListOptions) {
  return useInfiniteQuery({
    queryKey: queryKeys.scholars.list.infinite(),
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      if (pageParam) params.append("cursor", pageParam);

      const url = `${endpoints.scholars.list}${params.size > 0 ? `?${params}` : ""}`;
      const response = await httpClient<ScholarListDto>({ url, method: "GET" });

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
