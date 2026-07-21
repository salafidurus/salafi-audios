"use client";

import { useState, useCallback, type ReactNode, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@sd/core-contracts";
import { useInfiniteAdminUsers } from "@sd/domain-permissions";
import { useDebouncedSearch } from "@/shared/hooks";
import { useResponsive } from "@/shared/hooks/use-responsive";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { Search } from "@/shared/components/Search";
import { InfiniteScrollList } from "@/shared/components/InfiniteScrollList";
import { ScrollToTopButton } from "@/shared/components/ScrollToTopButton";
import { StickyHeaderLayout } from "@/shared/components/StickyHeaderLayout";
import { UserItem } from "@/features/admin/components/user-item";
import { PermissionsDialog } from "@/features/admin/components/PermissionsDialog";
import { RoleDialog } from "@/features/admin/components/RoleDialog";
import { useTranslation } from "@/core/i18n/use-translation";
import styles from "./admin-users.screen.module.css";

export function AdminUsersScreen(): ReactNode {
  const queryClient = useQueryClient();
  const { isMobile } = useResponsive();
  const { t } = useTranslation();
  const { query: searchQuery, setQuery: setSearchQuery, debouncedQuery } = useDebouncedSearch();
  const [role, setRole] = useState("");
  const [permUser, setPermUser] = useState<{ id: string; name: string } | null>(null);
  const [roleUser, setRoleUser] = useState<{ id: string; name: string } | null>(null);

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

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteAdminUsers(
    {
      search: debouncedQuery,
      role,
    },
  );

  const allItems = data?.pages.flatMap((page: any) => page.items) ?? [];

  const handlePermissionsChange = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all() });
  }, [queryClient]);

  const handleRolesChange = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all() });
  }, [queryClient]);

  return (
    <ScreenView contentStyle={{ flex: 1 }}>
      <PageHeader
        title={
          isMobile ? t("admin.users.titleMobile", "Users") : t("admin.users.title", "Manage Users")
        }
      />

      <div className={styles.content}>
        <StickyHeaderLayout>
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
        </StickyHeaderLayout.Header>

        <StickyHeaderLayout.Content>
          <InfiniteScrollList
            data={allItems}
            isLoading={isLoading}
            hasMore={hasNextPage ?? false}
            onLoadMore={() => fetchNextPage()}
            isFetchingNextPage={isFetchingNextPage}
            renderItem={(user) => (
              <UserItem
                user={user}
                onManagePermissions={() => setPermUser({ id: user.id, name: user.name })}
                onManageRoles={() => setRoleUser({ id: user.id, name: user.name })}
              />
            )}
            emptyMessage={
              debouncedQuery || role
                ? t("admin.users.searchNoMatch", "No users match your search.")
                : t("admin.users.noUsersFound", "No users found.")
            }
          />
        </StickyHeaderLayout.Content>
      </StickyHeaderLayout>
      </div>

      <ScrollToTopButton />

      {permUser && (
        <PermissionsDialog
          isOpen
          userId={permUser.id}
          userName={permUser.name}
          onClose={() => setPermUser(null)}
          onPermissionsChange={handlePermissionsChange}
        />
      )}

      {roleUser && (
        <RoleDialog
          isOpen
          userId={roleUser.id}
          userName={roleUser.name}
          onClose={() => setRoleUser(null)}
          onRolesChange={handleRolesChange}
        />
      )}
    </ScreenView>
  );
}
