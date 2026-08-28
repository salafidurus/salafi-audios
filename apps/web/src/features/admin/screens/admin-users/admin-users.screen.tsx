"use client";

import { queryKeys, type AdminUserListItemDto } from "@sd/core-contracts";
import { useInfiniteAdminUsers } from "@sd/domain-account";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
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
import { Button } from "@/shared/components/ui/button";
import { TableHead, TableRow } from "@/shared/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/shared/components/ui/toggle-group";
import { useDebouncedSearch } from "@/shared/hooks";
import { useIsDesktop } from "@/shared/hooks/use-responsive";

import styles from "./admin-users.screen.module.css";

const ROLE_PRIORITY = new Map<string, number>([
  ["listener", 1],
  ["scholar", 2],
  ["translator", 3],
  ["editor", 4],
  ["admin", 5],
  ["superadmin", 6],
]);

type UserSortKey = "name" | "createdAt" | "roles";
type UserSort = { key: UserSortKey; direction: "asc" | "desc" };

function highestRole(roles: string[]): number {
  return Math.max(...roles.map((role) => ROLE_PRIORITY.get(role.toLowerCase()) ?? 0), 0);
}

function UsersTableHeader({
  sort,
  onSort,
}: {
  sort: UserSort;
  onSort: (key: UserSortKey) => void;
}) {
  const { t } = useTranslation();
  const sortIcon = (key: UserSortKey) => {
    if (sort.key !== key) return <ArrowUpDown aria-hidden="true" data-icon="inline-end" />;
    return sort.direction === "asc" ? (
      <ArrowUp aria-hidden="true" data-icon="inline-end" />
    ) : (
      <ArrowDown aria-hidden="true" data-icon="inline-end" />
    );
  };

  const sortableHeaders: Array<{ key: UserSortKey; label: string }> = [
    { key: "name", label: t("admin.users.columns.user", "User") },
    { key: "createdAt", label: t("admin.users.columns.joined", "Date joined") },
    { key: "roles", label: t("admin.users.columns.roles", "Roles") },
  ];

  return (
    <TableRow>
      {sortableHeaders.map(({ key, label }) => (
        <TableHead
          key={key}
          aria-sort={
            sort.key === key ? (sort.direction === "asc" ? "ascending" : "descending") : "none"
          }
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={styles.sortButton}
            onClick={() => onSort(key)}
          >
            {label}
            {sortIcon(key)}
          </Button>
        </TableHead>
      ))}
      <TableHead>{t("admin.users.columns.actions", "Actions")}</TableHead>
    </TableRow>
  );
}

function AdminUsersHeader({
  searchQuery,
  setSearchQuery,
  role,
  setRole,
  roleOptions,
}: {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  role: string;
  setRole: (value: string) => void;
  roleOptions: Array<{ id: string; label: string }>;
}) {
  const { t } = useTranslation();

  return (
    <StickyHeaderLayout.Header>
      <PageHeader title={t("admin.users.title", "Manage Users")} />
      <div className={styles.filterToolbar}>
        <div className={styles.searchRow}>
          <Search.Bar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t("admin.users.searchPlaceholder", "Search users by name or email...")}
          />
        </div>
        <div className={styles.filterGroup}>
          <ToggleGroup
            type="single"
            value={role}
            onValueChange={setRole}
            aria-label={t("admin.users.roleLabel", "Role")}
            className={styles.filterChips}
          >
            <ToggleGroupItem value="" variant="outline" size="sm">
              {t("search.filterAll", "All")}
            </ToggleGroupItem>
            {roleOptions.map((option) => (
              <ToggleGroupItem key={option.id} value={option.id} variant="outline" size="sm">
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>
    </StickyHeaderLayout.Header>
  );
}

function AdminUsersContent({
  visibleItems,
  listState,
  fetchNextPage,
  isDesktop,
  sort,
  onSort,
  debouncedQuery,
  role,
  onManageAccess,
}: {
  visibleItems: AdminUserListItemDto[];
  listState: {
    isLoading: boolean;
    hasNextPage: boolean | undefined;
    isFetchingNextPage: boolean;
  };
  fetchNextPage: () => void;
  isDesktop: boolean;
  sort: UserSort;
  onSort: (key: UserSortKey) => void;
  debouncedQuery: string;
  role: string;
  onManageAccess: (user: AdminUserListItemDto) => void;
}) {
  const { t } = useTranslation();

  return (
    <StickyHeaderLayout.Content>
      <InfiniteScrollList
        data={visibleItems}
        isLoading={listState.isLoading}
        hasMore={listState.hasNextPage ?? false}
        onLoadMore={fetchNextPage}
        isFetchingNextPage={listState.isFetchingNextPage}
        layout={isDesktop ? "table" : "list"}
        tableHeader={isDesktop ? <UsersTableHeader sort={sort} onSort={onSort} /> : undefined}
        renderItem={(user) => (
          <UserItem
            user={user}
            layout={isDesktop ? "table" : "list"}
            onManageAccess={() => onManageAccess(user)}
          />
        )}
        emptyMessage={
          debouncedQuery || role
            ? t("admin.users.searchNoMatch", "No users match your search.")
            : t("admin.users.noUsersFound", "No users found.")
        }
      />
    </StickyHeaderLayout.Content>
  );
}

export function AdminUsersScreen(): ReactNode {
  const queryClient = useQueryClient();
  const isDesktop = useIsDesktop();
  const { t } = useTranslation();
  const { query: searchQuery, setQuery: setSearchQuery, debouncedQuery } = useDebouncedSearch();
  const [role, setRole] = useState("");
  const [sort, setSort] = useState<UserSort>({
    key: "createdAt",
    direction: "desc",
  });
  const [accessUser, setAccessUser] = useState<{ id: string; name: string } | null>(null);

  const roleOptions = useMemo(
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

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteAdminUsers(
    {
      search: debouncedQuery,
      role,
    },
  );

  const visibleItems = useMemo(() => {
    const allItems: AdminUserListItemDto[] = data?.pages.flatMap((page) => page.items) ?? [];
    return [...allItems].sort((left, right) => {
      const comparison =
        sort.key === "createdAt"
          ? new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
          : sort.key === "roles"
            ? highestRole(left.roles) - highestRole(right.roles)
            : (left.name ?? "").localeCompare(right.name ?? "");
      return sort.direction === "asc" ? comparison : -comparison;
    });
  }, [data?.pages, sort]);

  const toggleSort = (key: UserSortKey) => {
    setSort((current) => ({
      key,
      direction:
        current.key === key
          ? current.direction === "asc"
            ? "desc"
            : "asc"
          : key === "roles"
            ? "desc"
            : "asc",
    }));
  };

  const handleAccessChange = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all() });
  }, [queryClient]);

  return (
    <ScreenView contentStyle={{ flex: 1 }}>
      <div className={styles.content}>
        <StickyHeaderLayout>
          <AdminUsersHeader
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            role={role}
            setRole={setRole}
            roleOptions={roleOptions}
          />

          <AdminUsersContent
            visibleItems={visibleItems}
            listState={{ isLoading, hasNextPage, isFetchingNextPage }}
            fetchNextPage={fetchNextPage}
            isDesktop={isDesktop}
            sort={sort}
            onSort={toggleSort}
            debouncedQuery={debouncedQuery}
            role={role}
            onManageAccess={(user) => setAccessUser({ id: user.id, name: user.name })}
          />
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
