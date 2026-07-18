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
      const params = new URLSearchParams();
      if (options?.search) params.append("search", options.search);
      if (pageParam) params.append("cursor", pageParam);

      const url = `${endpoints.admin.listings}${params.size > 0 ? `?${params}` : ""}`;
      const response = await httpClient<AdminListingListDto>({ url, method: "GET" });

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
