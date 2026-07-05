import { httpClient, endpoints } from "@sd/core-contracts";
import type { AdminPermissionsListDto } from "@sd/core-contracts";

export async function fetchAdminPermissions(): Promise<AdminPermissionsListDto> {
  return httpClient<AdminPermissionsListDto>({
    url: endpoints.admin.permissions.me,
    method: "GET",
  });
}
