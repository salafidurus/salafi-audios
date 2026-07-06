"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useApiQuery, queryKeys, httpClient } from "@sd/core-contracts";
import { endpoints, type AdminUserListDto } from "@sd/core-contracts";
import { UserSearchBar } from "@/features/admin/components/user-search-bar/user-search-bar";
import { UserCard } from "@/features/admin/components/user-card/user-card";
import styles from "./admin-users.screen.mobile.module.css";

export function AdminUsersMobileScreen(): ReactNode {
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
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Admin Users</h1>

      <div className={styles.searchRow}>
        <UserSearchBar value={query} onChange={setQuery} onSubmit={() => setSearch(query)} />
      </div>

      {isFetching ? (
        <div className={styles.loading}>Loading users…</div>
      ) : (
        <>
          <p className={styles.resultCount}>
            {total} user{total !== 1 ? "s" : ""} found
          </p>
          <div className={styles.list}>
            {users.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
          {users.length === 0 && (
            <div className={styles.empty}>
              {search ? "No users match your search." : "No users found."}
            </div>
          )}
        </>
      )}
    </div>
  );
}
