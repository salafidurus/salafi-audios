import { useMemo } from "react";
import {
  endpoints,
  httpClient,
  queryKeys,
  useApiQuery,
  type Permission,
  type UserRole,
} from "@sd/core-contracts";

interface UserPermissionsData {
  permissions: Permission[];
  roles: UserRole[];
}

/** Helper: Check if any item exists in a set (O(n) with O(1) lookups) */
const checkAnyInSet = <T>(
  items: readonly T[] | null | undefined,
  set: readonly T[] | null | undefined,
): boolean => {
  if (!items || items.length === 0 || !set) return false;
  const itemSet = new Set(set);
  return items.some((item) => itemSet.has(item));
};

/** Helper: Check if all items exist in a set (O(n) with O(1) lookups) */
const checkAllInSet = <T>(
  items: readonly T[] | null | undefined,
  set: readonly T[] | null | undefined,
): boolean => {
  if (!items || items.length === 0) return true;
  if (!set) return false;
  const itemSet = new Set(set);
  return items.every((item) => itemSet.has(item));
};

/**
 * Fetch the current user's permissions and roles
 * Returns cached query data with permissions and roles arrays
 */
export function useMyPermissions() {
  return useApiQuery(queryKeys.admin.permissions.me(), () =>
    httpClient<UserPermissionsData>({
      url: endpoints.admin.permissions.me,
      method: "GET",
    }),
  );
}

/**
 * Check if the current user has a specific permission
 * @param permission - The permission to check
 * @returns true if user has the permission, false otherwise or if data is loading/error
 */
export function useHasPermission(permission: Permission | null | undefined): boolean {
  const { data } = useMyPermissions();

  return useMemo(() => {
    if (!permission || !data?.permissions) return false;
    return data.permissions.includes(permission);
  }, [permission, data?.permissions]);
}

/**
 * Check if the current user has any of the provided permissions
 * @param permissions - Array of permissions to check
 * @returns true if user has at least one permission, false otherwise or if data is loading/error
 */
export function useHasAnyPermission(
  permissions: readonly Permission[] | null | undefined,
): boolean {
  const { data } = useMyPermissions();
  return useMemo(
    () => checkAnyInSet(permissions, data?.permissions),
    [permissions, data?.permissions],
  );
}

/**
 * Check if the current user has all of the provided permissions
 * @param permissions - Array of permissions to check
 * @returns true if user has all permissions, false otherwise or if data is loading/error
 */
export function useHasAllPermissions(
  permissions: readonly Permission[] | null | undefined,
): boolean {
  const { data } = useMyPermissions();
  return useMemo(
    () => checkAllInSet(permissions, data?.permissions),
    [permissions, data?.permissions],
  );
}

/**
 * Check if the current user has a specific role
 * @param role - The role to check
 * @returns true if user has the role, false otherwise or if data is loading/error
 */
export function useHasRole(role: UserRole | null | undefined): boolean {
  const { data } = useMyPermissions();

  return useMemo(() => {
    if (!role || !data?.roles) return false;
    return data.roles.includes(role);
  }, [role, data?.roles]);
}

/**
 * Check if the current user has any of the provided roles
 * @param roles - Array of roles to check
 * @returns true if user has at least one role, false otherwise or if data is loading/error
 */
export function useHasAnyRole(roles: readonly UserRole[] | null | undefined): boolean {
  const { data } = useMyPermissions();
  return useMemo(() => checkAnyInSet(roles, data?.roles), [roles, data?.roles]);
}

/**
 * Check if the current user has all of the provided roles
 * @param roles - Array of roles to check
 * @returns true if user has all roles, false otherwise or if data is loading/error
 */
export function useHasAllRoles(roles: readonly UserRole[] | null | undefined): boolean {
  const { data } = useMyPermissions();
  return useMemo(() => checkAllInSet(roles, data?.roles), [roles, data?.roles]);
}

/**
 * Check if the current user is an admin (has admin or superadmin role)
 * @returns true if user is admin or superadmin, false otherwise
 */
export function useIsAdmin(): boolean {
  return useHasAnyRole(["admin", "superadmin"]);
}

/**
 * Check if the current user is a superadmin
 * @returns true if user is superadmin, false otherwise
 */
export function useIsSuperAdmin(): boolean {
  return useHasRole("superadmin");
}

/**
 * Get the current user's permissions and roles
 * Returns the full data object or undefined if loading/error
 */
export function usePermissions() {
  return useMyPermissions();
}
