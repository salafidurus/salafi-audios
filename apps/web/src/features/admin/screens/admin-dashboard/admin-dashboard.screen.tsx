/** Documents this module's responsibility and public boundary. */
"use client";

import { queryKeys, useApiQuery, type AppActions, type AppSubjectType } from "@sd/core-contracts";
import { hasAnyAdminAccess, useAbility } from "@sd/domain-account";
import { ArrowUpRight, BookOpen, FileText, Users, type LucideIcon } from "lucide-react";

import { useAuth } from "@/core/auth/use-auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { fetchAdminDashboard } from "@/features/admin/api/admin-dashboard.api";
import { EmptyState } from "@/shared/components/EmptyState";
import { PageHeader } from "@/shared/components/PageHeader";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { useResponsive } from "@/shared/hooks/use-responsive";

import styles from "./admin-dashboard.screen.module.css";

type AdminSection = {
  title: string;
  description: string;
  descriptionMobile: string;
  href: string;
  subjects: AppSubjectType[];
  icon: LucideIcon;
};

type DashboardMetrics = {
  scholars?: number;
  listings?: number;
  topics?: number;
  users?: number;
};

function getDashboardMetric(section: AdminSection, metrics: DashboardMetrics) {
  if (section.subjects.includes("Scholar")) return metrics.scholars;
  if (section.subjects.includes("Listing")) return metrics.listings ?? metrics.topics;
  if (section.subjects.includes("Topic")) return metrics.topics;
  return metrics.users;
}

function DashboardSectionCard({
  section,
  metric,
  isMobile,
}: {
  section: AdminSection;
  metric: number | undefined;
  isMobile: boolean;
}) {
  const SectionIcon = section.icon;

  return (
    <a href={section.href} className={styles.sectionCard}>
      <Card size="sm">
        <CardHeader>
          <CardTitle>{section.title}</CardTitle>
          <CardDescription>
            {isMobile ? section.descriptionMobile : section.description}
          </CardDescription>
          <CardAction>
            <span className={styles.cardIcon} aria-hidden="true">
              <SectionIcon />
            </span>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className={styles.metricRow}>
            <span className={styles.metric}>{metric ?? "—"}</span>
            <span className={styles.cardLink} aria-hidden="true">
              <ArrowUpRight />
            </span>
          </div>
        </CardContent>
      </Card>
    </a>
  );
}

function DashboardContent({
  sections,
  metrics,
  isMobile,
  noAccessMessage,
  emptyMessage,
}: {
  sections: AdminSection[];
  metrics: DashboardMetrics | undefined;
  isMobile: boolean;
  noAccessMessage: string;
  emptyMessage: string;
}) {
  if (sections.length === 0) return <EmptyState message={noAccessMessage} />;
  if (!metrics) return <EmptyState message={emptyMessage} />;

  return (
    <div className={styles.metricsGrid}>
      {sections.map((section) => (
        <DashboardSectionCard
          key={section.href}
          section={section}
          metric={getDashboardMetric(section, metrics)}
          isMobile={isMobile}
        />
      ))}
    </div>
  );
}

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

function getDashboardTitle(isMobile: boolean, t: ReturnType<typeof useTranslation>["t"]): string {
  return isMobile
    ? t("admin.dashboard.titleMobile", "Admin")
    : t("admin.dashboard.title", "Admin Dashboard");
}

function canLoadDashboard(
  isAuthenticated: boolean,
  isAccessLoading: boolean,
  ability: ReturnType<typeof useAbility>["ability"],
) {
  return isAuthenticated && !isAccessLoading && hasAnyAdminAccess(ability);
}

/** Renders capability-filtered shortcuts and dashboard statistics for administrators. */
export function AdminDashboardScreen() {
  const { t } = useTranslation();
  const { isMobile } = useResponsive();
  const { isAuthenticated } = useAuth();
  const { ability, isLoading: isAccessLoading } = useAbility({ isAuthenticated });
  const dashboardQuery = useApiQuery(queryKeys.admin.dashboard(), fetchAdminDashboard, {
    enabled: canLoadDashboard(isAuthenticated, isAccessLoading, ability),
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
      icon: BookOpen,
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
      icon: FileText,
    },
    {
      title: t("navigation.admin.users", "Users"),
      description: t("admin.dashboard.usersDesc", "Manage admin users and access"),
      descriptionMobile: t("admin.dashboard.usersDescMobile", "Manage users"),
      href: "/admin/users",
      subjects: ["User", "UserAccess"],
      icon: Users,
    },
  ];

  if (isAccessLoading || dashboardQuery.isLoading) {
    return (
      <ScreenView>
        <PageHeader title={getDashboardTitle(isMobile, t)} />
        <EmptyState variant="loading" message={t("admin.dashboard.loading", "Loading…")} />
      </ScreenView>
    );
  }

  if (dashboardQuery.isError) {
    return (
      <ScreenView>
        <PageHeader title={getDashboardTitle(isMobile, t)} />
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
        title={getDashboardTitle(isMobile, t)}
        subtitle={t(
          "admin.dashboard.subtitle",
          "A focused view of the work and resources available to your role.",
        )}
      />
      <DashboardContent
        sections={visibleSections}
        metrics={dashboardQuery.data?.metrics}
        isMobile={isMobile}
        noAccessMessage={
          isMobile
            ? t("admin.dashboard.noAccessMobile", "No admin access.")
            : t("admin.dashboard.noAccess", "You don't have any admin access.")
        }
        emptyMessage={t("admin.dashboard.empty", "No dashboard data is available.")}
      />
    </ScreenView>
  );
}
