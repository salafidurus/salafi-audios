"use client";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys, type UserRole, httpClient, endpoints } from "@sd/core-contracts";
import { useResponsive } from "@/shared/hooks/use-responsive";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { Search } from "@/shared/components/Search";
import { InfiniteScrollList } from "@/shared/components/InfiniteScrollList";
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
          queryKey={[...queryKeys.admin.users.infinite(), debouncedSearch, role]}
          queryFn={async ({ pageParam }: { pageParam?: string | undefined }) => {
            const params = new URLSearchParams();
            if (pageParam) params.append("cursor", pageParam);
            if (debouncedSearch) params.append("q", debouncedSearch);
            if (role) params.append("role", role);
            const url = `${endpoints.admin.users.list}${params.size > 0 ? `?${params}` : ""}`;
            const response = await httpClient<{
              users: any[];
              nextCursor?: string;
              hasMore: boolean;
            }>({ url, method: "GET" });
            return {
              items: response.users,
              nextCursor: response.nextCursor,
              hasMore: response.hasMore,
            };
          }}
          renderItem={(user) => (
            <UserItem
              user={user}
              onManagePermissions={() => setPermUser({ id: user.id, name: user.name })}
              onManageRoles={() => setRoleUser({ id: user.id, name: user.name })}
            />
          )}
          emptyMessage={debouncedSearch || role ? "No users match your search." : "No users found."}
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
