"use client";

import type { AdminPermission } from "@sd/core-contracts";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { useAdminPermissions } from "@/features/admin/hooks/use-admin-permissions";
import styles from "./admin-dashboard.screen.desktop.module.css";

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
    title: "Lectures",
    description: "Manage audio recordings, meta data, and ordering",
    href: "/admin/lectures",
    permission: "manage:content",
  },
  {
    title: "Livestreams",
    description: "Manage live sessions and channel status",
    href: "/admin/live",
    permission: "manage:livestreams",
  },
  {
    title: "Permissions",
    description: "Manage admin user permissions",
    href: "/admin/permissions",
    permission: "manage:admin",
  },
];

export function AdminDashboardDesktopScreen() {
  const { data, isFetching } = useAdminPermissions();

  if (isFetching) {
    return (
      <ScreenView>
        <div className={styles.loading}>Loading…</div>
      </ScreenView>
    );
  }

  const permissions = data?.permissions ?? [];
  const visibleSections = ADMIN_SECTIONS.filter((s) => permissions.includes(s.permission));

  return (
    <ScreenView>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Admin Dashboard</h1>
        <div className={styles.grid}>
          {visibleSections.map((section) => (
            <a key={section.href} href={section.href} className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>{section.title}</h2>
              <p className={styles.sectionDescription}>{section.description}</p>
            </a>
          ))}
        </div>
        {visibleSections.length === 0 && (
          <p className={styles.empty}>You don&apos;t have any admin permissions.</p>
        )}
      </div>
    </ScreenView>
  );
}
