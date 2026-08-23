"use client";

import { queryKeys, type AdminUserListItemDto } from "@sd/core-contracts";
import { useInfiniteAdminUsers } from "@sd/domain-account";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useCallback, type ReactNode, useMemo } from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import { AccessDialog } from "@/features/admin/components/Content/Users/AccessDialog";
import { UserItem } from "@/features/admin/components/Content/Users/user-item";
import { InfiniteScrollList } from "@/shared/components/InfiniteScrollList";
import { PageHeader } from "@/shared/components/PageHeader";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { ScrollToTopButton } from "@/shared/components/ScrollToTopButton";
import { Search } from "@/shared/components/Search";
import { StickyHeaderLayout } from "@/shared/components/StickyHeaderLayout";
import { useDebouncedSearch } from "@/shared/hooks";
import { useIsDesktop } from "@/shared/hooks/use-responsive";

import styles from "./admin-users.screen.module.css";

export function AdminUsersScreen(): ReactNode {
  const queryClient = useQueryClient();
  const isDesktop = useIsDesktop();
  const { t } = useTranslation();
  const { query: searchQuery, setQuery: setSearchQuery, debouncedQuery } = useDebouncedSearch();
  const [role, setRole] = useState("");
  const [status, setStatus] = useState<"" | "active" | "none">("");
  const [accessUser, setAccessUser] = useState<{ id: string; name: string } | null>(null);

  const roleChips = useMemo(
    () => [
      { id: "listener", label: t("role.listener", "Listener") },
      { id: "scholar", label: t("role.scholar", "Scholar") },
      { id: "translator", label: t("role.translator", "Translator") },
      { id: "editor", label: t("role.editor", "Editor") },
      { id: "admin", label: t("role.admin", "Admin") },
      { id: "superadmin", label: t("role.superadmin", "Super Admin") },
    ],
    [t],
  );

  const statusChips = useMemo(
    () => [
      { id: "active", label: t("admin.users.status.activeFilter", "Has admin access") },
      { id: "none", label: t("admin.users.status.noneFilter", "No admin access") },
    ],
    [t],
  );

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteAdminUsers(
    {
      search: debouncedQuery,
      role,
    },
  );

  const allItems: AdminUserListItemDto[] = data?.pages.flatMap((page) => page.items) ?? [];
  const activeCount = allItems.filter((user) => user.roles.length > 0).length;
  const visibleItems = allItems.filter((user) => {
    if (status === "active") return user.roles.length > 0;
    if (status === "none") return user.roles.length === 0;
    return true;
  });

  const handleAccessChange = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all() });
  }, [queryClient]);

  return (
    <ScreenView contentStyle={{ flex: 1 }}>
      <div className={styles.content}>
        <StickyHeaderLayout>
          <StickyHeaderLayout.Header>
            <PageHeader
              title={
                isDesktop
                  ? t("admin.users.titleMobile", "Users")
                  : t("admin.users.title", "Manage Users")
              }
            />

            <div className={styles.searchRow}>
              <Search.Bar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder={t("admin.users.searchPlaceholder", "Search users by name or email...")}
              />
            </div>

            <Search.Filter
              chips={roleChips}
              selected={role ? [role] : []}
              onChipChange={(chipId: string) => {
                setRole(role === chipId ? "" : chipId);
              }}
            />

            <div className={styles.statusFilter}>
              <span className={styles.filterLabel}>
                {t("admin.users.statusLabel", "Access status")}
              </span>
              <Search.Filter
                chips={statusChips}
                selected={status ? [status] : []}
                onChipChange={(chipId: string) => {
                  // SAFETY: status chips are created locally with only "active" and "none" IDs.
                  setStatus(status === chipId ? "" : (chipId as "active" | "none"));
                }}
              />
            </div>

            <p className={styles.resultCount} aria-live="polite">
              {t("admin.users.resultSummary", {
                defaultValue: `${visibleItems.length} shown · ${activeCount} with admin access`,
                shown: visibleItems.length,
                active: activeCount,
              })}
            </p>
          </StickyHeaderLayout.Header>

          <StickyHeaderLayout.Content>
            {isDesktop && (
              <div
                className={styles.desktopHeader}
                role="row"
                aria-label={t("admin.users.columnsLabel", "User management columns")}
              >
                <span>{t("admin.users.columns.user", "User")}</span>
                <span>{t("admin.users.columns.status", "Access status")}</span>
                <span>{t("admin.users.columns.roles", "Roles")}</span>
                <span>{t("admin.users.columns.actions", "Actions")}</span>
              </div>
            )}
            <InfiniteScrollList
              data={visibleItems}
              isLoading={isLoading}
              hasMore={hasNextPage ?? false}
              onLoadMore={() => fetchNextPage()}
              isFetchingNextPage={isFetchingNextPage}
              renderItem={(user) => (
                <UserItem
                  user={user}
                  onManageAccess={() => setAccessUser({ id: user.id, name: user.name })}
                />
              )}
              emptyMessage={
                debouncedQuery || role || status
                  ? t("admin.users.searchNoMatch", "No users match your search.")
                  : t("admin.users.noUsersFound", "No users found.")
              }
            />
          </StickyHeaderLayout.Content>
        </StickyHeaderLayout>
      </div>

      <ScrollToTopButton />

      {accessUser && (
        <AccessDialog
          userId={accessUser.id}
          userName={accessUser.name}
          onClose={() => setAccessUser(null)}
          onSaved={handleAccessChange}
        />
      )}
    </ScreenView>
  );
}
