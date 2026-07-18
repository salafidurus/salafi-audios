# Authentication Migration Plan: Cross-Origin to Same-Domain Cookies

## Metadata

- **Date**: 2026-07-17
- **Status**: Planned
- **Scope**: Migrate web app and API authentication from cross-origin bearer tokens (in localStorage) to same-domain session cookies with HttpOnly, Secure, and SameSite=Lax flags. Native app remains unchanged (uses @better-auth/expo cookie forwarding).
- **Summary**: With the new domain configuration (salafidurus.com web + api.salafidurus.com API on same root domain), we can use more secure same-domain session cookies instead of cross-origin bearer token exchange. This requires updating better-auth configuration on the API, removing the OAuth bridge pattern, simplifying web auth client, updating sign-in components to use absolute callback URLs, rewriting the OAuth callback handler, and updating all related tests and documentation. Clean cutover migration — all users re-authenticate.
- **Dependencies**:
  - OAuth provider settings (Google Cloud Console and Apple Developer Portal) must be updated BEFORE any code deployment
  - Better-auth v1.6.23 documentation review for `crossSubDomainCookies` and `useSecureCookies` configuration syntax
  - No blocking architectural decisions — plan is ready to execute

---

## Progress

### Completed

- ✅ Comprehensive exploration of auth implementation across all apps (api, web, native)
- ✅ Better-auth configuration analysis (v1.6.23)
- ✅ Cross-origin OAuth bridge pattern analysis
- ✅ Plan creation with corrections from external review (DeepSeek)
- ✅ Critical fixes applied:
  - OAuth callback URLs must be ABSOLUTE (not relative) pointing to web app
  - Cookie configuration uses `crossSubDomainCookies` and `useSecureCookies` (not `cookieOptions`)
  - Environment config is in `apps/api/src/shared/config/env.ts`
  - `clearBearerToken()` must be removed from unauthorized handler

### In Progress

- 🔄 Plan file creation in proper format

### Blocked

- None currently identified

### Next Steps

1. Update OAuth provider settings in Google Cloud Console and Apple Developer Portal
2. Execute Stage 1: Backend cookie configuration changes
3. Execute Stage 2: Remove OAuth bridge pattern
4. Execute Stage 3-5: Web app changes (remove bearer tokens, update auth client, update components, rewrite callback handler, update providers)
5. Execute Stage 6: Update shared packages and documentation
6. Execute Stage 7: Update and delete test files
7. Final verification: Run all tests, lint, typecheck, build

---

## Staging Strategy

Implementation is broken into **7 independent yet sequential stages**:

1. **Stage 1** — Backend cookie configuration (CORS, session expiry, environment config)
   - Dependency: OAuth provider URLs must be updated externally first
   - Outcome: API configured for same-domain cookies, ready for testing

2. **Stage 2** — Remove OAuth bridge pattern (delete bridge controller, unregister from module)
   - Dependency: Depends on Stage 1 (new cookie config must be in place)
   - Outcome: Bridge endpoints removed, clean architecture

3. **Stage 3** — Web app bearer token cleanup (remove bearer-token.ts and build-oauth-callback-url.ts files)
   - Dependency: Stages 1-2 (verification that no web dependencies on these files)
   - Outcome: Dead code removed from web app

4. **Stage 4** — Web app auth client update (simplify auth-client.ts, remove oneTimeTokenClient plugin)
   - Dependency: Stage 3 (bearer-token files must be deleted first)
   - Outcome: Auth client configured for cookies instead of bearer tokens

5. **Stage 5** — Web app sign-in and callback updates (update sign-in components with absolute URLs, rewrite callback handler, update providers.tsx)
   - Dependency: Stage 4 (auth client must be simplified first)
   - Outcome: OAuth flow directly to web app, no bridge, session cookie handling

6. **Stage 6** — Shared packages and documentation (update http.ts comments, add core-api documentation, rewrite docs/auth.md)
   - Dependency: Stage 5 (all code changes must be complete first)
   - Outcome: Documentation reflects new cookie-based architecture

7. **Stage 7** — Test file cleanup and updates (delete obsolete test files, create/update callback handler tests)
   - Dependency: Stage 5 (implementation must be complete before test updates)
   - Outcome: Test suite reflects new implementation

**Verification** — Final validation after all stages (typecheck, test, lint, build)

---

## Stage 1: Backend Cookie Configuration

### Status

