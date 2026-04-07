import type { AdminPermission } from "@sd/core-contracts";
import { useAdminPermissions } from "../../hooks/use-admin-permissions";

type Props = {
  requires: AdminPermission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function PermissionGate({ requires, children, fallback = null }: Props) {
  const { data } = useAdminPermissions();
  if (!data?.permissions.includes(requires)) return <>{fallback}</>;
  return <>{children}</>;
}
