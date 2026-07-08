"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useApiQuery, queryKeys, httpClient } from "@sd/core-contracts";
import { endpoints, type AdminUserListDto } from "@sd/core-contracts";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { EmptyState } from "@/shared/components/EmptyState";
import { UserSearchBar } from "@/features/admin/components/user-search-bar/user-search-bar";
import { UserRow } from "@/features/admin/components/user-row/user-row";
import styles from "./admin-users.screen.desktop.module.css";

export function AdminUsersDesktopScreen(): ReactNode {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");

  const { data, isFetching } = useApiQuery<AdminUserListDto>(
    queryKeys.admin.users.list(search),
    () =>
      httpClient<AdminUserListDto>({
        url: `${endpoints.admin.users.list}${search ? `?q=${encodeURIComponent(search)}` : ""}`,
        method: "GET",
      }),
  );

  const users = data?.users ?? [];
  const total = data?.total ?? 0;

  return (
    <ScreenView>
      <PageHeader title="Admin Users" />

      <div className={styles.searchRow}>
        <UserSearchBar value={query} onChange={setQuery} onSubmit={() => setSearch(query)} />
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
            <EmptyState message={search ? "No users match your search." : "No users found."} />
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.tableHead}>User</th>
                  <th className={styles.tableHead}>Email</th>
                  <th className={styles.tableHead}>Role</th>
                  <th className={styles.tableHead}>Permissions</th>
                  <th className={styles.tableHead}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <UserRow key={user.id} user={user} />
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </ScreenView>
  );
}