`Pending`

### Goal

Configure better-auth v1.6.23 on the API for same-domain cookie sharing, update CORS headers, add explicit session expiry settings, and verify environment configuration.

### Files

- `apps/api/src/modules/auth/auth.instance.ts` — Update betterAuth() configuration
- `apps/api/src/shared/config/env.ts` — Verify NODE_ENV enum exists
- `apps/api/src/main.ts` — Update CORS exposedHeaders

### Changes

**File 1: apps/api/src/modules/auth/auth.instance.ts**

Add to `betterAuth()` configuration:

```typescript
// ✅ CORRECT: Better-auth v1.6.23 cookie configuration for same-domain
advanced: {
  // Primary: cross-subdomain cookie sharing
  crossSubDomainCookies: {
    enabled: config.NODE_ENV !== 'development',  // Disable in dev (localhost)
    domain: 'salafidurus.com',  // No leading dot — better-auth handles it
  },

  // Secure cookies in production only (HTTPS required)
  useSecureCookies: config.NODE_ENV === 'production',

  // Override default sameSite (already 'lax' by default, but explicit is clearer)
  defaultCookieAttributes: {
    sameSite: 'lax',
  },
},

// Add explicit session configuration
session: {
  expiresIn: 60 * 60 * 24 * 7,      // 7 days in seconds
  updateAge: 60 * 60 * 24,          // Refresh if session > 1 day old
},
```

In the plugins array:

```typescript
plugins: [admin(), expo(), bearer()],  // ❌ Remove oneTimeToken()
```

**File 2: apps/api/src/shared/config/env.ts**

Verify NODE_ENV enum exists. If not, add:

```typescript
NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
```

**File 3: apps/api/src/main.ts**

Update CORS registration. Remove `'set-auth-token'` from exposedHeaders:

```typescript
await app.register(cors, {
  origin: config.CORS_ORIGINS,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id", "Cookie"],
  exposedHeaders: ["X-Request-Id", "Set-Cookie"], // ❌ Remove 'set-auth-token'
  maxAge: 86400,
});
```

### Blockers

- **CRITICAL PREREQUISITE**: OAuth provider settings must be updated in Google Cloud Console and Apple Developer Portal BEFORE deploying this stage. Redirect URIs must be set to `https://api.salafidurus.com/api/auth/callback/{provider}`.
- Must verify better-auth v1.6.23 documentation to confirm `crossSubDomainCookies` and `useSecureCookies` syntax.

### Dependencies

- None on earlier stages. OAuth provider URLs MUST be updated externally before deployment.

### Completion Criteria

- ✅ `apps/api/src/modules/auth/auth.instance.ts` contains `advanced.crossSubDomainCookies` and `useSecureCookies` configuration
- ✅ `apps/api/src/modules/auth/auth.instance.ts` contains explicit `session` configuration with 7-day expiry
- ✅ `apps/api/src/main.ts` CORS exposedHeaders does NOT contain `'set-auth-token'`
- ✅ `apps/api/src/shared/config/env.ts` contains NODE_ENV enum with development/staging/production
- ✅ `bun run --filter api typecheck` passes
- ✅ API starts without errors and serves requests

### Suggested Commit Message

```
feat(api): configure same-domain session cookies for api.salafidurus.com

- Add explicit crossSubDomainCookies configuration for subdomain sharing
- Add useSecureCookies production flag for HTTPS-only cookies
- Add explicit session expiry (7 days) and refresh policy
- Update CORS exposedHeaders to remove deprecated set-auth-token
- Verify NODE_ENV configuration in env.ts

Enables direct web-to-API cookie sharing on same root domain.
```

---

## Stage 2: Remove OAuth Bridge Pattern

### Status

`Pending`

### Goal

Delete the OAuth bridge controller that mints one-time tokens, unregister it from the auth module, and remove the oneTimeToken plugin from better-auth configuration.

### Files

- `apps/api/src/modules/auth/auth-bridge.controller.ts` — **DELETE**
- `apps/api/src/modules/auth/auth.module.ts` — Remove controller registration
- `apps/api/src/modules/auth/auth.instance.ts` — Already updated in Stage 1 (oneTimeToken removed)
- `apps/api/src/modules/auth/auth-bridge.controller.spec.ts` — **DELETE** (if exists)

### Changes

**File 1: apps/api/src/modules/auth/auth-bridge.controller.ts**

