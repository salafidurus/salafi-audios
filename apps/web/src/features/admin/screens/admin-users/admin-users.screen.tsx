"use client";

import { useState, useEffect, useMemo, useCallback, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useApiQuery,
  queryKeys,
  httpClient,
  endpoints,
  type AdminUserListDto,
  type UserRole,
} from "@sd/core-contracts";
import { useResponsive } from "@/shared/hooks/use-responsive";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { EmptyState } from "@/shared/components/EmptyState";
import { Search } from "@/shared/components/Search";
import { List } from "@/shared/components/List";
import { UserItem } from "@/features/admin/components/user-item";
import { PermissionsDialog } from "@/features/admin/components/PermissionsDialog";
import { RoleDialog } from "@/features/admin/components/RoleDialog";
import styles from "./admin-users.screen.module.css";

const ROLE_CHIPS: { id: UserRole; label: string }[] = [
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
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [role, setRole] = useState("");
  const [permUser, setPermUser] = useState<{ id: string; name: string } | null>(null);
  const [roleUser, setRoleUser] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isFetching } = useApiQuery<AdminUserListDto>(
    queryKeys.admin.users.list(debouncedSearch, role),
    () =>
      httpClient<AdminUserListDto>({
        url: `${endpoints.admin.users.list}${debouncedSearch || role ? `?${new URLSearchParams({ ...(debouncedSearch && { q: debouncedSearch }), ...(role && { role }) }).toString()}` : ""}`,
        method: "GET",
      }),
  );

  const users = useMemo(() => data?.users ?? [], [data]);
  const total = useMemo(() => data?.total ?? 0, [data]);

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

        {isFetching ? (
          <EmptyState variant="loading" message="Loading users…" />
        ) : (
          <>
            <div className={styles.toolbar}>
              <p className={styles.resultCount}>
                {total} user{total !== 1 ? "s" : ""} found
              </p>
            </div>

            {users.length === 0 ? (
              <EmptyState
                message={
                  debouncedSearch || role ? "No users match your search." : "No users found."
                }
              />
            ) : (
              <List>
                {users.map((user) => (
                  <UserItem
                    key={user.id}
                    user={user}
                    onManagePermissions={() => setPermUser({ id: user.id, name: user.name })}
                    onManageRoles={() => setRoleUser({ id: user.id, name: user.name })}
                  />
                ))}
              </List>
            )}
          </>
        )}
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
