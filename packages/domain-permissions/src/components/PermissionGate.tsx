import type { ReactNode } from "react";
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
  // Single permission
  if (typeof requires === "string") {
    const hasPermission = useHasPermission(requires);
    return hasPermission ? children : fallback;
  }

  // Multiple permissions
  const permissionsArray = Array.from(requires || []);

  if (mode === "all") {
    const hasAllPermissions = useHasAllPermissions(permissionsArray);
    return hasAllPermissions ? children : fallback;
  }

  // mode === "any" (default)
  const hasAnyPermission = useHasAnyPermission(permissionsArray);
  return hasAnyPermission ? children : fallback;
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
  // Single role
  if (typeof requires === "string") {
    const hasRole = useHasRole(requires);
    return hasRole ? children : fallback;
  }

  // Multiple roles
  const rolesArray = Array.from(requires || []);

  if (mode === "all") {
    const hasAllRoles = useHasAllRoles(rolesArray);
    return hasAllRoles ? children : fallback;
  }

  // mode === "any" (default)
  const hasAnyRole = useHasAnyRole(rolesArray);
  return hasAnyRole ? children : fallback;
}