- Delete entire file (no longer needed with same-domain cookies)

**File 2: apps/api/src/modules/auth/auth.module.ts**

- Remove `AuthBridgeController` from the `controllers` array

**File 3: apps/api/src/modules/auth/auth-bridge.controller.spec.ts**

- Delete entire file if it exists (tests deleted code)

### Blockers

- None currently identified

### Dependencies

- Depends on Stage 1 (new cookie configuration must be in place for direct OAuth flow to work)

### Completion Criteria

- ✅ `apps/api/src/modules/auth/auth-bridge.controller.ts` is deleted
- ✅ `apps/api/src/modules/auth/auth.module.ts` does NOT contain `AuthBridgeController` in controllers array
- ✅ `apps/api/src/modules/auth/auth-bridge.controller.spec.ts` is deleted (if it existed)
- ✅ No references to `AuthBridgeController` or `auth-bridge` in source
- ✅ `bun run --filter api typecheck` passes
- ✅ `bun run --filter api test` passes

### Suggested Commit Message

```
refactor(api): remove oauth bridge pattern with clean cutover to direct cookies

- Delete AuthBridgeController (no longer needed)
- Unregister bridge controller from auth module
- Remove oneTimeToken plugin from better-auth (no longer needed)
- Clean up bridge-related test file

OAuth now redirects directly from providers to web app with same-domain
session cookies — no bridge endpoint or one-time token exchange needed.
```

---

## Stage 3: Web App Bearer Token Cleanup

### Status

`Pending`

### Goal

Remove bearer token storage utilities from web app after confirming no other code depends on them.

### Files

- `apps/web/src/core/auth/bearer-token.ts` — **DELETE** (after verifying no dependencies)
- `apps/web/src/core/auth/build-oauth-callback-url.ts` — **DELETE** (after verifying no dependencies)
- `apps/web/src/core/auth/bearer-token.spec.ts` — **DELETE** (tests deleted file)

### Changes

**Pre-deletion verification**:

```bash
# From apps/web directory, search for all usages:
grep -r "bearer-token" src/
grep -r "build-oauth-callback-url" src/
grep -r "getBearerToken" src/
grep -r "setBearerToken" src/
grep -r "clearBearerToken" src/
grep -r "buildOAuthCallbackURL" src/
```

Expected to find usages in:

- `src/core/auth/auth-client.ts` — will be updated in Stage 4
- `src/core/providers.tsx` — will be updated in Stage 5
- `src/features/auth/components/*` — will be updated in Stage 5
- Test files — will be cleaned up in Stage 7

After Stage 5 completes, these files can be safely deleted with zero dependencies.

**File deletions**:

1. Delete `apps/web/src/core/auth/bearer-token.ts`
2. Delete `apps/web/src/core/auth/build-oauth-callback-url.ts`
3. Delete `apps/web/src/core/auth/bearer-token.spec.ts`

### Blockers

- Must verify that all imports of these files have been removed by Stage 5 before deleting

### Dependencies

- Depends on Stage 5 (all imports and usages must be updated first)

### Completion Criteria

- ✅ All usages of `getBearerToken`, `setBearerToken`, `clearBearerToken` removed from auth-client.ts
- ✅ All usages of `buildOAuthCallbackURL` removed from sign-in components
- ✅ All usages of token provider removed from providers.tsx
- ✅ `apps/web/src/core/auth/bearer-token.ts` is deleted
- ✅ `apps/web/src/core/auth/build-oauth-callback-url.ts` is deleted
- ✅ `apps/web/src/core/auth/bearer-token.spec.ts` is deleted
- ✅ No imports of deleted files remain in source
- ✅ `bun run --filter web typecheck` passes
- ✅ `bun run --filter web test` passes

### Suggested Commit Message

```
refactor(web): remove bearer token storage utilities

- Delete bearer-token.ts (no longer needed with session cookies)
- Delete build-oauth-callback-url.ts (no longer needed without bridge)
- Delete associated test files

All imports already removed in auth client and component updates.
```

---

## Stage 4: Web App Auth Client Update

### Status

`Pending`

### Goal

Simplify the auth client configuration to use cookies instead of bearer tokens, remove oneTimeTokenClient plugin, and add credentials: 'include' for automatic cookie forwarding.

### Files

- `apps/web/src/core/auth/auth-client.ts` — Update configuration

### Changes

**File: apps/web/src/core/auth/auth-client.ts**

