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
      const params = new URLSearchParams();
      if (options?.search) params.append("search", options.search);
      if (options?.role) params.append("role", options.role);
      if (pageParam) params.append("cursor", pageParam);

      const url = `${endpoints.admin.users}${params.size > 0 ? `?${params}` : ""}`;
      const response = await httpClient<AdminUserListDto>({ url, method: "GET" });

      return {
        items: response.users,
        nextCursor: response.nextCursor,
        hasMore: response.hasMore ?? false,
      };
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: options?.enabled !== false,
  });
}
