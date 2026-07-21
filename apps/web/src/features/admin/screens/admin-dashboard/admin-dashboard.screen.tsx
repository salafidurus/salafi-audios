"use client";

import type { AdminPermission } from "@sd/core-contracts";
import { useAdminPermissions } from "@sd/domain-permissions";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { EmptyState } from "@/shared/components/EmptyState";
import { useAuth } from "@/core/auth/use-auth";
import { useResponsive } from "@/shared/hooks/use-responsive";
import { useTranslation } from "@/core/i18n/use-translation";
import styles from "./admin-dashboard.screen.module.css";

type AdminSection = {
  title: string;
  description: string;
  descriptionMobile: string;
  href: string;
  permission: AdminPermission;
};

export function AdminDashboardScreen() {
  const { t } = useTranslation();
  const { isMobile } = useResponsive();
  const { isAuthenticated } = useAuth();
  const { data, isFetching } = useAdminPermissions({ isAuthenticated });

  const adminSections: AdminSection[] = [
    {
      title: t("navigation.admin.scholars", "Scholars"),
      description: t(
        "admin.dashboard.scholarsDesc",
        "Manage scholars, their profiles and visibility",
      ),
      descriptionMobile: t("admin.dashboard.scholarsDescMobile", "Manage scholars"),
      href: "/admin/scholars",
      permission: "SCHOLARS_VIEW" as const,
    },
    {
      title: t("navigation.admin.contents", "Contents"),
      description: t(
        "admin.dashboard.contentsDesc",
        "Manage topics, lectures, and content hierarchy",
      ),
      descriptionMobile: t("admin.dashboard.contentsDescMobile", "Manage content"),
      href: "/admin/contents",
      permission: "LISTINGS_VIEW" as const,
    },
    {
      title: t("navigation.admin.users", "Users"),
      description: t("admin.dashboard.usersDesc", "Manage admin users and permissions"),
      descriptionMobile: t("admin.dashboard.usersDescMobile", "Manage users"),
      href: "/admin/users",
      permission: "USERS_VIEW" as const,
    },
  ];

  if (isFetching) {
    return (
      <ScreenView>
        <PageHeader
          title={
            !isMobile
              ? t("admin.dashboard.title", "Admin Dashboard")
              : t("admin.dashboard.titleMobile", "Admin")
          }
        />
        <EmptyState variant="loading" message={t("admin.dashboard.loading", "Loading…")} />
      </ScreenView>
    );
  }

  const permissions = data?.permissions ?? [];
  const visibleSections = adminSections.filter((s) => permissions.includes(s.permission));

  return (
    <ScreenView>
      <PageHeader
        title={
          !isMobile
            ? t("admin.dashboard.title", "Admin Dashboard")
            : t("admin.dashboard.titleMobile", "Admin")
        }
      />
      {visibleSections.length === 0 ? (
        <EmptyState
          message={
            !isMobile
              ? t("admin.dashboard.noPermissions", "You don't have any admin permissions.")
              : t("admin.dashboard.noPermissionsMobile", "No admin permissions.")
          }
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
