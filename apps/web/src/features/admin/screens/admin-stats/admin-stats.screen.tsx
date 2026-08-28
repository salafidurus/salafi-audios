"use client";

import type { AdminListingListItemDto } from "@sd/core-contracts";

import { useAbility, useInfiniteAdminUsers } from "@sd/domain-account";
import { useInfiniteAdminListings, useInfiniteAdminScholars } from "@sd/domain-content";
import { BookOpen, GraduationCap, Users } from "lucide-react";
import { useMemo, useState } from "react";

import { useAuth } from "@/core/auth/use-auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { AdminStatsCard } from "@/features/admin/components/AdminStatsCard";
import {
  AdaptiveDataView,
  type AdaptiveDataViewColumn,
} from "@/shared/components/AdaptiveDataView";
import { EmptyState } from "@/shared/components/EmptyState";
import { PageHeader } from "@/shared/components/PageHeader";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { Field, FieldLabel } from "@/shared/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

import styles from "./admin-stats.screen.module.css";

type SortKey = "title" | "scholarName" | "format" | "status" | "createdAt";

function flattenPages<T>(data: { pages?: Array<{ items: T[] }> } | undefined): T[] {
  return data?.pages?.flatMap((page) => page.items) ?? [];
}

function hasAccess(isLoading: boolean, check: () => boolean): boolean {
  return !isLoading && check();
}

type AuthorizedQuery = { isLoading?: boolean; isError?: boolean };

function selectAuthorized(
  entries: Array<{ enabled: boolean; query: AuthorizedQuery }>,
): AuthorizedQuery[] {
  return entries.reduce<AuthorizedQuery[]>((selected, entry) => {
    if (entry.enabled) selected.push(entry.query);
    return selected;
  }, []);
}

type StatsCardsProps = {
  canReadScholars: boolean;
  canReadListings: boolean;
  canManageUsers: boolean;
  scholarsCount: number;
  listingsCount: number;
  usersCount: number;
  t: ReturnType<typeof useTranslation>["t"];
};

function StatsCards({
  canReadScholars,
  canReadListings,
  canManageUsers,
  scholarsCount,
  listingsCount,
  usersCount,
  t,
}: StatsCardsProps) {
  return (
    <div className={styles.cards} aria-label={t("admin.stats.summary", "Available data summary")}>
      {canReadScholars && (
        <AdminStatsCard
          icon={<GraduationCap />}
          label={t("admin.stats.scholars", "Scholars")}
          value={scholarsCount}
        />
      )}
      {canReadListings && (
        <AdminStatsCard
          icon={<BookOpen />}
          label={t("admin.stats.listings", "Listings")}
          value={listingsCount}
        />
      )}
      {canManageUsers && (
        <AdminStatsCard
          icon={<Users />}
          label={t("admin.stats.users", "Users")}
          value={usersCount}
        />
      )}
    </div>
  );
}

type AdminStatsContentProps = {
  access: {
    listings: boolean;
    scholars: boolean;
    users: boolean;
  };
  counts: {
    scholars: number;
    listings: number;
    users: number;
  };
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  table: {
    columns: AdaptiveDataViewColumn<AdminListingListItemDto>[];
    sortedListings: AdminListingListItemDto[];
    listings: AdminListingListItemDto[];
    isError: boolean;
    sort: { key: SortKey; direction: "ascending" | "descending" };
    handleSort: (key: string) => void;
  };
  t: ReturnType<typeof useTranslation>["t"];
};

