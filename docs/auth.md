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

| Platform | Session credential                    | Storage                                       | How                                                                                                                                    |
| -------- | ------------------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Web      | `Cookie: better-auth.session_token=…` | Browser cookie jar                            | Same-domain cookies automatically sent via `credentials: 'include'`. HttpOnly flag prevents XSS. Browser handles all cookie mechanics. |
| Native   | `Cookie: better-auth.session_token=…` | `expo-secure-store` (via `@better-auth/expo`) | `@better-auth/expo` stores session in SecureStore and forwards via `Cookie` header (RN has no cookie jar).                             |
| API      | Validates cookies natively            | n/a                                           | Better Auth validates session cookies directly.                                                                                        |

The wiring happens once at app startup:

- Web — `apps/web/src/core/auth/auth-client.ts` configures auth with
  `credentials: 'include'`.
- Native — `apps/native/src/core/providers.tsx` calls
  `setCookieProvider(() => authClient.getCookie())` to forward the stored cookie.

Both providers feed `packages/core-api/src/utils/api-client.ts`, which forwards
them into the shared `httpClient`.

## Server configuration

`apps/api/src/core/auth/auth.instance.ts` builds the Better Auth instance.
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

`trustedOrigins` is set to `CORS_ORIGINS` (web) plus `CORS_ORIGINS_NATIVE`
(native deep-link schemes, e.g. `salafidurus-dev://`, `exp://`). Better Auth
validates absolute `callbackURL` values against this combined list.

## Session validation on the API

`apps/api/src/core/auth/auth.guard.ts` is the global `AuthGuard`. For every
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

### Native — Apple and Google native sign-in

Apple and Google both bypass the browser-redirect flow entirely on native,
using their respective native SDKs to obtain a device-signed identity token
and exchanging it directly — no deep-link handoff, no in-app browser.

- **Apple** (`apps/native/src/features/auth/hooks/use-native-apple-sign-in.ts`):
  gets an `identityToken` from `expo-apple-authentication`, POSTs it to a
  bespoke endpoint (`apps/api/src/core/auth/apple-native.controller.ts`), then
  manually writes the returned session into the `@better-auth/expo`
  `SecureStore` cookie shape and forces a session refresh.
- **Google** (`apps/native/src/features/auth/hooks/use-native-google-sign-in.ts`):
  gets an `idToken` from `@react-native-google-signin/google-signin`
  (`GoogleSignin.configure({ webClientId })` → `GoogleSignin.signIn()`), then
  calls Better Auth's built-in idToken support —
  `authClient.signIn.social({ provider: "google", idToken: { token } })`.
  No custom backend endpoint is needed: Better Auth verifies the token's `aud`
  claim against the existing `GOOGLE_CLIENT_ID`, and the `expo()` plugin
  handles session persistence the same way it does for the browser flow.

The native Google SDK is always configured with the **Web** OAuth client ID
(`webClientId`), not the Android one — Google issues the idToken audienced to
whichever client ID is passed there, and that's what the backend verifies
against. The Android OAuth client registered in Google Cloud Console (package
name + SHA-1 fingerprint) only authorizes the device to show the native
account picker; it never appears in any client-side or server-side config.

#### Both flows must force a session refetch afterward

