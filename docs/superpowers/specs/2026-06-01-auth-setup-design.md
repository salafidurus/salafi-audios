# Auth Setup Design — 2026-06-01

## Overview

Better Auth (v1.5.5) is already installed across the monorepo but several integration points are incomplete or broken. This document captures the agreed design for completing the integration correctly.

Auth is **opt-in** for progress/personalization. The app is mostly public. Authentication is **OAuth-only** (Google + Apple) — email/password is removed to eliminate email complexity.

## Gaps Being Fixed

- `auth.instance.ts`: `emailAndPassword` enabled (should be disabled), `expo()` plugin missing
- `auth.guard.ts`: `user.banned` field exists in DB but never checked
- No `GET /account/profile` controller exists despite contract + hook both wiring to it
- Web `AccountPage`: `onSignOut` prop never passed → sign-out button is a no-op
- No `apps/web/middleware.ts` → `/admin/*` routes load for unauthenticated users
- Web `auth-client.ts`: missing `adminClient()` plugin
- `UserProfileDto`: missing `role` and `emailVerified` fields
- No 401 interceptor → expired sessions silently break the UI
- Sign-in/sign-up screens show email/password form alongside OAuth buttons

## Architecture

### Auth Flow

Users authenticate via Google or Apple OAuth only. Better Auth handles the OAuth dance, issues a session cookie (web) or stores session in SecureStore (native via `@better-auth/expo`). The NestJS API validates the session on every protected request via the global `AuthGuard`.

### Security Layers

1. **API `AuthGuard`** (global) — validates session, enforces bans, attaches user to request
2. **API `AdminPermissionGuard`** — checks fine-grained permissions for admin routes
3. **Web `middleware.ts`** — UX-only redirect for `/admin/*` (cookie presence check only; real security is the API)

Authorization is backend-only. Client-side checks are UX, not security.

### Session Storage

- **Web**: HTTP-only cookie managed by Better Auth
- **Native**: `expo-secure-store` via `@better-auth/expo` expoClient plugin

### 401 Handling

A `setUnauthorizedHandler()` function in `core-api` registers a callback invoked on any 401 response. Each app wires it to call `authClient.signOut()` then navigate to sign-in.

## Components

### API Changes

| File                            | Change                                                  |
| ------------------------------- | ------------------------------------------------------- |
| `auth.instance.ts`              | Disable `emailAndPassword`, add `expo()` plugin         |
| `auth.guard.ts`                 | Add ban check after session validation                  |
| `account/account.controller.ts` | New: `GET /account/profile`                             |
| `account/account.service.ts`    | New: maps session user → `UserProfileDto` (no DB query) |
| `account/account.module.ts`     | New: registers controller + service                     |
| `app.module.ts`                 | Register `AccountModule`                                |

### Shared Package Changes

| File                                    | Change                                                           |
| --------------------------------------- | ---------------------------------------------------------------- |
| `core-contracts/types/account.types.ts` | Add `role: string`, `emailVerified: boolean` to `UserProfileDto` |
| `core-api/utils/api-client.ts`          | Add `setUnauthorizedHandler()`, invoke on 401                    |

### Web Changes

| File                                           | Change                                                      |
| ---------------------------------------------- | ----------------------------------------------------------- |
| `core/auth/auth-client.ts`                     | Add `adminClient()` plugin                                  |
| `core/providers.tsx`                           | Wire `setUnauthorizedHandler` → signOut + redirect          |
| `features/auth/screens/sign-in/*`              | Remove email/password form, OAuth buttons only              |
| `features/auth/screens/sign-up/*`              | Remove email/password form, OAuth buttons only              |
| `features/account/screens/account-actions.tsx` | New: client wrapper wiring `onSignOut`                      |
| `app/(main)/(account)/account/page.tsx`        | Render `AccountActions` instead of `AccountScreen` directly |
| `middleware.ts`                                | New: protect `/admin/*` with cookie presence check          |
| `middleware.spec.ts`                           | New: tests for middleware branches                          |

### Native Changes

| File                                               | Change                                                  |
| -------------------------------------------------- | ------------------------------------------------------- |
| `features/auth/screens/sign-in/sign-in.screen.tsx` | Remove email/password form                              |
| `features/auth/screens/sign-up/sign-up.screen.tsx` | Remove email/password form                              |
| `app/(auth)/sign-in.tsx`                           | Remove `onSignIn` prop                                  |
| `app/(auth)/sign-up.tsx`                           | Remove `onSignUp` prop                                  |
| `core/providers.tsx`                               | Wire `setUnauthorizedHandler` → signOut + navigate home |

## Design Decisions

**OAuth-only auth:** Removing email/password eliminates email verification and password reset complexity. Users authenticate via Google or Apple exclusively.

**`/account/profile` from session:** The endpoint maps session data to `UserProfileDto` without a DB query. Better Auth's session already carries all needed fields (`id`, `email`, `name`, `image`, `role`, `emailVerified`).

**Web middleware is UX-only:** Cookie presence check redirects unauthenticated users away from `/admin/*`. Cryptographic session validation happens at the API on every request. This keeps middleware fast (no network call).

**`onUnauthorized` in `core-api`:** Auth-specific 401 handling belongs in `core-api`'s interceptor layer, not in `core-contracts` (which is a primitive transport primitive). The callback is optional so existing call sites without it don't break.

**`AccountActions` wrapper:** `AccountPage` stays a Server Component (preserving `metadata` export and static rendering). A thin `"use client"` wrapper handles signOut action.

## Verification

1. `pnpm --filter core-contracts build`
2. `pnpm typecheck`
3. `pnpm --filter api test`
4. `pnpm --filter web test`
5. `pnpm --filter mobile test`
6. Manual: Google sign-in on web → sign out → redirects to `/`
7. Manual: access `/admin/*` without session → redirects to `/sign-in`
8. Manual: Google sign-in on native → SecureStore persists → sign out
9. API: banned user `GET /account/profile` → 403
10. API: unauthenticated `GET /account/profile` → 401