Before:

```typescript
export const authClient = createAuthClient({
  baseURL: apiBaseUrl,
  plugins: [adminClient(), oneTimeTokenClient()], // ❌ Remove oneTimeTokenClient
  fetchOptions: {
    auth: {
      type: "Bearer",
      token: () => getBearerToken() ?? "",
    },
    onSuccess: async (response: Response) => {
      const tokenHeader = response.headers.get("set-auth-token");
      if (tokenHeader) {
        setBearerToken(tokenHeader);
      }
      if (response.url.includes("/sign-out")) {
        clearBearerToken();
      }
    },
  },
});
```

After:

```typescript
export const authClient = createAuthClient({
  baseURL: apiBaseUrl,
  plugins: [adminClient()], // ✅ Remove oneTimeTokenClient
  fetchOptions: {
    credentials: "include", // ✅ Include cookies in requests
    onSuccess: async (response: Response) => {
      // Only handle sign-out now (no token management)
      if (response.url.includes("/sign-out")) {
        window.location.href = "/";
      }
    },
  },
});
```

Changes:

- ❌ Remove `auth: { type: 'Bearer' }` config
- ❌ Remove `oneTimeTokenClient` from plugins
- ❌ Remove `getBearerToken()` call
- ❌ Remove `setBearerToken()` call and set-auth-token header handling
- ❌ Remove `clearBearerToken()` call
- ✅ Add `credentials: 'include'` to send cookies with requests
- ✅ Keep sign-out redirect logic

### Blockers

- None currently identified

### Dependencies

- Depends on Stage 3 (bearer-token files must have all imports removed from other files first, though deletion happens in Stage 3)

### Completion Criteria

- ✅ `apps/web/src/core/auth/auth-client.ts` does NOT contain `oneTimeTokenClient` plugin
- ✅ `apps/web/src/core/auth/auth-client.ts` does NOT contain `auth: { type: 'Bearer' }` config
- ✅ `apps/web/src/core/auth/auth-client.ts` contains `credentials: 'include'` in fetchOptions
- ✅ `apps/web/src/core/auth/auth-client.ts` does NOT call `getBearerToken()`, `setBearerToken()`, or `clearBearerToken()`
- ✅ No references to `set-auth-token` header in auth-client.ts
- ✅ `bun run --filter web typecheck` passes
- ✅ `bun run --filter web test` passes

### Suggested Commit Message

```
refactor(web): simplify auth client for session cookie authentication

- Remove oneTimeTokenClient plugin (no longer needed)
- Remove bearer token auth configuration
- Add credentials: 'include' for automatic cookie forwarding
- Simplify onSuccess handler (no token management)

Auth now relies on HttpOnly session cookies set by API, avoiding
localStorage and cross-origin token exchange complexity.
```

---

## Stage 5: Web App Sign-In, Callback, and Provider Updates

### Status

`Pending`

### Goal

Update all sign-in components to use absolute callback URLs, completely rewrite the OAuth callback handler with error handling, and update providers configuration to remove token provider and bearer token clearing.

### Files

- `apps/web/src/features/auth/components/*` — All sign-in components (grep for buildOAuthCallbackURL usage)
- `apps/web/src/app/auth/callback/page.tsx` — Complete rewrite
- `apps/web/src/core/providers.tsx` — Remove token provider, update unauthorized handler
- `apps/web/src/core/http.ts` (if exists in web app) — Ensure credentials: 'include' is set

### Changes

**File 1: Sign-in components (all files using buildOAuthCallbackURL)**

Before (example):

```typescript
import { buildOAuthCallbackURL } from '@/core/auth/build-oauth-callback-url';

function SignInButton({ provider }: { provider: 'google' | 'apple' }) {
  const handleSignIn = () => {
    const callbackURL = buildOAuthCallbackURL('/dashboard');  // ❌ Bridge URL
    authClient.signIn.social({ provider, callbackURL });
  };

  return <button onClick={handleSignIn}>Sign in with {provider}</button>;
}
```

After:

```typescript
// ❌ Remove buildOAuthCallbackURL import

function SignInButton({ provider }: { provider: 'google' | 'apple' }) {
  const webBaseUrl = config.PUBLIC.WEB_URL;  // Use env var for staging/dev
  const redirectDest = '/dashboard';

  const handleSignIn = () => {
    // ✅ ABSOLUTE URL pointing to web app
    authClient.signIn.social({
      provider,
      callbackURL: `${webBaseUrl}/auth/callback?redirect=${encodeURIComponent(redirectDest)}`
    });
  };

  return <button onClick={handleSignIn}>Sign in with {provider}</button>;
}
```

