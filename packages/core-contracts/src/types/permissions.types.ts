import { z } from "zod";

// Permission Enum - Granular permission model
export const PermissionEnum = z.enum([
  // Scholar Permissions
  "SCHOLARS_VIEW",
  "SCHOLARS_CREATE",
  "SCHOLARS_EDIT",
  "SCHOLARS_DELETE",
  "SCHOLARS_PUBLISH",

  // Listing Permissions
  "LISTINGS_VIEW",
  "LISTINGS_CREATE",
  "LISTINGS_EDIT",
  "LISTINGS_DELETE",
  "LISTINGS_PUBLISH",

  // Topic Permissions
  "TOPICS_VIEW",
  "TOPICS_CREATE",
  "TOPICS_EDIT",
  "TOPICS_DELETE",
  "TOPICS_PUBLISH",

  // Translation Permissions
  "TRANSLATIONS_VIEW",
  "TRANSLATIONS_CREATE",
  "TRANSLATIONS_EDIT",
  "TRANSLATIONS_DELETE",
  "TRANSLATIONS_PUBLISH",

  // Media Permissions
  "MEDIA_UPLOAD",
  "MEDIA_DELETE",

  // User Management Permissions
  "USERS_VIEW",
  "USERS_EDIT",
  "USERS_DELETE",
  "USERS_GRANT_PERMISSIONS",
  "USERS_GRANT_ROLES",

  // Live Session Permissions
  "LIVE_VIEW",
  "LIVE_CREATE",
  "LIVE_EDIT",
  "LIVE_DELETE",
  "LIVE_START",
  "LIVE_STOP",
]);

export type Permission = z.infer<typeof PermissionEnum>;

// Runtime-accessible permission constants (for decorators and type-safe access)
export const Permissions = {
  // Scholar Permissions
  SCHOLARS_VIEW: "SCHOLARS_VIEW",
  SCHOLARS_CREATE: "SCHOLARS_CREATE",
  SCHOLARS_EDIT: "SCHOLARS_EDIT",
  SCHOLARS_DELETE: "SCHOLARS_DELETE",
  SCHOLARS_PUBLISH: "SCHOLARS_PUBLISH",

  // Listing Permissions
  LISTINGS_VIEW: "LISTINGS_VIEW",
  LISTINGS_CREATE: "LISTINGS_CREATE",
  LISTINGS_EDIT: "LISTINGS_EDIT",
  LISTINGS_DELETE: "LISTINGS_DELETE",
  LISTINGS_PUBLISH: "LISTINGS_PUBLISH",

  // Topic Permissions
  TOPICS_VIEW: "TOPICS_VIEW",
  TOPICS_CREATE: "TOPICS_CREATE",
  TOPICS_EDIT: "TOPICS_EDIT",
  TOPICS_DELETE: "TOPICS_DELETE",
  TOPICS_PUBLISH: "TOPICS_PUBLISH",

  // Translation Permissions
  TRANSLATIONS_VIEW: "TRANSLATIONS_VIEW",
  TRANSLATIONS_CREATE: "TRANSLATIONS_CREATE",
  TRANSLATIONS_EDIT: "TRANSLATIONS_EDIT",
  TRANSLATIONS_DELETE: "TRANSLATIONS_DELETE",
  TRANSLATIONS_PUBLISH: "TRANSLATIONS_PUBLISH",

  // Media Permissions
  MEDIA_UPLOAD: "MEDIA_UPLOAD",
  MEDIA_DELETE: "MEDIA_DELETE",

  // User Management Permissions
  USERS_VIEW: "USERS_VIEW",
  USERS_EDIT: "USERS_EDIT",
  USERS_DELETE: "USERS_DELETE",
  USERS_GRANT_PERMISSIONS: "USERS_GRANT_PERMISSIONS",
  USERS_GRANT_ROLES: "USERS_GRANT_ROLES",

  // Live Session Permissions
  LIVE_VIEW: "LIVE_VIEW",
  LIVE_CREATE: "LIVE_CREATE",
  LIVE_EDIT: "LIVE_EDIT",
  LIVE_DELETE: "LIVE_DELETE",
  LIVE_START: "LIVE_START",
  LIVE_STOP: "LIVE_STOP",
} as const;

// User Role Enum
export const UserRoleEnum = z.enum([
  "listener",
  "scholar",
  "translator",
  "editor",
  "admin",
  "superadmin",
]);
export type UserRole = z.infer<typeof UserRoleEnum>;

// Scholar Permission Type
export const ScholarPermissionTypeEnum = z.enum(["OWN_CONTENT", "ASSIGNED_EDITOR"]);
export type ScholarPermissionType = z.infer<typeof ScholarPermissionTypeEnum>;

// DTOs
export const UserPermissionDtoSchema = z.object({
  id: z.string(),
  userId: z.string(),
  permission: PermissionEnum,
  grantedAt: z.string(),
  grantedBy: z.string().nullable(),
});
export type UserPermissionDto = z.infer<typeof UserPermissionDtoSchema>;

