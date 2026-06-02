import { authClient } from "./auth-client";

export function useAuth() {
  const { data: session, isPending } = authClient.useSession();

  return {
    isAuthenticated: !!session,
    isLoading: isPending,
    user: session?.user,
  };
}

export function useRequireAuth(): {
  isAuthenticated: boolean;
  isLoading: boolean;
} {
  const { data: session, isPending } = authClient.useSession();

  return {
    isAuthenticated: !!session,
    isLoading: isPending,
  };
}
