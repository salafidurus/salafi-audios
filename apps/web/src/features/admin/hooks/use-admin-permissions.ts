import { useApiQuery, queryKeys, httpClient, endpoints } from "@sd/core-contracts";
import type { AdminPermission } from "@sd/core-contracts";

type MyPermissionsDto = { permissions: AdminPermission[] };

export function useAdminPermissions() {
  return useApiQuery<MyPermissionsDto>(queryKeys.admin.permissions.me(), () =>
    httpClient<MyPermissionsDto>({
      url: endpoints.admin.permissions.me,
      method: "GET",
    }),
  );
}