**⚠️ CRITICAL**: CallbackURL MUST be absolute URL. Relative paths resolve against better-auth's baseURL (the API), causing browser to land on api.salafidurus.com/auth/callback (wrong).

**File 2: apps/web/src/app/auth/callback/page.tsx — Complete rewrite**

Full implementation:

```typescript
'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authClient } from '@/core/auth/auth-client';
import Link from 'next/link';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isLoading, error } = authClient.useSession();
  const [timeoutError, setTimeoutError] = useState(false);

  // ✅ Handle OAuth provider errors (user denied, invalid state, etc.)
  const oauthError = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (oauthError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Failed</h1>
          <p className="text-gray-600 mb-4">
            {errorDescription || `Error: ${oauthError}`}
          </p>
          <Link
            href="/sign-in"
            className="text-blue-600 hover:underline"
          >
            Try again
          </Link>
        </div>
      </div>
    );
  }

  // ✅ Timeout after 10 seconds to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        setTimeoutError(true);
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, [isLoading]);

  if (timeoutError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Timeout</h1>
          <p className="text-gray-600 mb-4">
            Authentication is taking longer than expected.
          </p>
          <Link
            href="/sign-in"
            className="text-blue-600 hover:underline"
          >
            Please try again
          </Link>
        </div>
      </div>
    );
  }

  // ✅ Handle better-auth session errors
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
          <p className="text-gray-600 mb-4">
            {error.message || 'An unexpected error occurred.'}
          </p>
          <Link
            href="/sign-in"
            className="text-blue-600 hover:underline"
          >
            Try again
          </Link>
        </div>
      </div>
    );
  }

  // ✅ Main authentication flow
  useEffect(() => {
    if (isLoading) return;

    if (session?.user) {
      // Session is valid (cookie was set during OAuth flow)
      const redirect = searchParams.get('redirect') || '/';
      router.replace(redirect);
    } else {
      // No session, OAuth failed silently
      router.replace('/sign-in?error=no_session');
    }
  }, [session, isLoading, router, searchParams]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Completing sign-in...</p>
        </div>
      </div>
    );
  }

  return null;
}
```

Key changes:

- ❌ Remove `oneTimeToken.verify()` call
- ✅ Use `authClient.useSession()` to detect session from cookie
- ✅ Add comprehensive error handling (OAuth errors, timeout, session errors)
- ✅ Add user-friendly error pages with retry links
- ✅ Session cookie is automatically set by better-auth during OAuth callback

**File 3: apps/web/src/core/providers.tsx**

Before:

```typescript
useEffect(() => {
  const apiBaseUrl = config.PUBLIC.API.URL;
  initApiClient({ baseUrl: apiBaseUrl });
  setAccessTokenProvider(() => getBearerToken()); // ❌ Remove
  setLocaleProvider(() => i18n.language);
}, [apiBaseUrl]);

useEffect(() => {
  setUnauthorizedHandler(() => {
    clearBearerToken(); // ❌ Remove
    authClient.signOut().then(() => {
      window.location.href = "/sign-in";
    });
  });
}, []);
```

After:

```typescript
useEffect(() => {
  const apiBaseUrl = config.PUBLIC.API.URL;
  initApiClient({ baseUrl: apiBaseUrl });
  // Remove setAccessTokenProvider - cookies handled automatically
  setLocaleProvider(() => i18n.language);
}, [apiBaseUrl]);

useEffect(() => {
  setUnauthorizedHandler(() => {
    // Remove clearBearerToken() - no more bearer tokens
    authClient.signOut().then(() => {
      window.location.href = "/sign-in";
    });
  });
}, []);
```

Changes:

- ❌ Remove `setAccessTokenProvider()` call
- ❌ Remove `getBearerToken` import and usage
- ❌ Remove `clearBearerToken()` call from unauthorized handler
- ✅ Keep `setLocaleProvider()` for Accept-Language header
- ✅ Keep sign-out redirect logic

### Blockers

- None currently identified

### Dependencies

- Depends on Stage 4 (auth client must be updated first)
- Affects Stage 3 (bearer-token imports must be removed before file deletion)

### Completion Criteria

