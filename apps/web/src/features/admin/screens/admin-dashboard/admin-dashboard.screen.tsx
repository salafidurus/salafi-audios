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
  descriptionMobile: string;
  href: string;
  permission: AdminPermission;
};

const ADMIN_SECTIONS: AdminSection[] = [
  {
    title: "Scholars",
    description: "Manage scholars, their profiles and visibility",
    descriptionMobile: "Manage scholars",
    href: "/admin/scholars",
    permission: "manage:scholars",
  },
  {
    title: "Topics",
    description: "Manage topic taxonomy and hierarchy",
    descriptionMobile: "Manage topics",
    href: "/admin/topics",
    permission: "manage:topics",
  },
  {
    title: "Lectures",
    description: "Manage audio recordings, meta data, and ordering",
    descriptionMobile: "Manage lectures",
    href: "/admin/lectures",
    permission: "manage:content",
  },
  {
    title: "Livestreams",
    description: "Manage live sessions and channel status",
    descriptionMobile: "Manage livestreams",
    href: "/admin/live",
    permission: "manage:livestreams",
  },
  {
    title: "Permissions",
    description: "Manage admin user permissions",
    descriptionMobile: "Manage permissions",
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
        <EmptyState variant="loading" message="Loading..." />
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
        <div className={styles.grid}>
          {visibleSections.map((section) => (
            <a key={section.href} href={section.href} className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>{section.title}</h2>
              <p className={styles.sectionDescription}>
                {isDesktop ? section.description : section.descriptionMobile}
              </p>
            </a>
          ))}
        </div>
      )}
    </ScreenView>
  );
}
