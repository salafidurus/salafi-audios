import { useApiQuery, queryKeys, httpClient, endpoints } from "@sd/core-contracts";
import type { AdminPermission } from "@sd/core-contracts";
import type { UseQueryOptions, QueryKey } from "@tanstack/react-query";
import { useAuth } from "@/core/auth";

type MyPermissionsDto = { permissions: AdminPermission[] };

export function useAdminPermissions(
  options?: Omit<UseQueryOptions<MyPermissionsDto, Error, MyPermissionsDto, QueryKey>, "queryKey" | "queryFn">
) {
  const { isAuthenticated } = useAuth();

  return useApiQuery<MyPermissionsDto>(
    queryKeys.admin.permissions.me(),
    () =>
      httpClient<MyPermissionsDto>({
        url: endpoints.admin.permissions.me,
        method: "GET",
      }),
    {
      ...options,
      enabled: isAuthenticated && (options?.enabled !== false),
    },
  );
}
