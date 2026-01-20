import { z } from "zod";

export const RoleSchema = z.enum(["listener", "editor", "admin"]);
export type Role = z.infer<typeof RoleSchema>;

export const SessionUserSchema = z.object({
  userId: z.string(),
  role: RoleSchema,
  email: z.string().email().optional(),
  displayName: z.string().optional(),
});

export type SessionUser = z.infer<typeof SessionUserSchema>;

/**
 * Authorization helpers (lightweight shared semantics).
 * Backend remains authoritative; these are for client UX gating only.
 */
export function canEditContent(role: Role) {
  return role === "editor" || role === "admin";
}

export function isAdmin(role: Role) {
  return role === "admin";
}
