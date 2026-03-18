import type { createAuthClient } from "better-auth/react";

type Client = Pick<ReturnType<typeof createAuthClient>, "useSession">;

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export function createUseAuth(client: Client) {
  return function useAuth(): {
    status: AuthStatus;
    user: ReturnType<Client["useSession"]>["data"] extends { user: infer U } | null
      ? U | null
      : null;
    isAuthenticated: boolean;
    isLoading: boolean;
  } {
    const { data: session, isPending } = client.useSession();
    return {
      status: isPending ? "loading" : session ? "authenticated" : "unauthenticated",
      user: (session?.user ?? null) as never,
      isAuthenticated: !!session,
      isLoading: isPending,
    };
  };
}
