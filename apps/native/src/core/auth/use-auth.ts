import { authClient } from "./auth-client";

/** Provides the native core auth use-auth module responsibility. */
/** Describes the useAuth native contract and behavior. */
export function useAuth() {
  const { data: session, isPending } = authClient.useSession();

  return {
    isAuthenticated: !!session,
    isLoading: isPending,
    user: session?.user,
  };
}
