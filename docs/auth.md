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
- The implementation is **[Better Auth](https://www.better-auth.com/)**, mounted
  inside NestJS.
- **The web and API are deployed on different sites (different registrable
  domains) in production.** This single fact drives most of the design below:
  browsers block third-party cookies (Safari ITP fully, Chrome progressively),
  so the web client cannot authenticate to the API with a cookie. It uses a
  **bearer token** instead.

## Credential model per platform

There is one shared HTTP client (`packages/core-contracts/src/http.ts`) used for
all domain data calls (catalog, account, library, admin, …). It can attach
either an `Authorization: Bearer` header or a `Cookie` header, depending on what
each app wires up at startup. Each platform uses the credential that is robust
for it:

| Platform | Session credential                    | Storage                                       | Why                                                                                                                                    |
| -------- | ------------------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Web      | `Authorization: Bearer <token>`       | `localStorage` (`sd.bearer_token`)            | Cross-site; browsers block third-party cookies, but a bearer header is never blocked.                                                  |
| Native   | `Cookie: better-auth.session_token=…` | `expo-secure-store` (via `@better-auth/expo`) | React Native `fetch` has no cookie jar and no CORS/ITP restrictions, so forwarding the stored cookie as a header is simplest and safe. |
| API      | Validates either credential           | n/a                                           | The Better Auth `bearer()` plugin converts an `Authorization: Bearer` header into a session; cookies are validated natively.           |

The wiring happens once at app startup:

- Web — `apps/web/src/core/providers.tsx` calls
  `setAccessTokenProvider(() => getBearerToken())`.
- Native — `apps/native/src/core/providers.tsx` calls
  `setCookieProvider(() => authClient.getCookie())`.

Both providers feed `packages/core-api/src/utils/api-client.ts`, which forwards
them into the shared `httpClient`.

## Server configuration

`apps/api/src/modules/auth/auth.instance.ts` builds the Better Auth instance.
Relevant plugins:

- `expo()` — owns the native OAuth deep-link handoff and SecureStore session
  persistence.
- `bearer()` — accepts `Authorization: Bearer <token>` on requests and emits a
  `set-auth-token` response header whenever it issues or refreshes a session.
- `oneTimeToken()` — mints and verifies single-use tokens used for the web OAuth
  handoff (see below).
- `admin()` — role/permission support.

`apps/api/src/main.ts` mounts Better Auth as Express middleware at `/api/auth/*`
and configures CORS. Two CORS details matter for cross-site auth:

- `credentials: true` and an origin allowlist (`CORS_ORIGINS`).
- `exposedHeaders` includes `set-auth-token`, so the cross-origin web client can
  read the token the `bearer()` plugin emits.

`trustedOrigins` is set to `CORS_ORIGINS`. Better Auth also implicitly trusts its
own `baseURL` origin, which is why the OAuth bridge (below), hosted on the API
origin, is a valid `callbackURL`.

## Session validation on the API

`apps/api/src/modules/auth/auth.guard.ts` is the global `AuthGuard`. For every
non-`@Public()` route it calls `getAuth().api.getSession({ headers })`. Because
the `bearer()` plugin runs first and converts an `Authorization: Bearer` header
into the session cookie the rest of Better Auth expects, **the guard needs no
special-casing** — it validates bearer (web) and cookie (native) requests
identically, then enforces bans and roles and attaches `request.user`.

## OAuth flows

### Web (cross-site) — the bridge + one-time token

The hard part of cross-site OAuth is that the session is established on the API
origin (the Google callback sets a first-party cookie there), but the web SPA on
a different origin cannot read that cookie, and the `set-auth-token` header on a
redirect response is not readable by JavaScript. We bridge the gap with a
one-time token carried in the redirect URL.

```text
Browser (web origin)                 API origin                         Google
        |                                |                                 |
 1. signIn.social({                      |                                 |
      provider, callbackURL=BRIDGE })    |                                 |
        | ------------------------------> /api/auth/sign-in/social         |
        |                                | --- redirect to Google -------> |
        | <-------------------- redirect to Google ---------------------- |
        | --- user authenticates -------------------------------------->  |
        | <----------- redirect to /api/auth/callback/google ------------ |
        | -----------------------------> callback: create session,        |
        |                                set first-party session cookie    |
        |                                then redirect to callbackURL:     |
        |                                /auth-bridge/oauth-complete        |
        | -----------------------------> bridge (has session cookie):      |
        |                                generateOneTimeToken()            |
        | <--- 302 to WEB/auth/callback?ott=<token> --------------------- |
 2. /auth/callback page:                 |                                 |
    oneTimeToken.verify({ token }) ----> /api/auth/one-time-token/verify  |
        | <--- 200 + `set-auth-token` header ---------------------------- |
    store bearer token in localStorage   |                                 |
    router.replace(redirect)             |                                 |
```

Key pieces:

- The social `callbackURL` is **absolute** and points at the API OAuth bridge,
  built by `apps/web/src/features/auth/oauth-callback-url.ts`. A _relative_
  `callbackURL` would resolve against Better Auth's `baseURL` (the API) and
  strand the browser on the API showing raw JSON — this was the original bug.
- The bridge — `apps/api/src/modules/auth/auth-bridge.controller.ts`
  (`GET /auth-bridge/oauth-complete`, marked `@Public()`) — runs while the
  browser is on the API origin holding the first-party session cookie. It mints a
  one-time token and 302-redirects to the web app with it. The redirect target is
  validated against `CORS_ORIGINS` to prevent open redirects; no token is minted
  for an untrusted target.
- The web callback page — `apps/web/src/app/auth/callback/page.tsx` — exchanges
  the one-time token via `authClient.oneTimeToken.verify(...)`. That response
  carries `set-auth-token`, which the auth client's `onSuccess` hook stores. It
  then redirects to the original in-app path (validated to be a relative path).

### Native — Better Auth Expo plugin

Native does not use the bridge. `@better-auth/expo` performs the OAuth handoff
over the app's deep-link scheme and persists the session cookie in
`expo-secure-store`. `apps/native/src/core/auth/auth-client.ts` configures the
`expoClient` plugin; `authClient.getCookie()` returns the stored cookie string,
which the shared `httpClient` forwards as a `Cookie` header on API calls.

## Token capture, sign-out, and 401 handling

- **Capture (web):** `apps/web/src/core/auth/auth-client.ts` configures the
  Better Auth client with `fetchOptions.auth` (sends the stored bearer token on
  the client's own calls) and an `onSuccess` hook that stores any `set-auth-token`
  header. This captures the token on the one-time-token exchange and on any later
  session refresh.
- **Sign-out:** the same `onSuccess` clears the stored token when a `/sign-out`
  call succeeds. The web bearer token lives only in `localStorage`, so clearing
  it fully logs the browser out.
- **401 handling:** `packages/core-api/src/utils/api-client.ts` invokes a
  registered unauthorized handler on any `401`. Each app wires it
  (`providers.tsx`) to clear local credentials and redirect to sign-in. A 401
  therefore means "re-authenticate", not a silent broken UI.

## Security considerations

- **Web token in `localStorage`:** readable by JavaScript, so it is exposed to
  XSS. This is the accepted trade-off for cross-site SPA→API auth (cookies are
  not viable cross-site). Mitigate with a strict Content-Security-Policy and a
  reasonable session TTL.
- **Open-redirect protection:** the bridge only redirects to origins in
  `CORS_ORIGINS`; the web callback only forwards to relative in-app paths.
- **One-time tokens** are single-use and short-lived (Better Auth default
  ~3 minutes); they carry no session material on their own.
- **Authority remains server-side:** every protected request is validated by the
  API regardless of what the client believes.

## Configuration

### API (`apps/api`)

- `BETTER_AUTH_URL` — the API's own origin (used as `baseURL`).
- `BETTER_AUTH_SECRET` — session/token signing secret.
- `CORS_ORIGIN` — comma-separated list of allowed web origins. Used for both CORS
  and the bridge redirect allowlist, and as `trustedOrigins`.
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`, `APPLE_CLIENT_ID` /
  `APPLE_CLIENT_SECRET`.

### Web (`apps/web`)

- `NEXT_PUBLIC_API_URL` — the API origin (auth client `baseURL` and data calls).
- `NEXT_PUBLIC_WEB_URL` — the web origin (used to build the OAuth callback
  target).

### Native (`apps/native`)

- `EXPO_PUBLIC_API_URL` — the API origin.

### Google Cloud Console

- Web client authorized redirect URI: `https://<API_DOMAIN>/api/auth/callback/google`.
  The bridge endpoint and `/auth/callback` are internal and are **not** Google
  redirect URIs.
- Android client: package `com.salafidevs.salafidurus.dev` (+ SHA-1 fingerprint).
- iOS client: bundle ID `com.salafidevs.salafidurus.dev`.

Keep `CORS_ORIGIN` (API) and `NEXT_PUBLIC_WEB_URL` / `NEXT_PUBLIC_API_URL` (web)
in sync per environment; a mismatch fails fast at the bridge redirect allowlist.

## Local development and cross-site emulation

`localhost:3000` (web) and `localhost:4000` (api) are the _same_ site (only the
port differs), so cookies happen to work locally even though they will not in
production. To exercise the real cross-site path locally, point
`NEXT_PUBLIC_API_URL` at `http://127.0.0.1:4000` (a different site from
`localhost`) and add it to the API's `CORS_ORIGIN`. Auth still works because it
no longer depends on cookies.

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
| CORS + middleware mount                | `apps/api/src/main.ts`                                |
| Session validation guard               | `apps/api/src/modules/auth/auth.guard.ts`             |
| OAuth bridge (web handoff)             | `apps/api/src/modules/auth/auth-bridge.controller.ts` |
| Web auth client + token capture        | `apps/web/src/core/auth/auth-client.ts`               |
| Web bearer token store                 | `apps/web/src/core/auth/bearer-token.ts`              |
| Web OAuth callback URL builder         | `apps/web/src/features/auth/oauth-callback-url.ts`    |
| Web OAuth callback page                | `apps/web/src/app/auth/callback/page.tsx`             |
| Web startup wiring                     | `apps/web/src/core/providers.tsx`                     |
| Native auth client (Expo)              | `apps/native/src/core/auth/auth-client.ts`            |
| Native startup wiring                  | `apps/native/src/core/providers.tsx`                  |
