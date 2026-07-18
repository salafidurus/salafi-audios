import { useInfiniteQuery } from "@tanstack/react-query";
import { httpClient, endpoints, queryKeys, type AdminScholarListDto } from "@sd/core-contracts";

export interface UseInfiniteAdminScholarsOptions {
  search?: string;
  enabled?: boolean;
}

export function useInfiniteAdminScholars(options?: UseInfiniteAdminScholarsOptions) {
  return useInfiniteQuery({
    queryKey: queryKeys.admin.scholars.infinite(options?.search),
    queryFn: async ({ pageParam }) => {
      // API returns full list (non-paginated), only fetch on first page
      if (pageParam) {
        return { items: [], nextCursor: undefined, hasMore: false };
      }

      const params = new URLSearchParams();
      if (options?.search) params.append("search", options.search);

      const url = `${endpoints.admin.scholars}${params.size > 0 ? `?${params}` : ""}`;
      const response = await httpClient<AdminScholarListDto>({ url, method: "GET" });

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
