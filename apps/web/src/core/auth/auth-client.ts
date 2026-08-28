import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

/** Documents this module's responsibility and public boundary. */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL!,
  plugins: [adminClient()],
  fetchOptions: {
    credentials: "include",
  },
});

/** Documents the intent and contract of this declaration. */
export type User = typeof authClient.$Infer.Session.user;
