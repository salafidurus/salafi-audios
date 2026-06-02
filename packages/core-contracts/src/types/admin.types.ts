export const ADMIN_PERMISSIONS = [
  "manage:scholars",
  "manage:topics",
  "manage:content",
  "manage:livestreams",
  "manage:users",
  "manage:admin",
] as const;

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number];

export interface AdminPermissionDto {
  userId: string;
  permission: AdminPermission;
  grantedAt: string;
  grantedById: string | null;
}

export interface AdminPermissionsListDto {
  permissions: AdminPermissionDto[];
}

export interface GrantPermissionDto {
  permission: AdminPermission;
}