Better Auth's core client only auto-triggers a `useSession()` refetch for a
fixed set of paths (`/sign-in/email`, `/sign-out`, etc.) — `/sign-in/social`
isn't one of them. `@better-auth/expo`'s own `Set-Cookie`-triggered refetch
_should_ cover the gap for the Google idToken flow, but empirically doesn't
reliably update the reactive session atom in time — and Apple's flow (a
custom endpoint with a manually-written cookie) never goes through that path
at all. Both hooks therefore call `refreshSession()`
(`apps/native/src/core/auth/auth-client.ts`) after persisting the session,
which directly invokes the session atom's own `refetch()` — the same
function `useSession()` itself uses — rather than a raw, atom-bypassing
`$fetch()` call. Skipping this step is the classic symptom of "sign-in
succeeds, cookie is written, but the app still acts signed out."

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
- `CORS_ORIGINS_NATIVE` — comma-separated list of trusted native deep-link
  schemes (defaults to `salafidurus-dev://,exp://`). Mind the "S" — a common
  typo is `CORS_ORIGIN_NATIVE` (singular), which Zod silently ignores in favor
  of the default.
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`, `APPLE_CLIENT_ID` /
  `APPLE_CLIENT_SECRET`.

### Web (`apps/web`)

- `NEXT_PUBLIC_API_URL` — the API origin (auth client `baseURL` and data calls).
- `NEXT_PUBLIC_WEB_URL` — the web origin (used to build the absolute OAuth
  `callbackURL`).

### Native (`apps/native`)

- `EXPO_PUBLIC_API_URL` — the API origin. On the Android emulator in dev,
  `getApiBaseUrl()` (`apps/native/src/core/config/runtime-env.ts`) rewrites a
  `localhost`/`127.0.0.1` value to `10.0.2.2` automatically, since the
  emulator's own `localhost` refers to itself, not the host machine.
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` — the same value as the API's
  `GOOGLE_CLIENT_ID` (the Web client). Passed to
  `GoogleSignin.configure({ webClientId })` for native Google sign-in.

### Google Cloud Console

- Authorized redirect URI: `https://api.salafidurus.com/api/auth/callback/google`.
- (Not the web `/auth/callback` — that is internal to the web app.)
- Android client: package `com.salafidevs.salafidurus.dev` (+ SHA-1 fingerprint).
- iOS client: bundle ID `com.salafidevs.salafidurus.dev`.

Keep `COOKIE_DOMAIN` (API) and `NEXT_PUBLIC_WEB_URL` / `NEXT_PUBLIC_API_URL`
(web) consistent per environment; a mismatch breaks OAuth flow.

#### Android debug keystore is committed and pinned

`apps/native/android/` is otherwise gitignored (regenerated by `expo
prebuild`), but `android/app/debug.keystore` is deliberately committed —
debug keys aren't secret, and native Google Sign-In on Android needs a
_stable_ SHA-1 fingerprint that matches what's registered on the
`salafi-durus-android-dev` OAuth client. A freshly auto-generated debug
keystore has a different SHA-1 and fails with `DEVELOPER_ERROR`.

`bun run prebuild:clean` (`expo prebuild --clean`) wipes and regenerates
`android/` entirely, which would delete the committed keystore and cause a new
one to be auto-generated on the next build. A `postprebuild:clean` script
(`apps/native/package.json`) restores the committed file from git
immediately after, before the subsequent Gradle build can generate a
replacement.

If the debug keystore is ever intentionally rotated (e.g. compromised), the
new SHA-1 must be re-registered on `salafi-durus-android-dev` in Google Cloud
Console, or native Google Sign-In on Android breaks with `DEVELOPER_ERROR`
again.

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

| Concern                                | File                                                               |
| -------------------------------------- | ------------------------------------------------------------------ |
| Shared HTTP client (credential attach) | `packages/core-contracts/src/http.ts`                              |
| Credential providers                   | `packages/core-api/src/utils/api-client.ts`                        |
| Better Auth server instance + plugins  | `apps/api/src/core/auth/auth.instance.ts`                          |
| CORS + Fastify route mount             | `apps/api/src/main.ts`                                             |
| Session validation guard               | `apps/api/src/core/auth/auth.guard.ts`                             |
| Apple native sign-in endpoint          | `apps/api/src/core/auth/apple-native.controller.ts`                |
| Web auth client + session detection    | `apps/web/src/core/auth/auth-client.ts`                            |
| Web OAuth callback page                | `apps/web/src/app/auth/callback/page.tsx`                          |
| Web startup wiring                     | `apps/web/src/core/providers.tsx`                                  |
| Native auth client (Expo)              | `apps/native/src/core/auth/auth-client.ts`                         |
| Native runtime env / base URL resolve  | `apps/native/src/core/config/runtime-env.ts`                       |
| Native Apple native sign-in hook       | `apps/native/src/features/auth/hooks/use-native-apple-sign-in.ts`  |
| Native Google native sign-in hook      | `apps/native/src/features/auth/hooks/use-native-google-sign-in.ts` |
| Native startup wiring                  | `apps/native/src/core/providers.tsx`                               |
