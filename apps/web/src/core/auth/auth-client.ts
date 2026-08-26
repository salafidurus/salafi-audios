import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL!,
  plugins: [adminClient()],
  fetchOptions: {
    credentials: "include",
  },
});

export type User = typeof authClient.$Infer.Session.user;
