import { z } from "zod";
import { LocaleSchema } from "./localization.types";

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
  locale: LocaleSchema,
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
  locale: LocaleSchema,
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
  ],
  superadmin: [
    ...PERMISSION_GROUPS.SCHOLARS,
    ...PERMISSION_GROUPS.LISTINGS,
    ...PERMISSION_GROUPS.TOPICS,
    ...PERMISSION_GROUPS.TRANSLATIONS,
    ...PERMISSION_GROUPS.MEDIA,
    ...PERMISSION_GROUPS.USERS,
  ],
};

// Array of all permissions (for iteration and management UI)
export const PERMISSIONS_ARRAY = Object.values(Permissions) as Permission[];

// User-facing labels for permissions
export const PERMISSION_LABELS: Record<Permission, string> = {
  // Scholar Permissions
  SCHOLARS_VIEW: "View Scholars",
  SCHOLARS_CREATE: "Create Scholars",
  SCHOLARS_EDIT: "Edit Scholars",
  SCHOLARS_DELETE: "Delete Scholars",
  SCHOLARS_PUBLISH: "Publish Scholars",

  // Listing Permissions
  LISTINGS_VIEW: "View Listings",
  LISTINGS_CREATE: "Create Listings",
  LISTINGS_EDIT: "Edit Listings",
  LISTINGS_DELETE: "Delete Listings",
  LISTINGS_PUBLISH: "Publish Listings",

  // Topic Permissions
  TOPICS_VIEW: "View Topics",
  TOPICS_CREATE: "Create Topics",
  TOPICS_EDIT: "Edit Topics",
  TOPICS_DELETE: "Delete Topics",
  TOPICS_PUBLISH: "Publish Topics",

  // Translation Permissions
  TRANSLATIONS_VIEW: "View Translations",
  TRANSLATIONS_CREATE: "Create Translations",
  TRANSLATIONS_EDIT: "Edit Translations",
  TRANSLATIONS_DELETE: "Delete Translations",
  TRANSLATIONS_PUBLISH: "Publish Translations",

  // Media Permissions
  MEDIA_UPLOAD: "Upload Media",
  MEDIA_DELETE: "Delete Media",

  // User Management Permissions
  USERS_VIEW: "View Users",
  USERS_EDIT: "Edit Users",
  USERS_DELETE: "Delete Users",
  USERS_GRANT_PERMISSIONS: "Grant Permissions",
  USERS_GRANT_ROLES: "Grant Roles",
};

// Detailed descriptions for permissions
export const PERMISSION_DESCRIPTIONS: Record<Permission, string> = {
  // Scholar Permissions
  SCHOLARS_VIEW: "View scholar profiles and information",
  SCHOLARS_CREATE: "Create new scholar accounts",
  SCHOLARS_EDIT: "Edit scholar profiles and details",
  SCHOLARS_DELETE: "Delete scholar accounts",
  SCHOLARS_PUBLISH: "Publish scholar content",

  // Listing Permissions
  LISTINGS_VIEW: "View all listings (series, modules, lessons, singles)",
  LISTINGS_CREATE: "Create new listings",
  LISTINGS_EDIT: "Edit existing listings",
  LISTINGS_DELETE: "Delete listings",
  LISTINGS_PUBLISH: "Publish listings to catalog",

  // Topic Permissions
  TOPICS_VIEW: "View all topics",
  TOPICS_CREATE: "Create new topics",
  TOPICS_EDIT: "Edit existing topics",
  TOPICS_DELETE: "Delete topics",
  TOPICS_PUBLISH: "Publish topics",

  // Translation Permissions
  TRANSLATIONS_VIEW: "View translations",
  TRANSLATIONS_CREATE: "Create translations for content",
  TRANSLATIONS_EDIT: "Edit existing translations",
  TRANSLATIONS_DELETE: "Delete translations",
  TRANSLATIONS_PUBLISH: "Publish translations to users",

  // Media Permissions
  MEDIA_UPLOAD: "Upload media files (audio, images, etc.)",
  MEDIA_DELETE: "Delete uploaded media",

  // User Management Permissions
  USERS_VIEW: "View user accounts and details",
  USERS_EDIT: "Edit user profiles and settings",
  USERS_DELETE: "Delete user accounts",
  USERS_GRANT_PERMISSIONS: "Grant individual permissions to users",
  USERS_GRANT_ROLES: "Assign roles to users",
};
