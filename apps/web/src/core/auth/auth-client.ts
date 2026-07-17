import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL!,
  plugins: [adminClient()],
  fetchOptions: {
    credentials: "include",
    onSuccess: (ctx) => {
      if (String(ctx.request.url).endsWith("/sign-out")) {
        window.location.href = "/";
      }
    },
  },
});

export type Session = typeof authClient.$Infer.Session;
export type User = typeof authClient.$Infer.Session.user;