- ✅ All sign-in components use absolute callback URLs pointing to web app
- ✅ All sign-in components removed `buildOAuthCallbackURL` import
- ✅ `apps/web/src/app/auth/callback/page.tsx` is completely rewritten with error handling
- ✅ No `oneTimeToken.verify()` call in callback handler
- ✅ Callback handler uses `authClient.useSession()` to detect session
- ✅ `apps/web/src/core/providers.tsx` does NOT call `setAccessTokenProvider()`
- ✅ `apps/web/src/core/providers.tsx` does NOT contain `getBearerToken` or `clearBearerToken()` calls
- ✅ `bun run --filter web typecheck` passes
- ✅ `bun run --filter web test` passes

### Suggested Commit Message

```
refactor(web): migrate to direct oauth flow with session cookies

- Update all sign-in components to use absolute callback URLs
- Remove buildOAuthCallbackURL utility usage (replaced with env-aware absolute URLs)
- Rewrite OAuth callback handler with comprehensive error handling
- Remove token provider configuration from providers
- Remove bearer token clearing from unauthorized handler

OAuth now redirects directly from providers to web app callback page,
where better-auth session cookie is detected and user is redirected
to their destination. No bridge endpoint or OTT exchange needed.
```

---

## Stage 6: Shared Packages and Documentation Updates

### Status

`Pending`

### Goal

Update shared packages to document the new authentication architecture and rewrite authentication documentation.

### Files

- `packages/core-contracts/src/http.ts` — Add documentation comments
- `packages/core-api/README.md` — Create/update with auth modes documentation
- `docs/auth.md` — Complete rewrite (232 lines of old cross-origin architecture)

### Changes

**File 1: packages/core-contracts/src/http.ts**

Add JSDoc comments to HttpClientConfig type to clarify authentication modes:

```typescript
export type HttpClientConfig = {
  baseUrl: string;

  /**
   * (Optional) Legacy bearer token provider.
   * Primary auth is via cookies (credentials: 'include').
   * Supported for backward compatibility and native app.
   */
  getAccessToken?: () => string | undefined | null;

  /**
   * (Required for native) Cookie string provider.
   * RN fetch has no cookie jar, so must manually forward session cookie.
   */
  getCookie?: () => string | undefined | null;

  /** (Optional) Current locale for Accept-Language header */
  getLocale?: () => string | undefined | null;

  /** (Optional) Callback for 401 responses (session expiry) */
  onError?: (status: number) => void;
};
```

Verify that fetch calls include `credentials: 'include'`:

```typescript
const response = await fetch(url, {
  method: options.method,
  headers,
  body: options.body,
  credentials: "include", // ✅ Must be present for cookies
  signal,
});
```

**File 2: packages/core-api/README.md**

Create or update with authentication modes section:

````markdown
# Core API Client

Platform-agnostic HTTP client with authentication support.

## Authentication Modes

### Web (Cookie-based)

Session cookies are automatically included with `credentials: 'include'`.
No token provider needed. Cookies are set by the API after OAuth
and automatically forwarded by the browser.

### Native (Cookie forwarding)

Uses `setCookieProvider()` to manually forward session cookie:

```typescript
setCookieProvider(() => authClient.getCookie());
```
````

React Native fetch has no built-in cookie jar, so cookies are
forwarded via the Cookie header.

### Legacy (Bearer token)

Supported via `setAccessTokenProvider()` for backward compatibility.
Not recommended for new implementations.

```

**File 3: docs/auth.md — Complete rewrite**

Create comprehensive documentation covering:
- Architecture overview (same-domain cookies vs old cross-origin bearer tokens)
- Cookie security (HttpOnly, Secure, SameSite=Lax)
- Session lifecycle (7-day expiry, refresh policy)
- OAuth flow (direct to web app, no bridge)
- Platform-specific implementations (web, native)
- Testing strategies
- Deployment checklist
- Troubleshooting guide

Reference the plan file for detailed content structure.

### Blockers
- None currently identified

### Dependencies
- Depends on Stage 5 (all code changes must be complete before documenting)

### Completion Criteria
- ✅ `packages/core-contracts/src/http.ts` contains JSDoc comments documenting auth modes
- ✅ `packages/core-contracts/src/http.ts` includes `credentials: 'include'` in fetch calls
- ✅ `packages/core-api/README.md` exists and documents Web, Native, and Legacy auth modes
- ✅ `docs/auth.md` is completely rewritten with same-domain cookie architecture
- ✅ `docs/auth.md` includes OAuth flow diagram/explanation (direct to web app)
- ✅ `docs/auth.md` documents session expiry and refresh policy
- ✅ `docs/auth.md` includes security considerations (HttpOnly, Secure, SameSite)
- ✅ Markdown linting passes (`markdownlint`)

### Suggested Commit Message
```

