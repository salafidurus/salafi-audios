import type { AdminPermission, UserRole } from "@sd/core-contracts";
import { useAccountProfile } from "../../account.api";

type MyPermissionsDto = { permissions: AdminPermission[]; roles: UserRole[] };

export interface UseAdminPermissionsOptions {
  isAuthenticated?: boolean;
}

/**
 * Fetch admin permissions for the current user from session / account profile.
 */
export function useAdminPermissions(options?: UseAdminPermissionsOptions) {
  const { isAuthenticated } = options ?? {};
  const { data: profile, isLoading, error } = useAccountProfile();

  const data: MyPermissionsDto | undefined =
    profile && isAuthenticated !== false
      ? {
          permissions: (profile.permissions || []) as AdminPermission[],
          roles: (profile.roles || []) as UserRole[],
        }
      : undefined;

  return {
    data,
    isLoading: isAuthenticated === false ? false : isLoading,
    isFetching: isAuthenticated === false ? false : isLoading,
    error: isAuthenticated === false ? null : error,
  };
}
