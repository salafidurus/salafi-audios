import { createAuthClient } from "better-auth/react";
import { adminClient, oneTimeTokenClient } from "better-auth/client/plugins";
import { clearBearerToken, getBearerToken, setBearerToken } from "./bearer-token";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL!,
  plugins: [adminClient(), oneTimeTokenClient()],
  fetchOptions: {
    // Cross-site: authenticate the client's own calls (useSession, sign-out,
    // one-time-token verify) with the stored bearer token instead of a cookie.
    auth: {
      type: "Bearer",
      token: () => getBearerToken() ?? "",
    },
    onSuccess: (ctx) => {
      // The server emits `set-auth-token` whenever it issues/refreshes a
      // session (notably the one-time-token verify that completes OAuth).
      const token = ctx.response.headers.get("set-auth-token");
      if (token) {
        setBearerToken(token);
      }
      if (String(ctx.request.url).endsWith("/sign-out")) {
        clearBearerToken();
      }
    },
  },
});

export type Session = typeof authClient.$Infer.Session;
export type User = typeof authClient.$Infer.Session.user;
