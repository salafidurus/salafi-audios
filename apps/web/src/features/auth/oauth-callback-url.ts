// Compose the absolute `callbackURL` for cross-site social sign-in.
//
// Better Auth resolves a *relative* callbackURL against its own baseURL (the API
// origin), which would strand the browser on the API after OAuth (showing raw
// JSON). Instead we point the callback at the API's OAuth bridge — same origin
// as Better Auth, so it is an inherently trusted callback — which mints a
// one-time token and redirects the browser back to the web app's /auth/callback
// with it. `redirectTo` is the in-app path to land on after the token exchange.
export function buildOAuthCallbackURL(redirectTo: string): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
  const webUrl = process.env.NEXT_PUBLIC_WEB_URL ?? "";

  const webTarget = `${webUrl}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`;
  return `${apiUrl}/auth-bridge/oauth-complete?redirect=${encodeURIComponent(webTarget)}`;
}
