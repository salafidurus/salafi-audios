"use client";

import type { AdminPermission } from "@sd/core-contracts";
import { useAdminPermissions } from "../../hooks/use-admin-permissions";

type AdminSection = {
  title: string;
  description: string;
  href: string;
  permission: AdminPermission;
};

const ADMIN_SECTIONS: AdminSection[] = [
  {
    title: "Scholars",
    description: "Manage scholars, their profiles and visibility",
    href: "/admin/scholars",
    permission: "manage:scholars",
  },
  {
    title: "Topics",
    description: "Manage topic taxonomy and hierarchy",
    href: "/admin/topics",
    permission: "manage:topics",
  },
  {
    title: "Livestreams",
    description: "Manage live sessions and channel status",
    href: "/admin/livestreams",
    permission: "manage:livestreams",
  },
  {
    title: "Permissions",
    description: "Manage admin user permissions",
    href: "/admin/permissions",
    permission: "manage:admin",
  },
];

export function AdminDashboardDesktopWebScreen() {
  const { data, isFetching } = useAdminPermissions();

  if (isFetching) {
    return <div style={{ padding: 32 }}>Loading...</div>;
  }

  const permissions = data?.permissions ?? [];
  const visibleSections = ADMIN_SECTIONS.filter((s) => permissions.includes(s.permission));

  return (
    <div style={{ padding: 32, maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Admin Dashboard</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        {visibleSections.map((section) => (
          <a
            key={section.href}
            href={section.href}
            style={{
              display: "block",
              padding: 24,
              borderRadius: 12,
              border: "1px solid #e0e0e0",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>{section.title}</h2>
            <p style={{ fontSize: 14, color: "#666", margin: 0 }}>{section.description}</p>
          </a>
        ))}
      </div>
      {visibleSections.length === 0 && (
        <p style={{ color: "#999" }}>You don't have any admin permissions.</p>
      )}
    </div>
  );
}
