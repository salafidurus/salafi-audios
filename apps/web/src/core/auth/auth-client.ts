import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL!,
  plugins: [adminClient()],
  fetchOptions: {
    credentials: "include",
    onSuccess: (ctx) => {
      if (String(ctx.request.url).endsWith("/sign-out")) {
        // Full navigation to "/" reloads the JS bundle, so the in-memory
        // (no longer persisted) query client is recreated fresh anyway.
        window.location.href = "/";
      }
    },
  },
});

export type Session = typeof authClient.$Infer.Session;
export type User = typeof authClient.$Infer.Session.user;
