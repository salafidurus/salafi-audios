import { httpClient, endpoints, queryKeys, type AdminUserListDto } from "@sd/core-contracts";
import { useInfiniteQuery } from "@tanstack/react-query";

export interface UseInfiniteAdminUsersOptions {
  search?: string;
  role?: string;
  enabled?: boolean;
}

export function useInfiniteAdminUsers(options?: UseInfiniteAdminUsersOptions) {
  const initialPageParam: string | undefined = undefined;

  return useInfiniteQuery({
    queryKey: queryKeys.admin.users.infinite(options?.search, options?.role),
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      const params = new URLSearchParams();
      if (options?.search) params.append("q", options.search);
      if (options?.role) params.append("role", options.role);
      if (pageParam) params.append("cursor", pageParam);

      const url = `${endpoints.admin.users.list}${params.size > 0 ? `?${params}` : ""}`;
      const response = await httpClient<AdminUserListDto>({ url, method: "GET" });

      return {
        items: response.users,
        nextCursor: response.nextCursor,
        hasMore: response.hasMore ?? false,
      };
    },
    initialPageParam,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: options?.enabled !== false,
  });
}
