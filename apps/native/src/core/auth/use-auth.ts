import { authClient } from "./auth-client";

/** Bridges the authentication client into native session, loading, and account state. */
/** Returns authentication session state with loading and signed-in status for native consumers. */
export function useAuth() {
  const { data: session, isPending } = authClient.useSession();

  return {
    isAuthenticated: !!session,
    isLoading: isPending,
    user: session?.user,
  };
}
