import { z } from "zod";

export const ADMIN_PERMISSIONS = [
  "manage:scholars",
  "manage:topics",
  "manage:content",
  "manage:livestreams",
  "manage:users",
  "manage:admin",
] as const;

export const AdminPermissionSchema = z.enum(ADMIN_PERMISSIONS);
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
  role: z.string(),
  createdAt: z.string(),
  permissions: z.array(AdminPermissionSchema),
});
export type AdminUserListItemDto = z.infer<typeof AdminUserListItemDtoSchema>;

export const AdminUserListDtoSchema = z.object({
  users: z.array(AdminUserListItemDtoSchema),
  total: z.number(),
});
export type AdminUserListDto = z.infer<typeof AdminUserListDtoSchema>;
