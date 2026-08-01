import { z } from "zod";

export const UserProfileDtoSchema = z.object({
  id: z.string(),
  email: z.email(),
  displayName: z.string(),
  avatarUrl: z.string().optional(),
  emailVerified: z.boolean(),
  roles: z.array(z.string()),
  permissions: z.array(z.string()).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type UserProfileDto = z.infer<typeof UserProfileDtoSchema>;

export const UpdateProfileDtoSchema = z.object({
  displayName: z.string().min(1, "Display name must not be empty"),
});
export type UpdateProfileDto = z.infer<typeof UpdateProfileDtoSchema>;
