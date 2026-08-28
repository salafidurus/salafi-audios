/** Bridges the authentication client into native session, loading, and account state. */
export { authClient, refreshSession } from "./auth-client";
export type { User } from "./auth-client";
export { useAuth } from "./use-auth";
export { RouteAccessGuard } from "./RouteAccessGuard";