docs: update auth documentation for same-domain session cookies

- Add JSDoc comments to HttpClientConfig in core-contracts
- Create core-api README with auth modes (Web, Native, Legacy)
- Rewrite docs/auth.md covering new same-domain architecture

Documents cookie-based authentication, session lifecycle, OAuth flow,
platform-specific implementations, and security considerations.

````

---

## Stage 7: Test File Updates and Cleanup

### Status
`Pending`

### Goal
Delete test files for removed code and create/update tests for the new callback handler implementation.

### Files
- `apps/web/src/core/auth/bearer-token.spec.ts` — **DELETE**
- `apps/web/src/features/auth/oauth-callback-url.spec.ts` — **DELETE or REWRITE** (if exists)
- `apps/api/src/modules/auth/auth-bridge.controller.spec.ts` — **DELETE**
- `apps/web/src/app/auth/callback/page.spec.tsx` or `apps/web/src/app/auth/callback/__tests__/page.test.tsx` — **CREATE or UPDATE**
- `apps/api/src/modules/auth/auth.integration.spec.ts` — **UPDATE** (OAuth flow changed)
- `apps/api/src/modules/auth/auth.guard.spec.ts` — **VERIFY/UPDATE** (if guard logic changes)

### Changes

**Deletions**:
1. Delete `apps/web/src/core/auth/bearer-token.spec.ts` (tests deleted code)
2. Delete `apps/web/src/features/auth/oauth-callback-url.spec.ts` (if exists, tests deleted code)
3. Delete `apps/api/src/modules/auth/auth-bridge.controller.spec.ts` (tests deleted code)

**New/Updated Tests**:

**File 1: apps/web/src/app/auth/callback/__tests__/page.test.tsx**

Create comprehensive tests for callback handler:
- Render loading state while session is being fetched
- Display OAuth provider error if `error` query param present
- Display timeout error if session fetch takes > 10 seconds
- Display session error if `authClient.useSession()` returns error
- Redirect to destination if session exists and `redirect` query param present
- Redirect to home (/) if session exists and no `redirect` query param
- Redirect to sign-in with error if session is not created after OAuth

Example structure:
```typescript
describe('AuthCallbackPage', () => {
  it('displays loading state while session is fetched', () => {
    // Render page, verify loading spinner visible
  });

  it('displays OAuth provider error if error query param present', () => {
    // Navigate to /auth/callback?error=access_denied
    // Verify error message displayed and retry link present
  });

  it('times out after 10 seconds', () => {
    // Mock session loading indefinitely
    // Wait 10+ seconds
    // Verify timeout error message displayed
  });

  it('redirects to destination if session exists with redirect param', () => {
    // Mock successful session
    // Navigate to /auth/callback?redirect=/dashboard
    // Verify router.replace called with /dashboard
  });

  it('redirects to home if session exists without redirect param', () => {
    // Mock successful session
    // Navigate to /auth/callback
    // Verify router.replace called with /
  });

  it('redirects to sign-in if session is not created', () => {
    // Mock useSession returning null (no session)
    // Navigate to /auth/callback
    // Verify router.replace called with /sign-in?error=no_session
  });
});
````

**File 2: apps/api/src/modules/auth/auth.integration.spec.ts**

Update OAuth flow tests to verify direct cookie setting:

- Remove tests that verify OTT generation and exchange
- Add tests for direct OAuth callback to `/api/auth/callback/{provider}`
- Verify session cookie is set with correct attributes (domain, sameSite, httpOnly, secure)
- Verify CORS headers are correct on preflight and POST requests
- Test session refresh and expiry

**File 3: apps/api/src/modules/auth/auth.guard.spec.ts**

Verify (or update if needed):

- Tests for session cookie validation
- Tests for protected routes requiring authentication
- Tests for role-based access control with session

### Blockers

- None currently identified

### Dependencies

- Depends on Stage 5 (all code changes must be complete before test updates)
- Stage 3 deletion depends on this stage completing (bearer-token test file deleted here)

### Completion Criteria

- ✅ `apps/web/src/core/auth/bearer-token.spec.ts` is deleted
- ✅ `apps/web/src/features/auth/oauth-callback-url.spec.ts` is deleted (if existed)
- ✅ `apps/api/src/modules/auth/auth-bridge.controller.spec.ts` is deleted
- ✅ `apps/web/src/app/auth/callback/__tests__/page.test.tsx` exists with comprehensive error handling tests
- ✅ `apps/api/src/modules/auth/auth.integration.spec.ts` is updated for direct OAuth flow
- ✅ Tests verify session cookie is set with correct security attributes
- ✅ `bun run --filter web test` passes
- ✅ `bun run --filter api test` passes
- ✅ No regression in other test files

### Suggested Commit Message

```
test: update auth tests for session cookie implementation

