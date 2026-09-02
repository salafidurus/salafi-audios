import { httpClient, endpoints, queryKeys, type AdminScholarListDto } from "@sd/core-contracts";
import { useInfiniteQuery } from "@tanstack/react-query";

/** Provides cursor-based admin discovery of catalog scholars. */
/** Search and lifecycle controls for the admin scholar query. */
export interface UseInfiniteAdminScholarsOptions {
  search?: string;
  enabled?: boolean;
}

/** Fetches admin scholar pages without making client-side authorization decisions. */
export function useInfiniteAdminScholars(options?: UseInfiniteAdminScholarsOptions) {
  const initialPageParam: string | undefined = undefined;

  return useInfiniteQuery({
    queryKey: queryKeys.admin.scholars.infinite(options?.search),
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      const params = new URLSearchParams();
      if (options?.search) params.append("search", options.search);
      if (pageParam) params.append("cursor", pageParam);

      const url = `${endpoints.admin.scholars.list}${params.size > 0 ? `?${params}` : ""}`;
      const response = await httpClient<AdminScholarListDto>({ url, method: "GET" });

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
