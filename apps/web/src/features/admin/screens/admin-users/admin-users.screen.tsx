"use client";

import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useApiQuery, queryKeys, httpClient } from "@sd/core-contracts";
import { endpoints, type AdminUserListDto } from "@sd/core-contracts";
import { useIsDesktop } from "@/shared/hooks/use-responsive";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { EmptyState } from "@/shared/components/EmptyState";
import { SearchBar } from "@/shared/components/SearchBar";
import { UserCard } from "@/features/admin/components/user-card/user-card";
import styles from "./admin-users.screen.module.css";

export function AdminUsersScreen(): ReactNode {
  const isDesktop = useIsDesktop();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input to avoid excessive API calls
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

  const users = data?.users ?? [];
  const total = data?.total ?? 0;

  return (
    <ScreenView>
      <PageHeader title={isDesktop ? "Manage Users" : "Users"} />

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
                <UserCard key={user.id} user={user} />
              ))}
            </div>
          )}
        </>
      )}
    </ScreenView>
  );
}
