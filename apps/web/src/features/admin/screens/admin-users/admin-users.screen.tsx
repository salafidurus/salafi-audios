"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useApiQuery, queryKeys, httpClient } from "@sd/core-contracts";
import { endpoints, type AdminUserListDto } from "@sd/core-contracts";
import { useResponsive } from "@/shared/hooks/use-responsive";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { EmptyState } from "@/shared/components/EmptyState";
import { SearchBar } from "@/shared/components/SearchBar";
import { UserCard } from "@/features/admin/components/user-card/user-card";
import { PermissionsDialog } from "@/features/admin/components/PermissionsDialog";
import styles from "./admin-users.screen.module.css";

export function AdminUsersScreen(): ReactNode {
  const queryClient = useQueryClient();
  const { isMobile } = useResponsive();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [permUser, setPermUser] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isFetching } = useApiQuery<AdminUserListDto>(
    queryKeys.admin.users.list(debouncedSearch),
    () =>
      httpClient<AdminUserListDto>({
        url: `${endpoints.admin.users.list}${debouncedSearch ? `?q=${encodeURIComponent(debouncedSearch)}` : ""}`,
        method: "GET",
      }),
  );

  const users = useMemo(() => data?.users ?? [], [data]);
  const total = useMemo(() => data?.total ?? 0, [data]);

  const handlePermissionsChange = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all() });
  }, [queryClient]);

  return (
    <ScreenView>
      <PageHeader title={isMobile ? "Users" : "Manage Users"} />

      <div className={styles.searchRow}>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search users by name or email..."
        />
      </div>

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
              message={debouncedSearch ? "No users match your search." : "No users found."}
            />
          ) : (
            <div className={styles.cardList}>
              {users.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onManagePermissions={() => setPermUser({ id: user.id, name: user.name })}
                />
              ))}
            </div>
          )}
        </>
      )}

      {permUser && (
        <PermissionsDialog
          isOpen
          userId={permUser.id}
          userName={permUser.name}
          onClose={() => setPermUser(null)}
          onPermissionsChange={handlePermissionsChange}
        />
      )}
    </ScreenView>
  );
}
