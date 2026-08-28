import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

/** Exposes the browser authentication boundary. */
/** Sends browser auth requests to the API with credentials so its session cookie is included. */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL!,
  plugins: [adminClient()],
  fetchOptions: {
    credentials: "include",
  },
});

/** Mirrors the authenticated user shape inferred from the configured Better Auth client. */
export type User = typeof authClient.$Infer.Session.user;
