"use client";

import { useAdminPermissions } from "@sd/feature-admin";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data, isFetching } = useAdminPermissions();

  if (isFetching) {
    return (
      <div style={{ padding: 32, textAlign: "center" }}>
        <p>Checking permissions...</p>
      </div>
    );
  }

  const permissions = data?.permissions ?? [];
  if (permissions.length === 0) {
    return (
      <div style={{ padding: 32, textAlign: "center" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Access Denied</h1>
        <p style={{ color: "#666" }}>You do not have admin permissions.</p>
      </div>
    );
  }

  return <>{children}</>;
}
