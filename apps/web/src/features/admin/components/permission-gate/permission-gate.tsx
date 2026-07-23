"use client";

import type { AdminPermission } from "@sd/core-contracts";
import { useAdminPermissions } from "@sd/domain-account";
import { useAuth } from "@/core/auth/use-auth";

type Props = {
  requires: AdminPermission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function PermissionGate({ requires, children, fallback = null }: Props) {
  const { isAuthenticated } = useAuth();
  const { data } = useAdminPermissions({ isAuthenticated });
  if (!data?.permissions.includes(requires)) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}
