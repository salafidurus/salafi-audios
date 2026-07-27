import type { AdminPermission, UserRole } from "@sd/core-contracts";

import { useAccountProfile } from "../../account.api";

type MyPermissionsDto = { permissions: AdminPermission[]; roles: UserRole[] };

export interface UseAdminPermissionsOptions {
  isAuthenticated?: boolean;
  enabled?: boolean;
}

/**
 * Fetch admin permissions for the current user from session / account profile.
 */
export function useAdminPermissions(options?: UseAdminPermissionsOptions) {
  const { isAuthenticated, enabled } = options ?? {};
  const queryEnabled = enabled ?? (isAuthenticated !== undefined ? isAuthenticated : true);

  const {
    data: profile,
    isLoading,
    error,
  } = useAccountProfile({
    enabled: queryEnabled,
  });

  const data: MyPermissionsDto | undefined =
    profile && queryEnabled
      ? {
          permissions: (profile.permissions || []) as AdminPermission[],
          roles: (profile.roles || []) as UserRole[],
        }
      : undefined;

  return {
    data,
    isLoading: !queryEnabled ? false : isLoading,
    isFetching: !queryEnabled ? false : isLoading,
    error: !queryEnabled ? null : error,
  };
}
