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
      const params = new URLSearchParams();
      if (options?.search) params.append("search", options.search);
      if (pageParam) params.append("cursor", pageParam);

      const url = `${endpoints.admin.scholars}${params.size > 0 ? `?${params}` : ""}`;
      const response = await httpClient<AdminScholarListDto>({ url, method: "GET" });

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
