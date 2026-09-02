import { httpClient, endpoints, queryKeys, type AdminListingListDto } from "@sd/core-contracts";
import { useInfiniteQuery } from "@tanstack/react-query";

/** Provides cursor-based admin discovery of catalog Listings. */
/** Search and lifecycle controls for the admin Listing query. */
export interface UseInfiniteAdminListingsOptions {
  search?: string;
  enabled?: boolean;
}

/** Fetches admin Listing pages; authorization remains enforced by the API. */
export function useInfiniteAdminListings(options?: UseInfiniteAdminListingsOptions) {
  const initialPageParam: string | undefined = undefined;

  return useInfiniteQuery({
    queryKey: queryKeys.admin.listings.infinite(options?.search),
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      const params = new URLSearchParams();
      if (options?.search) params.append("search", options.search);
      if (pageParam) params.append("cursor", pageParam);

      const url = `${endpoints.admin.listings.list}${params.size > 0 ? `?${params}` : ""}`;
      const response = await httpClient<AdminListingListDto>({ url, method: "GET" });

      return {
        items: response.items,
        nextCursor: response.nextCursor,
        hasMore: response.hasMore ?? false,
      };
    },
    initialPageParam,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: options?.enabled !== false,
  });
}
