import { z } from "zod";

// Permission enum values (mirrored from @sd/core-db schema)
// Imported at runtime from @sd/core-db where needed
const PERMISSION_VALUES = [
  "SCHOLARS_VIEW",
  "SCHOLARS_CREATE",
  "SCHOLARS_EDIT",
  "SCHOLARS_DELETE",
  "SCHOLARS_PUBLISH",
  "LISTINGS_VIEW",
  "LISTINGS_CREATE",
  "LISTINGS_EDIT",
  "LISTINGS_DELETE",
  "LISTINGS_PUBLISH",
  "TOPICS_VIEW",
  "TOPICS_CREATE",
  "TOPICS_EDIT",
  "TOPICS_DELETE",
  "TOPICS_PUBLISH",
  "TRANSLATIONS_VIEW",
  "TRANSLATIONS_CREATE",
  "TRANSLATIONS_EDIT",
  "TRANSLATIONS_DELETE",
  "TRANSLATIONS_PUBLISH",
  "MEDIA_UPLOAD",
  "MEDIA_DELETE",
  "USERS_VIEW",
  "USERS_EDIT",
  "USERS_DELETE",
  "USERS_GRANT_PERMISSIONS",
  "USERS_GRANT_ROLES",
  "LIVE_VIEW",
  "LIVE_CREATE",
  "LIVE_EDIT",
  "LIVE_DELETE",
  "LIVE_START",
  "LIVE_STOP",
] as const;

export type Permission = (typeof PERMISSION_VALUES)[number];

// Zod schema for runtime validation
export const AdminPermissionSchema = z.enum(PERMISSION_VALUES);

// Constant for reference in backend
export const ADMIN_PERMISSIONS = PERMISSION_VALUES;
export type AdminPermission = z.infer<typeof AdminPermissionSchema>;

export const AdminPermissionDtoSchema = z.object({
  userId: z.string(),
  permission: AdminPermissionSchema,
  grantedAt: z.string(),
  grantedById: z.string().nullable(),
});
export type AdminPermissionDto = z.infer<typeof AdminPermissionDtoSchema>;

export const AdminPermissionsListDtoSchema = z.object({
  permissions: z.array(AdminPermissionDtoSchema),
});
export type AdminPermissionsListDto = z.infer<typeof AdminPermissionsListDtoSchema>;

export const GrantPermissionDtoSchema = z.object({
  permission: AdminPermissionSchema,
});
export type GrantPermissionDto = z.infer<typeof GrantPermissionDtoSchema>;

export const AdminUserListItemDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  image: z.string().nullable(),
  roles: z.array(z.string()),
  createdAt: z.string(),
  permissions: z.array(AdminPermissionSchema),
});
export type AdminUserListItemDto = z.infer<typeof AdminUserListItemDtoSchema>;

export const AdminUserListDtoSchema = z.object({
  users: z.array(AdminUserListItemDtoSchema),
  total: z.number(),
});
export type AdminUserListDto = z.infer<typeof AdminUserListDtoSchema>;
