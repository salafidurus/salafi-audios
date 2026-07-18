"use client";

import { useState, useCallback, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@sd/core-contracts";
import { useInfiniteAdminUsers } from "@sd/domain-permissions";
import { useDebouncedSearch } from "@/shared/hooks";
import { useResponsive } from "@/shared/hooks/use-responsive";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { Search } from "@/shared/components/Search";
import { InfiniteScrollList } from "@/shared/components/InfiniteScrollList";
import { UserItem } from "@/features/admin/components/user-item";
import { PermissionsDialog } from "@/features/admin/components/PermissionsDialog";
import { RoleDialog } from "@/features/admin/components/RoleDialog";
import styles from "./admin-users.screen.module.css";

const ROLE_CHIPS: { id: string; label: string }[] = [
  { id: "listener", label: "Listener" },
  { id: "scholar", label: "Scholar" },
  { id: "translator", label: "Translator" },
  { id: "editor", label: "Editor" },
  { id: "admin", label: "Admin" },
  { id: "superadmin", label: "Super Admin" },
];

export function AdminUsersScreen(): ReactNode {
  const queryClient = useQueryClient();
  const { isMobile } = useResponsive();
  const { query: searchQuery, setQuery: setSearchQuery, debouncedQuery } = useDebouncedSearch();
  const [role, setRole] = useState("");
  const [permUser, setPermUser] = useState<{ id: string; name: string } | null>(null);
  const [roleUser, setRoleUser] = useState<{ id: string; name: string } | null>(null);

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
    <ScreenView>
      <PageHeader title={isMobile ? "Users" : "Manage Users"} />

      <div className={styles.content}>
        <div className={styles.searchRow}>
          <Search.Bar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search users by name or email..."
          />
        </div>

        <Search.Filter
          chips={ROLE_CHIPS}
          selected={role ? [role] : []}
          onChipChange={(chipId: string) => {
            setRole(role === chipId ? "" : chipId);
          }}
        />

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
          emptyMessage={debouncedQuery || role ? "No users match your search." : "No users found."}
        />
      </div>

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
