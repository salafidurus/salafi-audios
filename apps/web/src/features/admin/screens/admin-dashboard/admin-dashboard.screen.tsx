"use client";

import type { AdminPermission } from "@sd/core-contracts";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { EmptyState } from "@/shared/components/EmptyState";
import { useAdminPermissions } from "@/features/admin/hooks/use-admin-permissions";
import { useIsDesktop } from "@/shared/hooks/use-responsive";
import styles from "./admin-dashboard.screen.module.css";

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

export function AdminDashboardScreen() {
  const isDesktop = useIsDesktop();
  const { data, isFetching } = useAdminPermissions();

  if (isFetching) {
    return (
      <ScreenView>
        <PageHeader title={isDesktop ? "Admin Dashboard" : "Admin"} />
        <EmptyState variant="loading" message="Loading…" />
      </ScreenView>
    );
  }

  const permissions = data?.permissions ?? [];
  const visibleSections = ADMIN_SECTIONS.filter((s) => permissions.includes(s.permission));

  return (
    <ScreenView>
      <PageHeader title={isDesktop ? "Admin Dashboard" : "Admin"} />
      {visibleSections.length === 0 ? (
        <EmptyState
          message={isDesktop ? "You don't have any admin permissions." : "No admin permissions."}
        />
      ) : (
        <div className={styles.sectionList}>
          {visibleSections.map((section) => (
            <a key={section.href} href={section.href} className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>{section.title}</h2>
              <p className={styles.sectionDescription}>{section.description}</p>
            </a>
          ))}
        </div>
      )}
    </ScreenView>
  );
}
