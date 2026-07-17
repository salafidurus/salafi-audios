# Authentication

This document describes how authentication works across the whole platform —
the backend (`apps/api`), the web client (`apps/web`), the native client
(`apps/native`), and the shared transport packages. It complements
[`api.md` §5](./api.md), which states the authority rules; this file explains the
mechanism that implements them.

## Principles

- The backend is the only authority. Clients are consumers of a session; they
  never own the trust model. UI-level auth checks are UX, not security.
- Authentication is **OAuth-only** (Google + Apple). There is no email/password
  flow.
- The implementation is **[Better Auth v1.6.23+](https://www.better-auth.com/)**,
  mounted as a Fastify route in NestJS.
- **The web and API are deployed on the same root domain** (`salafidurus.com`),
  allowing secure session cookie sharing across subdomains. This simplifies the
  authentication flow: the web app authenticates with the same session cookies as
  the native app, without bearer token complexity.

## Credential model per platform

There is one shared HTTP client (`packages/core-contracts/src/http.ts`) used for
all domain data calls (catalog, account, library, admin, …). Each platform
handles credentials identically, using session cookies:

| Platform | Session credential                       | Storage                                       | How                                                                                                                                      |
|----------|------------------------------------------|-----------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------|
| Web      | `Cookie: better-auth.session_token=…`   | Browser cookie jar                            | Same-domain cookies automatically sent via `credentials: 'include'`. HttpOnly flag prevents XSS. Browser handles all cookie mechanics. |
| Native   | `Cookie: better-auth.session_token=…`   | `expo-secure-store` (via `@better-auth/expo`) | `@better-auth/expo` stores session in SecureStore and forwards via `Cookie` header (RN has no cookie jar).                             |
| API      | Validates cookies natively              | n/a                                           | Better Auth validates session cookies directly.                                                                                        |

The wiring happens once at app startup:

- Web — `apps/web/src/core/auth/auth-client.ts` configures auth with
  `credentials: 'include'`.
- Native — `apps/native/src/core/providers.tsx` calls
  `setCookieProvider(() => authClient.getCookie())` to forward the stored cookie.

Both providers feed `packages/core-api/src/utils/api-client.ts`, which forwards
them into the shared `httpClient`.

## Server configuration

`apps/api/src/modules/auth/auth.instance.ts` builds the Better Auth instance.
Relevant plugins:

- `expo()` — owns the native OAuth deep-link handoff and SecureStore session
  persistence.
- `admin()` — role/permission support.

Better Auth is configured with:

- `advanced.crossSubDomainCookies` — enables session cookie sharing across
  `salafidurus.com` and `api.salafidurus.com` subdomains (disabled in development).
- `advanced.useSecureCookies` — forces `Secure` flag in production (HTTPS-only).
- `session.expiresIn` — session lifetime (7 days by default).
- `session.updateAge` — automatic session refresh threshold (1 day by default).

`apps/api/src/main.ts` mounts Better Auth as a Fastify route at `/api/auth/*`
and configures CORS:

- `credentials: true` and an origin allowlist (`CORS_ORIGINS`).
- `exposedHeaders` includes `Set-Cookie` for cookie header inspection.

`trustedOrigins` is set to `CORS_ORIGINS`. Better Auth validates absolute
`callbackURL` values against this list.

## Session validation on the API

`apps/api/src/modules/auth/auth.guard.ts` is the global `AuthGuard`. For every
non-`@Public()` route it calls `getAuth().api.getSession({ headers })`. This
validates the session cookie, then enforces bans and roles and attaches
`request.user`.

## OAuth flows

### Web (same-domain) — direct OAuth callback

With the web and API on the same root domain, the OAuth flow is straightforward:
the session cookie set on the API origin is automatically sent to the web origin
on the same domain.

```text
Browser (web origin)                 API origin                         Google
        |                                |                                 |
 1. signIn.social({                      |                                 |
      provider,                          |                                 |
      callbackURL='https://salafidurus.com/auth/callback?redirect=/dashboard'
    })                                   |                                 |
        | --- redirect to sign-in/social -----> /api/auth/sign-in/social   |
        |                                | --- redirect to Google -------> |
        | <-------------------- redirect to Google ---------------------- |
        | --- user authenticates -------------------------------------->  |
        | <---------- redirect to /api/auth/callback/google ------------- |
        | -----------------------------> callback: create session,        |
        |                                set `domain=.salafidurus.com`     |
        |                                cookie                           |
        | <--- 302 to https://salafidurus.com/auth/callback?redirect=... |
 2. /auth/callback page:                 |                                 |
    authClient.useSession() reads        |                                 |
    session from cookie (automatic),     |                                 |
    then router.replace(redirect)        |                                 |
```

Key pieces:

- The social `callbackURL` is **absolute**, pointing at the web app's callback
  endpoint. Better Auth validates it against `trustedOrigins` (which includes
  the web origin).
- The cookie is set with `domain=.salafidurus.com`, shared across both subdomains.
  The `SameSite=Lax` flag allows cookies on OAuth redirects while protecting against
  CSRF.
- The web callback page — `apps/web/src/app/auth/callback/page.tsx` — uses
  `authClient.useSession()` to detect the session from the cookie (automatically
  sent by the browser). It then redirects to the original in-app path.

### Native — Better Auth Expo plugin

Native does not use the web callback page. `@better-auth/expo` performs the OAuth
handoff over the app's deep-link scheme and persists the session cookie in
`expo-secure-store`. `apps/native/src/core/auth/auth-client.ts` configures the
`expoClient` plugin; `authClient.getCookie()` returns the stored cookie string,
which the shared `httpClient` forwards as a `Cookie` header on API calls.

## Session management and sign-out

- **Session detection:** Web uses `authClient.useSession()`, which returns the
  session from the cookie. Native uses the same hook, but the cookie comes from
  SecureStore via `@better-auth/expo`.
- **Sign-out:** `authClient.signOut()` clears the session on the API. The browser
  automatically clears the session cookie (set with appropriate domain/path).
  Native's SecureStore is also cleared by `@better-auth/expo`.
- **401 handling:** `packages/core-api/src/utils/api-client.ts` invokes a
  registered unauthorized handler on any `401`. Each app wires it
  (`providers.tsx`) to clear local credentials and redirect to sign-in. A 401
  therefore means "re-authenticate", not a silent broken UI.

## Security considerations

- **HttpOnly cookies:** session cookies are not accessible via JavaScript, mitigating
  XSS attacks. The browser automatically includes them on all same-domain requests.
- **Secure flag:** in production, cookies are HTTPS-only, preventing MITM attacks.
- **SameSite=Lax:** allows cookies on top-level navigation (OAuth redirects) while
  blocking cross-site request forgery.
- **Open-redirect protection:** Better Auth validates absolute `callbackURL` values
  against `trustedOrigins`; the web callback page validates relative redirect paths.
- **Authority remains server-side:** every protected request is validated by the
  API regardless of what the client believes.

## Configuration

### API (`apps/api`)

- `BETTER_AUTH_URL` — the API's own origin (e.g., `https://api.salafidurus.com`).
- `BETTER_AUTH_SECRET` — session/token signing secret (minimum 32 characters).
- `COOKIE_DOMAIN` — root domain for session cookie sharing
  (e.g., `salafidurus.com`). Disabled in development (uses `localhost`).
- `CORS_ORIGIN` — comma-separated list of allowed web origins (e.g.,
  `https://salafidurus.com`). Used for CORS validation and `trustedOrigins`.
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`, `APPLE_CLIENT_ID` /
  `APPLE_CLIENT_SECRET`.

### Web (`apps/web`)

- `NEXT_PUBLIC_API_URL` — the API origin (auth client `baseURL` and data calls).
- `NEXT_PUBLIC_WEB_URL` — the web origin (used to build the absolute OAuth
  `callbackURL`).

### Native (`apps/native`)

- `EXPO_PUBLIC_API_URL` — the API origin.

### Google Cloud Console

- Authorized redirect URI: `https://api.salafidurus.com/api/auth/callback/google`.
- (Not the web `/auth/callback` — that is internal to the web app.)
- Android client: package `com.salafidevs.salafidurus.dev` (+ SHA-1 fingerprint).
- iOS client: bundle ID `com.salafidevs.salafidurus.dev`.

Keep `COOKIE_DOMAIN` (API) and `NEXT_PUBLIC_WEB_URL` / `NEXT_PUBLIC_API_URL`
(web) consistent per environment; a mismatch breaks OAuth flow.

## Local development

`localhost:3000` (web) and `localhost:4000` (api) are treated as the same site
(only port differs), so cookies work locally without special configuration.
Better Auth automatically disables `crossSubDomainCookies` in development
(`NODE_ENV !== 'production'`), so cookies still function during testing.

To test the production flow locally (with different domains), use ngrok or a
hosts file entry to simulate `salafidurus.localhost` and `api.salafidurus.localhost`,
then configure cookies accordingly.

## Adding a protected endpoint

- API routes are protected by default via the global `AuthGuard`. Mark a route
  `@Public()` to opt out. Use `@Roles(...)` for role-gated routes and
  `@CurrentUser()` to read the authenticated user.
- Client data calls made through `@sd/core-api` automatically carry the right
  credential — no per-call auth wiring is needed.

## File map

| Concern                                | File                                                  |
| -------------------------------------- | ----------------------------------------------------- |
| Shared HTTP client (credential attach) | `packages/core-contracts/src/http.ts`                 |
| Credential providers                   | `packages/core-api/src/utils/api-client.ts`           |
| Better Auth server instance + plugins  | `apps/api/src/modules/auth/auth.instance.ts`          |
| CORS + Fastify route mount             | `apps/api/src/main.ts`                                |
| Session validation guard               | `apps/api/src/modules/auth/auth.guard.ts`             |
| Web auth client + session detection    | `apps/web/src/core/auth/auth-client.ts`               |
| Web OAuth callback page                | `apps/web/src/app/auth/callback/page.tsx`             |
| Web startup wiring                     | `apps/web/src/core/providers.tsx`                     |
| Native auth client (Expo)              | `apps/native/src/core/auth/auth-client.ts`            |
| Native startup wiring                  | `apps/native/src/core/providers.tsx`                  |
