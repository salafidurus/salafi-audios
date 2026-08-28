import { z } from "zod";

/** Administrative user-list response contracts, including cursor pagination metadata. */
/** One administrator-visible user row and its account metadata. */
export const AdminUserListItemDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  image: z.string().nullable(),
  roles: z.array(z.string()),
  createdAt: z.string(),
});
/** Validated administrator user-row response. */
export type AdminUserListItemDto = z.infer<typeof AdminUserListItemDtoSchema>;

/** Cursor-paginated administrator user list returned by the API. */
export const AdminUserListDtoSchema = z.object({
  users: z.array(AdminUserListItemDtoSchema),
  nextCursor: z.string().optional(),
  hasMore: z.boolean(),
});
/** Validated cursor-paginated administrator user-list response. */
export type AdminUserListDto = z.infer<typeof AdminUserListDtoSchema>;