export const UserRoleAssignmentDtoSchema = z.object({
  id: z.string(),
  userId: z.string(),
  role: UserRoleEnum,
  grantedAt: z.string(),
  grantedBy: z.string().nullable(),
});
export type UserRoleAssignmentDto = z.infer<typeof UserRoleAssignmentDtoSchema>;

export const UserScholarRoleDtoSchema = z.object({
  id: z.string(),
  userId: z.string(),
  scholarId: z.string(),
  permissionType: ScholarPermissionTypeEnum,
  createdAt: z.string(),
  createdBy: z.string().nullable(),
});
export type UserScholarRoleDto = z.infer<typeof UserScholarRoleDtoSchema>;

export const UserTranslatorRoleDtoSchema = z.object({
  id: z.string(),
  userId: z.string(),
  locale: z.enum(["en", "ar"]),
  canPublish: z.boolean(),
  createdAt: z.string(),
  createdBy: z.string().nullable(),
});
export type UserTranslatorRoleDto = z.infer<typeof UserTranslatorRoleDtoSchema>;

// Request/Response DTOs
export const GrantPermissionRequestSchema = z.object({
  userId: z.string(),
  permission: PermissionEnum,
});
export type GrantPermissionRequest = z.infer<typeof GrantPermissionRequestSchema>;

export const GrantRoleRequestSchema = z.object({
  userId: z.string(),
  role: UserRoleEnum,
});
export type GrantRoleRequest = z.infer<typeof GrantRoleRequestSchema>;

export const AssignScholarRequestSchema = z.object({
  userId: z.string(),
  scholarId: z.string(),
  permissionType: ScholarPermissionTypeEnum,
});
export type AssignScholarRequest = z.infer<typeof AssignScholarRequestSchema>;

export const AssignTranslatorLanguageRequestSchema = z.object({
  userId: z.string(),
  locale: z.enum(["en", "ar"]),
  canPublish: z.boolean().default(false),
});
export type AssignTranslatorLanguageRequest = z.infer<typeof AssignTranslatorLanguageRequestSchema>;

// Permission groups for role-based defaults
export const PERMISSION_GROUPS = {
  SCHOLARS: [
    "SCHOLARS_VIEW",
    "SCHOLARS_CREATE",
    "SCHOLARS_EDIT",
    "SCHOLARS_DELETE",
    "SCHOLARS_PUBLISH",
  ],
  LISTINGS: [
    "LISTINGS_VIEW",
    "LISTINGS_CREATE",
    "LISTINGS_EDIT",
    "LISTINGS_DELETE",
    "LISTINGS_PUBLISH",
  ],
  TOPICS: ["TOPICS_VIEW", "TOPICS_CREATE", "TOPICS_EDIT", "TOPICS_DELETE", "TOPICS_PUBLISH"],
  TRANSLATIONS: [
    "TRANSLATIONS_VIEW",
    "TRANSLATIONS_CREATE",
    "TRANSLATIONS_EDIT",
    "TRANSLATIONS_DELETE",
    "TRANSLATIONS_PUBLISH",
  ],
  MEDIA: ["MEDIA_UPLOAD", "MEDIA_DELETE"],
  USERS: [
    "USERS_VIEW",
    "USERS_EDIT",
    "USERS_DELETE",
    "USERS_GRANT_PERMISSIONS",
    "USERS_GRANT_ROLES",
  ],
  LIVE: ["LIVE_VIEW", "LIVE_CREATE", "LIVE_EDIT", "LIVE_DELETE", "LIVE_START", "LIVE_STOP"],
} as const;

// Role to default permissions mapping
export const ROLE_DEFAULT_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  listener: [],
  scholar: [
    "SCHOLARS_EDIT",
    "LISTINGS_CREATE",
    "LISTINGS_EDIT",
    "LISTINGS_PUBLISH",
    "MEDIA_UPLOAD",
  ],
  translator: ["TRANSLATIONS_VIEW", "TRANSLATIONS_CREATE", "TRANSLATIONS_EDIT"],
  editor: ["LISTINGS_VIEW", "LISTINGS_CREATE", "LISTINGS_EDIT", "LISTINGS_PUBLISH", "MEDIA_UPLOAD"],
  admin: [
    ...PERMISSION_GROUPS.SCHOLARS,
    ...PERMISSION_GROUPS.LISTINGS,
    ...PERMISSION_GROUPS.TOPICS,
    ...PERMISSION_GROUPS.TRANSLATIONS,
    ...PERMISSION_GROUPS.MEDIA,
    ...PERMISSION_GROUPS.USERS,
    ...PERMISSION_GROUPS.LIVE,
  ],
  superadmin: [
    ...PERMISSION_GROUPS.SCHOLARS,
    ...PERMISSION_GROUPS.LISTINGS,
    ...PERMISSION_GROUPS.TOPICS,
    ...PERMISSION_GROUPS.TRANSLATIONS,
    ...PERMISSION_GROUPS.MEDIA,
    ...PERMISSION_GROUPS.USERS,
    ...PERMISSION_GROUPS.LIVE,
  ],
};