function AdminStatsContent({
  access,
  counts,
  statusFilter,
  setStatusFilter,
  table,
  t,
}: AdminStatsContentProps) {
  return (
    <div className={styles.content}>
      <StatsCards
        canReadScholars={access.scholars}
        canReadListings={access.listings}
        canManageUsers={access.users}
        scholarsCount={counts.scholars}
        listingsCount={counts.listings}
        usersCount={counts.users}
        t={t}
      />

      {access.listings && (
        <section className={styles.section} aria-labelledby="admin-stats-content-heading">
          <div className={styles.sectionHeader}>
            <div>
              <h2 id="admin-stats-content-heading" className={styles.sectionTitle}>
                {t("admin.stats.contentHeading", "Accessible content")}
              </h2>
              <p className={styles.sectionDescription}>
                {t(
                  "admin.stats.contentDescription",
                  "Showing content returned for your current access.",
                )}
              </p>
            </div>
            <Field className={styles.filter}>
              <FieldLabel htmlFor="stats-status-filter">
                {t("admin.stats.filterStatus", "Filter status")}
              </FieldLabel>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="stats-status-filter">
                  <SelectValue placeholder={t("admin.stats.allStatuses", "All statuses")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">
                      {t("admin.stats.allStatuses", "All statuses")}
                    </SelectItem>
                    <SelectItem value="draft">{t("status.draft", "Draft")}</SelectItem>
                    <SelectItem value="published">{t("status.published", "Published")}</SelectItem>
                    <SelectItem value="archived">{t("status.archived", "Archived")}</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <AdaptiveDataView
            ariaLabel={t("admin.stats.contentTable", "Accessible content data")}
            columns={table.columns}
            data={table.sortedListings}
            getRowKey={(item) => item.id}
            onSort={table.handleSort}
            sort={table.sort}
            state={table.isError && table.listings.length === 0 ? "error" : undefined}
            errorMessage={t("admin.stats.error", "Unable to load available statistics.")}
            emptyMessage={t("admin.stats.empty", "No accessible content matches this filter.")}
          />
        </section>
      )}
      {table.isError && table.listings.length > 0 && (
        <p className={styles.warning} role="status">
          {t("admin.stats.partialError", "Some available data could not be refreshed.")}
        </p>
      )}
    </div>
  );
}

export function AdminStatsScreen() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { ability, isLoading: isAccessLoading } = useAbility({ isAuthenticated });
  const canReadListings = hasAccess(isAccessLoading, () => ability.can("read", "Listing"));
  const canReadScholars = hasAccess(isAccessLoading, () => ability.can("read", "Scholar"));
  const canManageUsers = hasAccess(isAccessLoading, () => ability.can("manage", "UserAccess"));

  const listingsQuery = useInfiniteAdminListings({ enabled: canReadListings });
  const scholarsQuery = useInfiniteAdminScholars({ enabled: canReadScholars });
  const usersQuery = useInfiniteAdminUsers({ enabled: canManageUsers });

  const listings = flattenPages<AdminListingListItemDto>(listingsQuery.data);
  const scholars = flattenPages(scholarsQuery.data);
  const users = flattenPages(usersQuery.data);
  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium" }),
    [i18n.language],
  );
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState<{ key: SortKey; direction: "ascending" | "descending" }>({
    key: "createdAt",
    direction: "descending",
  });

  const sortedListings = useMemo(() => {
    const filtered =
      statusFilter === "all" ? listings : listings.filter((item) => item.status === statusFilter);
    return [...filtered].sort((left, right) => {
      const leftValue = String(left[sort.key]);
      const rightValue = String(right[sort.key]);
      const comparison = leftValue.localeCompare(rightValue, i18n.language, {
        numeric: true,
        sensitivity: "base",
      });
      return sort.direction === "ascending" ? comparison : -comparison;
    });
  }, [i18n.language, listings, sort, statusFilter]);

  const columns: AdaptiveDataViewColumn<AdminListingListItemDto>[] = [
    {
      key: "title",
      header: t("admin.stats.content", "Content"),
      priority: "primary",
      sortable: true,
    },
    {
      key: "scholarName",
      header: t("admin.stats.scholar", "Scholar"),
      priority: "secondary",
      sortable: true,
    },
    {
      key: "format",
      header: t("admin.stats.format", "Format"),
      priority: "secondary",
      sortable: true,
    },
    {
      key: "status",
      header: t("admin.stats.status", "Status"),
      priority: "primary",
      sortable: true,
    },
    {
      key: "createdAt",
      header: t("admin.stats.created", "Created"),
      priority: "secondary",
      sortable: true,
      render: (item) => dateFormatter.format(new Date(item.createdAt)),
    },
  ];

  const authorizedQueries = selectAuthorized([
    { enabled: canReadListings, query: listingsQuery },
    { enabled: canReadScholars, query: scholarsQuery },
    { enabled: canManageUsers, query: usersQuery },
  ]);
  const isLoading = isAccessLoading || authorizedQueries.some((query) => query?.isLoading);
  const isError = authorizedQueries.some((query) => query?.isError);
  const hasAuthorizedData = [canReadListings, canReadScholars, canManageUsers].some(Boolean);

  const handleSort = (key: string) => {
    // SAFETY: AdaptiveDataView receives columns whose keys are restricted to SortKey.
    const nextKey = key as SortKey;
    setSort((current) => ({
      key: nextKey,
      direction:
        current.key === nextKey && current.direction === "ascending" ? "descending" : "ascending",
    }));
  };

  return (
    <ScreenView>
      <PageHeader title={t("admin.stats.title", "Admin Stats")} />
      <p className={styles.sectionDescription}>
        {t("admin.stats.desc", "Operational data available to your account.")}
      </p>

      {isLoading ? (
        <AdaptiveDataView
          ariaLabel={t("admin.stats.loadingLabel", "Loading admin statistics")}
          columns={columns}
          data={[]}
          getRowKey={(item) => item.id}
          state="loading"
          loadingMessage={t("admin.stats.loading", "Loading available statistics…")}
        />
      ) : !hasAuthorizedData ? (
        <EmptyState
          variant="denied"
          message={t("admin.stats.unavailable", "No authorized statistics are available.")}
        />
      ) : (
        <AdminStatsContent
          access={{ listings: canReadListings, scholars: canReadScholars, users: canManageUsers }}
          counts={{ scholars: scholars.length, listings: listings.length, users: users.length }}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          table={{
            columns,
            sortedListings,
            listings,
            isError,
            sort,
            handleSort,
          }}
          t={t}
        />
      )}
    </ScreenView>
  );
}
