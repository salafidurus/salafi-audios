"use client";

import { hasAnyAdminAccess, useAbility } from "@sd/domain-account";

import { useAuth } from "@/core/auth/use-auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { ability, isLoading } = useAbility({ isAuthenticated });

  if (isLoading) {
    return (
      <div style={{ padding: 32, textAlign: "center" }}>
        <p>Checking permissions…</p>
      </div>
    );
  }

  if (!hasAnyAdminAccess(ability)) {
    return (
      <div style={{ padding: 32, textAlign: "center" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Access Denied</h1>
        <p style={{ color: "#666" }}>You do not have admin permissions.</p>
      </div>
    );
  }

  return <>{children}</>;
}
