import { authClient } from "./auth-client";

/** Documents this module's responsibility and public boundary. */
export function useAuth() {
  const { data: session, isPending } = authClient.useSession();
  return {
    isAuthenticated: !!session,
    isLoading: isPending,
    user: session?.user,
  };
}
