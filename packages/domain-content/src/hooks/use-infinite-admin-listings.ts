import { useInfiniteQuery } from "@tanstack/react-query";
import { httpClient, endpoints, queryKeys, type AdminListingListDto } from "@sd/core-contracts";

export interface UseInfiniteAdminListingsOptions {
  search?: string;
  enabled?: boolean;
}

export function useInfiniteAdminListings(options?: UseInfiniteAdminListingsOptions) {
  return useInfiniteQuery({
    queryKey: queryKeys.admin.listings.infinite(options?.search),
    queryFn: async ({ pageParam }) => {
      // API returns full list (non-paginated), only fetch on first page
      if (pageParam) {
        return { items: [], nextCursor: undefined, hasMore: false };
      }

      const params = new URLSearchParams();
      if (options?.search) params.append("search", options.search);

      const url = `${endpoints.admin.listings}${params.size > 0 ? `?${params}` : ""}`;
      const response = await httpClient<AdminListingListDto>({ url, method: "GET" });

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
