import { useApiQuery, httpClient, endpoints } from "@sd/core-contracts";
import type { AdminPermissionsListDto } from "@sd/core-contracts";

export function useAdminPermissions() {
  const query = useApiQuery<AdminPermissionsListDto>(
    ["admin", "permissions", "me"],
    () =>
      httpClient<AdminPermissionsListDto>({
        url: endpoints.admin.permissions.me,
        method: "GET",
      }),
    { staleTime: Infinity }, // cache for session lifetime
  );

  const permissions = query.data?.permissions ?? [];
  const hasAnyPermission = permissions.length > 0;
  const hasPermission = (perm: string) => permissions.some((p) => p.permission === perm);

  return {
    permissions,
    hasAnyPermission,
    hasPermission,
    isLoading: query.isLoading,
  };
}
