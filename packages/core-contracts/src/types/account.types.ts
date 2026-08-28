import { z } from "zod";

/** Account profile response and profile-update contracts shared by authenticated clients. */
/** Runtime validator for the authenticated user's profile projection. */
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
/** Validated authenticated-user profile response. */
export type UserProfileDto = z.infer<typeof UserProfileDtoSchema>;

/** Runtime validator for editable profile fields. */
export const UpdateProfileDtoSchema = z.object({
  displayName: z.string().min(1, "Display name must not be empty"),
});
/** Validated profile-update request. */
export type UpdateProfileDto = z.infer<typeof UpdateProfileDtoSchema>;
