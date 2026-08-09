import { z } from "zod";

export const UserProfileDtoSchema = z.object({
  id: z.string(),
  email: z.email(),
  displayName: z.string(),
  avatarUrl: z.string().optional(),
  emailVerified: z.boolean(),
  roles: z.array(z.string()),
  // Packed CASL rules (via @casl/ability/extra's packRules) — the client
  // rebuilds an identical ability via unpackRules + createMongoAbility.
  // Opaque tuple structure, not meaningfully validated field-by-field here.
  rules: z.array(z.any()).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type UserProfileDto = z.infer<typeof UserProfileDtoSchema>;

export const UpdateProfileDtoSchema = z.object({
  displayName: z.string().min(1, "Display name must not be empty"),
});
export type UpdateProfileDto = z.infer<typeof UpdateProfileDtoSchema>;
