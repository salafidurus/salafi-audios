"use client";

import { queryKeys, useApiQuery, type AppActions, type AppSubjectType } from "@sd/core-contracts";
import { hasAnyAdminAccess, useAbility } from "@sd/domain-account";

import { useAuth } from "@/core/auth/use-auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { fetchAdminDashboard } from "@/features/admin/api/admin-dashboard.api";
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
  subjects: AppSubjectType[];
};

function canOpenAdminSection(
  ability: ReturnType<typeof useAbility>["ability"],
  section: AdminSection,
) {
  const adminActions: AppActions[] = ["read", "write", "publish", "delete", "create", "update"];
  return section.subjects.some((subject) =>
    subject === "User" || subject === "UserAccess"
      ? ability.can("read", "User") || ability.can("manage", "UserAccess")
      : adminActions.some((action) => ability.can(action, subject)),
  );
}

export function AdminDashboardScreen() {
  const { t } = useTranslation();
  const { isMobile } = useResponsive();
  const { isAuthenticated } = useAuth();
  const { ability, isLoading: isAccessLoading } = useAbility({ isAuthenticated });
  const dashboardQuery = useApiQuery(queryKeys.admin.dashboard(), fetchAdminDashboard, {
    enabled: isAuthenticated && !isAccessLoading && hasAnyAdminAccess(ability),
  });

  const adminSections: AdminSection[] = [
    {
      title: t("navigation.admin.scholars", "Scholars"),
      description: t(
        "admin.dashboard.scholarsDesc",
        "Manage scholars, their profiles and visibility",
      ),
      descriptionMobile: t("admin.dashboard.scholarsDescMobile", "Manage scholars"),
      href: "/admin/scholars",
      subjects: ["Scholar"],
    },
    {
      title: t("navigation.admin.contents", "Contents"),
      description: t(
        "admin.dashboard.contentsDesc",
        "Manage topics, lectures, and content hierarchy",
      ),
      descriptionMobile: t("admin.dashboard.contentsDescMobile", "Manage content"),
      href: "/admin/contents",
      subjects: ["Listing", "Topic"],
    },
    {
      title: t("navigation.admin.users", "Users"),
      description: t("admin.dashboard.usersDesc", "Manage admin users and access"),
      descriptionMobile: t("admin.dashboard.usersDescMobile", "Manage users"),
      href: "/admin/users",
      subjects: ["User", "UserAccess"],
    },
  ];

  if (isAccessLoading || dashboardQuery.isLoading) {
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

  if (dashboardQuery.isError) {
    return (
      <ScreenView>
        <PageHeader
          title={
            !isMobile
              ? t("admin.dashboard.title", "Admin Dashboard")
              : t("admin.dashboard.titleMobile", "Admin")
          }
        />
        <EmptyState
          variant="error"
          message={t(
            "admin.dashboard.error",
            "The dashboard is unavailable right now. Try again later.",
          )}
        />
      </ScreenView>
    );
  }

  const visibleSections = adminSections.filter((section) => canOpenAdminSection(ability, section));

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
      ) : dashboardQuery.data ? (
        <>
          <div className={styles.metricsGrid}>
            {visibleSections.map((section) => {
              const metric = section.subjects.includes("Scholar")
                ? dashboardQuery.data.metrics.scholars
                : section.subjects.includes("Listing")
                  ? dashboardQuery.data.metrics.listings
                  : section.subjects.includes("Topic")
                    ? dashboardQuery.data.metrics.topics
                    : dashboardQuery.data.metrics.users;
              return (
                <a key={section.href} href={section.href} className={styles.sectionCard}>
                  <span className={styles.metric}>{metric ?? "—"}</span>
                  <h2 className={styles.sectionTitle}>{section.title}</h2>
                  <p className={styles.sectionDescription}>
                    {!isMobile ? section.description : section.descriptionMobile}
                  </p>
                </a>
              );
            })}
          </div>

          <div className={styles.columns}>
            <section className={styles.panel} aria-labelledby="admin-pending-heading">
              <h2 id="admin-pending-heading" className={styles.panelTitle}>
                {t("admin.dashboard.pendingTitle", "Pending work")}
              </h2>
              {dashboardQuery.data.pendingWork.length === 0 ? (
                <p className={styles.muted}>
                  {t("admin.dashboard.pendingEmpty", "Nothing is waiting for review.")}
                </p>
              ) : (
                <ul className={styles.activityList}>
                  {dashboardQuery.data.pendingWork.map((item) => (
                    <li key={item.id}>
                      <a href={item.href} className={styles.activityLink}>
                        <span>{item.title}</span>
                        <small>
                          {item.scholarName} · {item.status}
                        </small>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <section className={styles.panel} aria-labelledby="admin-activity-heading">
              <h2 id="admin-activity-heading" className={styles.panelTitle}>
                {t("admin.dashboard.activityTitle", "Recent activity")}
              </h2>
              {dashboardQuery.data.activity.length === 0 ? (
                <p className={styles.muted}>
                  {t("admin.dashboard.activityEmpty", "No recent activity is available.")}
                </p>
              ) : (
                <ul className={styles.activityList}>
                  {dashboardQuery.data.activity.map((item) => (
                    <li key={`${item.type}-${item.id}`}>
                      <a href={item.href} className={styles.activityLink}>
                        <span>{item.title}</span>
                        <small>
                          {item.subtitle ?? item.type}
                          {item.status ? ` · ${item.status}` : ""}
                        </small>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      ) : (
        <EmptyState message={t("admin.dashboard.empty", "No dashboard data is available.")} />
      )}
    </ScreenView>
  );
}
