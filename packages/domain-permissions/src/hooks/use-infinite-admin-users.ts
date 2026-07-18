import { useInfiniteQuery } from "@tanstack/react-query";
import { httpClient, endpoints, queryKeys, type AdminUserListDto } from "@sd/core-contracts";

export interface UseInfiniteAdminUsersOptions {
  search?: string;
  role?: string;
  enabled?: boolean;
}

export function useInfiniteAdminUsers(options?: UseInfiniteAdminUsersOptions) {
  return useInfiniteQuery({
    queryKey: queryKeys.admin.users.infinite(options?.search, options?.role),
    queryFn: async ({ pageParam }) => {
      // API returns full list (non-paginated), only fetch on first page
      if (pageParam) {
        return { items: [], nextCursor: undefined, hasMore: false };
      }

      const params = new URLSearchParams();
      if (options?.search) params.append("search", options.search);
      if (options?.role) params.append("role", options.role);

      const url = `${endpoints.admin.users}${params.size > 0 ? `?${params}` : ""}`;
      const response = await httpClient<AdminUserListDto>({ url, method: "GET" });

      return {
        items: response.users,
        nextCursor: undefined,
        hasMore: false,
      };
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: () => undefined,
    enabled: options?.enabled !== false,
  });
}
