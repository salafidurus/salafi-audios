import type { ReactNode } from "react";
import { useMemo } from "react";
import type { Permission, UserRole } from "@sd/core-contracts";
import {
  useHasPermission,
  useHasAnyPermission,
  useHasAllPermissions,
  useHasRole,
  useHasAnyRole,
  useHasAllRoles,
} from "../hooks/use-permissions";

interface PermissionGateProps {
  /**
   * Single permission or array of permissions to check.
   * If array, default behavior is "any" (user must have at least one).
   * Use `mode="all"` to require all permissions.
   */
  requires: Permission | readonly Permission[];
  /**
   * Content to render when user has the required permission(s)
   */
  children: ReactNode;
  /**
   * Content to render when user does not have the required permission(s)
   * @default null
   */
  fallback?: ReactNode;
  /**
   * When `requires` is an array:
   * - "any": user must have at least one permission (default)
   * - "all": user must have all permissions
   * @default "any"
   */
  mode?: "any" | "all";
}

/**
 * Gate component that conditionally renders content based on user permissions.
 *
 * @example
 * // Single permission
 * <PermissionGate requires={Permission.SCHOLARS_CREATE}>
 *   <button>Create Scholar</button>
 * </PermissionGate>
 *
 * @example
 * // Multiple permissions (user needs at least one)
 * <PermissionGate requires={[Permission.SCHOLARS_EDIT, Permission.LISTINGS_EDIT]}>
 *   <button>Edit Content</button>
 * </PermissionGate>
 *
 * @example
 * // Multiple permissions (user needs all)
 * <PermissionGate requires={[Permission.LISTINGS_CREATE, Permission.LISTINGS_PUBLISH]} mode="all">
 *   <button>Publish Content</button>
 * </PermissionGate>
 *
 * @example
 * // With fallback
 * <PermissionGate requires={Permission.USERS_EDIT} fallback={<div>No access</div>}>
 *   <AdminPanel />
 * </PermissionGate>
 */
export function PermissionGate({
  requires,
  children,
  fallback = null,
  mode = "any",
}: PermissionGateProps): ReactNode {
  // Determine if single permission
  const isSingle = typeof requires === "string";
  const singlePermission = isSingle ? (requires as Permission) : null;

  // Normalize to array
  const permissionsArray = useMemo(
    () => (isSingle ? [singlePermission!] : Array.from(requires || [])),
    [isSingle, singlePermission, requires],
  );

  // Call all hooks unconditionally at top level
  const hasSinglePermission = useHasPermission(
    singlePermission || permissionsArray[0] || ("" as Permission),
  );
  const hasAllPermissions = useHasAllPermissions(permissionsArray);
  const hasAnyPermission = useHasAnyPermission(permissionsArray);

  // Determine access based on mode
  const hasAccess = useMemo(() => {
    if (isSingle) {
      return hasSinglePermission;
    }
    return mode === "all" ? hasAllPermissions : hasAnyPermission;
  }, [isSingle, hasSinglePermission, hasAllPermissions, hasAnyPermission, mode]);

  return hasAccess ? children : fallback;
}

interface RoleGateProps {
  /**
   * Single role or array of roles to check.
   * If array, default behavior is "any" (user must have at least one).
   * Use `mode="all"` to require all roles.
   */
  requires: UserRole | readonly UserRole[];
  /**
   * Content to render when user has the required role(s)
   */
  children: ReactNode;
  /**
   * Content to render when user does not have the required role(s)
   * @default null
   */
  fallback?: ReactNode;
  /**
   * When `requires` is an array:
   * - "any": user must have at least one role (default)
   * - "all": user must have all roles
   * @default "any"
   */
  mode?: "any" | "all";
}

/**
 * Gate component that conditionally renders content based on user roles.
 *
 * @example
 * // Single role
 * <RoleGate requires="admin">
 *   <AdminPanel />
 * </RoleGate>
 *
 * @example
 * // Multiple roles (user needs at least one)
 * <RoleGate requires={["admin", "editor"]}>
 *   <button>Manage Content</button>
 * </RoleGate>
 *
 * @example
 * // Multiple roles (user needs all)
 * <RoleGate requires={["admin", "editor"]} mode="all">
 *   <SpecialAdminFeature />
 * </RoleGate>
 *
 * @example
 * // With fallback
 * <RoleGate requires="admin" fallback={<div>Admin only</div>}>
 *   <AdminPanel />
 * </RoleGate>
 */
export function RoleGate({
  requires,
  children,
  fallback = null,
  mode = "any",
}: RoleGateProps): ReactNode {
  // Determine if single role
  const isSingle = typeof requires === "string";
  const singleRole = isSingle ? (requires as UserRole) : null;

  // Normalize to array
  const rolesArray = useMemo(
    () => (isSingle ? [singleRole!] : Array.from(requires || [])),
    [isSingle, singleRole, requires],
  );

  // Call all hooks unconditionally at top level
  const hasSingleRole = useHasRole(singleRole || rolesArray[0] || ("" as UserRole));
  const hasAllRoles = useHasAllRoles(rolesArray);
  const hasAnyRole = useHasAnyRole(rolesArray);

  // Determine access based on mode
  const hasAccess = useMemo(() => {
    if (isSingle) {
      return hasSingleRole;
    }
    return mode === "all" ? hasAllRoles : hasAnyRole;
  }, [isSingle, hasSingleRole, hasAllRoles, hasAnyRole, mode]);

  return hasAccess ? children : fallback;
}
