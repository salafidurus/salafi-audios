"use client";

import type { AdminPermission } from "@sd/core-contracts";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { EmptyState } from "@/shared/components/EmptyState";
import { useAdminPermissions } from "@/features/admin/hooks/use-admin-permissions";
import { useResponsive } from "@/shared/hooks/use-responsive";
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
    permission: "SCHOLARS_VIEW" as const,
  },
  {
    title: "Contents",
    description: "Manage topics, lectures, and content hierarchy",
    descriptionMobile: "Manage content",
    href: "/admin/contents",
    permission: "LISTINGS_VIEW" as const,
  },
  {
    title: "Users",
    description: "Manage admin users and permissions",
    descriptionMobile: "Manage users",
    href: "/admin/users",
    permission: "USERS_VIEW" as const,
  },
  {
    title: "Livestreams",
    description: "Manage live sessions and channel status",
    descriptionMobile: "Manage livestreams",
    href: "/admin/live",
    permission: "LIVE_VIEW" as const,
  },
];

export function AdminDashboardScreen() {
  const { isMobile } = useResponsive();
  const { data, isFetching } = useAdminPermissions();

  if (isFetching) {
    return (
      <ScreenView>
        <PageHeader title={!isMobile ? "Admin Dashboard" : "Admin"} />
        <EmptyState variant="loading" message="Loading…" />
      </ScreenView>
    );
  }

  const permissions = data?.permissions ?? [];
  const visibleSections = ADMIN_SECTIONS.filter((s) => permissions.includes(s.permission));

  return (
    <ScreenView>
      <PageHeader title={!isMobile ? "Admin Dashboard" : "Admin"} />
      {visibleSections.length === 0 ? (
        <EmptyState
          message={!isMobile ? "You don't have any admin permissions." : "No admin permissions."}
        />
      ) : (
        <div className={styles.grid}>
          {visibleSections.map((section) => (
            <a key={section.href} href={section.href} className={styles.sectionCard}>
              <h2 className={styles.sectionTitle}>{section.title}</h2>
              <p className={styles.sectionDescription}>
                {!isMobile ? section.description : section.descriptionMobile}
              </p>
            </a>
          ))}
        </div>
      )}
    </ScreenView>
  );
}
