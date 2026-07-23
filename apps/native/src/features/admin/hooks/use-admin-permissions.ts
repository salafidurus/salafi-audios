import { useAccountProfile } from "@sd/domain-account";

export function useAdminPermissions() {
  const { data: profile, isLoading } = useAccountProfile();

  const permissions = (profile?.permissions ?? []).map((p) => ({ permission: p }));
  const hasAnyPermission = permissions.length > 0;
  const hasPermission = (perm: string) => permissions.some((p) => p.permission === perm);

  return {
    permissions,
    hasAnyPermission,
    hasPermission,
    isLoading,
  };
}
