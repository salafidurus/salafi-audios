import { useAdminPermissions as useSharedAdminPermissions } from "@sd/domain-account";

const ADMIN_ROLES = ["admin", "superadmin"];

export function useAdminPermissions() {
  const { data, isLoading } = useSharedAdminPermissions();

  const permissions = (data?.permissions ?? []).map((p) => ({ permission: p }));
  const hasAdminRole = (data?.roles ?? []).some((role) => ADMIN_ROLES.includes(role));
  const hasAnyPermission = permissions.length > 0 || hasAdminRole;
  const hasPermission = (perm: string) =>
    hasAdminRole || permissions.some((p) => p.permission === perm);

  return {
    permissions,
    hasAnyPermission,
    hasPermission,
    isLoading,
  };
}
