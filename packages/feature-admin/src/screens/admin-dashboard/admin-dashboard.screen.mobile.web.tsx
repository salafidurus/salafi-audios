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
    description: "Manage scholars",
    href: "/admin/scholars",
    permission: "manage:scholars",
  },
  {
    title: "Topics",
    description: "Manage topics",
    href: "/admin/topics",
    permission: "manage:topics",
  },
  {
    title: "Livestreams",
    description: "Manage livestreams",
    href: "/admin/livestreams",
    permission: "manage:livestreams",
  },
  {
    title: "Permissions",
    description: "Manage permissions",
    href: "/admin/permissions",
    permission: "manage:admin",
  },
];

export function AdminDashboardMobileWebScreen() {
  const { data, isFetching } = useAdminPermissions();

  if (isFetching) {
    return <div style={{ padding: 16 }}>Loading...</div>;
  }

  const permissions = data?.permissions ?? [];
  const visibleSections = ADMIN_SECTIONS.filter((s) => permissions.includes(s.permission));

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Admin</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {visibleSections.map((section) => (
          <a
            key={section.href}
            href={section.href}
            style={{
              display: "block",
              padding: 16,
              borderRadius: 8,
              border: "1px solid #e0e0e0",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>{section.title}</h2>
            <p style={{ fontSize: 13, color: "#666", margin: 0 }}>{section.description}</p>
          </a>
        ))}
      </div>
      {visibleSections.length === 0 && <p style={{ color: "#999" }}>No admin permissions.</p>}
    </div>
  );
}
