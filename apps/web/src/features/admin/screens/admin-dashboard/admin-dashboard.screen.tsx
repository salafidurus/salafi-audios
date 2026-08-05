"use client";

import type { AppActions, AppSubjectType } from "@sd/core-contracts";

import { useAbility } from "@sd/domain-account";

import { useAuth } from "@/core/auth/use-auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { EmptyState } from "@/shared/components/EmptyState";
import { PageHeader } from "@/shared/components/PageHeader";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { useResponsive } from "@/shared/hooks/use-responsive";

import styles from "./admin-dashboard.screen.module.css";

type AdminSection = {
  title: string;
  description: string;
  descriptionMobile: string;
  href: string;
  action: AppActions;
  subject: AppSubjectType;
};

export function AdminDashboardScreen() {
  const { t } = useTranslation();
  const { isMobile } = useResponsive();
  const { isAuthenticated } = useAuth();
  const { ability, isLoading } = useAbility({ isAuthenticated });

  const adminSections: AdminSection[] = [
    {
      title: t("navigation.admin.scholars", "Scholars"),
      description: t(
        "admin.dashboard.scholarsDesc",
        "Manage scholars, their profiles and visibility",
      ),
      descriptionMobile: t("admin.dashboard.scholarsDescMobile", "Manage scholars"),
      href: "/admin/scholars",
      action: "read",
      subject: "Scholar",
    },
    {
      title: t("navigation.admin.contents", "Contents"),
      description: t(
        "admin.dashboard.contentsDesc",
        "Manage topics, lectures, and content hierarchy",
      ),
      descriptionMobile: t("admin.dashboard.contentsDescMobile", "Manage content"),
      href: "/admin/contents",
      action: "read",
      subject: "Listing",
    },
    {
      title: t("navigation.admin.users", "Users"),
      description: t("admin.dashboard.usersDesc", "Manage admin users and access"),
      descriptionMobile: t("admin.dashboard.usersDescMobile", "Manage users"),
      href: "/admin/users",
      action: "read",
      subject: "User",
    },
  ];

  if (isLoading) {
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

  const visibleSections = adminSections.filter((s) => ability.can(s.action, s.subject));

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
              ? t("admin.dashboard.noAccess", "You don't have any admin access.")
              : t("admin.dashboard.noAccessMobile", "No admin access.")
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
