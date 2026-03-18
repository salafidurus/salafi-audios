export type { AuthStatus } from "./use-auth";
export { createUseAuth } from "./use-auth";
export { createUseRequireAuth } from "./use-require-auth";

/**
 * UX-only role helpers. Backend is the authoritative source.
 */
export function isAdmin(role: string | undefined) {
  return role === "admin";
}

export function canEditContent(role: string | undefined) {
  return role === "admin";
}
