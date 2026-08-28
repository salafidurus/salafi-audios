/** Provides the native core auth index module responsibility. */
export { authClient, refreshSession } from "./auth-client";
export type { User } from "./auth-client";
export { useAuth } from "./use-auth";
export { RouteAccessGuard } from "./RouteAccessGuard";
