import { z } from "zod";

export const AdminUserListItemDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  image: z.string().nullable(),
  roles: z.array(z.string()),
  createdAt: z.string(),
});
export type AdminUserListItemDto = z.infer<typeof AdminUserListItemDtoSchema>;

export const AdminUserListDtoSchema = z.object({
  users: z.array(AdminUserListItemDtoSchema),
  nextCursor: z.string().optional(),
  hasMore: z.boolean(),
});
export type AdminUserListDto = z.infer<typeof AdminUserListDtoSchema>;
