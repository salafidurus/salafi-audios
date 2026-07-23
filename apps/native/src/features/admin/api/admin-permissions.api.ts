import { httpClient, endpoints } from "@sd/core-contracts";
import type { AdminPermissionsListDto } from "@sd/core-contracts";

export async function fetchAdminPermissions(): Promise<AdminPermissionsListDto> {
  const profile = await httpClient<{ permissions: string[] }>({
    url: endpoints.account.profile,
    method: "GET",
  });
  return {
    permissions: (profile.permissions || []).map((p) => ({
      userId: "",
      permission: p as any,
      grantedAt: new Date().toISOString(),
      grantedById: null,
    })),
  };
}
