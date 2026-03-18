import type { createAuthClient } from "better-auth/react";

type Client = Pick<ReturnType<typeof createAuthClient>, "useSession">;

export function createUseRequireAuth(client: Client) {
  return function useRequireAuth(): {
    isAuthenticated: boolean;
    isLoading: boolean;
  } {
    const { data: session, isPending } = client.useSession();
    return {
      isAuthenticated: !!session,
      isLoading: isPending,
    };
  };
}
