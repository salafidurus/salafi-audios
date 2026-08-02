import { z } from "zod";

import { PermissionEnum } from "./permissions.types";

export const AdminPermissionDtoSchema = z.object({
  userId: z.string(),
  permission: PermissionEnum,
  grantedAt: z.string(),
  grantedById: z.string().nullable(),
});
export type AdminPermissionDto = z.infer<typeof AdminPermissionDtoSchema>;

export const AdminPermissionsListDtoSchema = z.object({
  permissions: z.array(AdminPermissionDtoSchema),
});
export type AdminPermissionsListDto = z.infer<typeof AdminPermissionsListDtoSchema>;

export const AdminUserListItemDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  image: z.string().nullable(),
  roles: z.array(z.string()),
  createdAt: z.string(),
  permissions: z.array(PermissionEnum),
});
export type AdminUserListItemDto = z.infer<typeof AdminUserListItemDtoSchema>;

export const AdminUserListDtoSchema = z.object({
  users: z.array(AdminUserListItemDtoSchema),
  nextCursor: z.string().optional(),
  hasMore: z.boolean(),
});
export type AdminUserListDto = z.infer<typeof AdminUserListDtoSchema>;