- Delete bearer token and OAuth bridge test files
- Create comprehensive callback handler tests (errors, timeouts, redirects)
- Update OAuth integration tests for direct cookie flow
- Verify session cookie security attributes in tests

Tests now cover OAuth provider errors, timeouts, session validation,
and redirect logic for direct OAuth-to-web-app flow with session cookies.
```

---

## Final Verification

After all 7 stages are completed, run the following verification suite:

### Monorepo-wide Checks

```bash
# Type checking across all workspaces
bun run typecheck

# Linting across all workspaces
bun run lint

# Tests across all workspaces
bun run test

# Build all apps and packages
bun run build
```

### Specific Validations

**API (apps/api)**:

- ✅ API starts without errors: `bun run --filter api dev`
- ✅ Cookie is set on OAuth callback with correct attributes (use Postman/curl or browser DevTools)
- ✅ Session persists on protected endpoints
- ✅ Session expires and refreshes correctly
- ✅ CORS headers correct on OPTIONS and POST requests

**Web (apps/web)**:

- ✅ Web app loads without errors: `bun run --filter web dev`
- ✅ OAuth flow works end-to-end (Google and Apple)
- ✅ Session persists across page reloads
- ✅ Protected routes redirect to sign-in when unauthenticated
- ✅ Admin routes check permissions correctly
- ✅ localStorage contains NO bearer tokens
- ✅ Browser DevTools shows session cookie with correct domain and flags

**Native (apps/native)**:

- ✅ Native app still works (no code changes)
- ✅ Google OAuth flow works
- ✅ Apple native sign-in works
- ✅ Session persists across app restarts
- ✅ SecureStore still contains session cookie

**Cross-platform**:

- ✅ Sign in on web, verify session works on native (if testing concurrent sessions)
- ✅ Sign out on web, verify logged out on native
- ✅ Permission checks work across platforms

---

## Plan Completion

The plan is **complete** when:

1. ✅ All 7 implementation stages are completed and committed
2. ✅ All tests pass: `bun run test`
3. ✅ All type checks pass: `bun run typecheck`
4. ✅ All linting passes: `bun run lint`
5. ✅ All builds succeed: `bun run build`
6. ✅ OAuth flow tested end-to-end in staging (Google + Apple)
7. ✅ Session cookies verified in browser DevTools with correct security flags
8. ✅ No bearer tokens in localStorage
9. ✅ Native app continues to work unchanged
10. ✅ Documentation is updated and reflects new architecture

### Archival Action

Once all completion criteria are met:

1. Update this plan's Status to `Completed`
2. Move this file to `.agents/plans/completed/2026-07-17-auth-migration-same-domain-cookies.md`
3. Create a summary of:
   - Actual commits made (with hashes)
   - Any deviations from the original plan
   - Key learnings or blocking issues encountered
   - Timeline (if tracking)

---

## Notes

- **Session Expiry Policy**: Configured to 7 days with daily refresh on active use. Can be adjusted in Stage 1 if needed.
- **OAuth Provider Configuration**: MUST be done externally before Stage 1 deployment. Redirect URIs must be set in Google Cloud Console and Apple Developer Portal.
- **Rollback Plan**: If issues occur, revert web deployment (restore bearer token code). API deployment stays — cookie config is backward compatible.
- **Cross-browser Testing**: Pay special attention to Safari ITP (Intelligent Tracking Prevention) and browser privacy settings. Same-domain cookies should work in all browsers.
- **Database Backup**: Back up production database before deploying to production as a precaution (clean cutover means all users re-authenticate).
