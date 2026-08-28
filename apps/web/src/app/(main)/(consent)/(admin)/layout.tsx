/** Documents this module's responsibility and public boundary. */
"use client";

import { hasAnyAdminAccess, useAbility } from "@sd/domain-account";

import { useAuth } from "@/core/auth/use-auth";
import { AdminAccessState } from "@/features/admin";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { ability, isLoading } = useAbility({ isAuthenticated });

  if (isLoading) {
    return <AdminAccessState status="loading" />;
  }

  if (!hasAnyAdminAccess(ability)) {
    return <AdminAccessState status="denied" />;
  }

  return <>{children}</>;
}
