import { authClient } from "./auth-client";

/** Reads the Better Auth session for web consumers. */
/** Projects the Better Auth session into stable loading, identity, and authentication flags. */
export function useAuth() {
  const { data: session, isPending } = authClient.useSession();
  return {
    isAuthenticated: !!session,
    isLoading: isPending,
    user: session?.user,
  };
}
