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
      const url = buildAdminUsersUrl(options, pageParam);
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

function buildAdminUsersUrl(
  options: UseInfiniteAdminUsersOptions | undefined,
  pageParam: string | undefined,
): string {
  const params = new URLSearchParams();
  appendParam(params, "q", options?.search);
  appendParam(params, "role", options?.role);
  appendParam(params, "cursor", pageParam);
  return `${endpoints.admin.users.list}${params.size > 0 ? `?${params}` : ""}`;
}

function appendParam(params: URLSearchParams, key: string, value: string | undefined): void {
  if (value) params.append(key, value);
}
