"use client";

import type { AdminPermission } from "@sd/core-contracts";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { useAdminPermissions } from "@/features/admin/hooks/use-admin-permissions";
import styles from "./admin-dashboard.screen.mobile.module.css";

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
    title: "Lectures",
    description: "Manage lectures",
    href: "/admin/lectures",
    permission: "manage:content",
  },
  {
    title: "Livestreams",
    description: "Manage livestreams",
    href: "/admin/live",
    permission: "manage:livestreams",
  },
  {
    title: "Permissions",
    description: "Manage permissions",
    href: "/admin/permissions",
    permission: "manage:admin",
  },
];

export function AdminDashboardMobileScreen() {
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
      <div>
        <h1 className={styles.pageTitle}>Admin</h1>
        <div className={styles.sectionList}>
          {visibleSections.map((section) => (
            <a key={section.href} href={section.href} className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>{section.title}</h2>
              <p className={styles.sectionDescription}>{section.description}</p>
            </a>
          ))}
        </div>
        {visibleSections.length === 0 && <p className={styles.empty}>No admin permissions.</p>}
      </div>
    </ScreenView>
  );
}
