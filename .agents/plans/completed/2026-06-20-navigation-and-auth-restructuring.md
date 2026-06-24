# Deep Implementation Plan — Restructuring Navigation, Route Access Refactor, I18n Consistency, and Feed/Live Modernization (Web & Mobile)

This document is the full technical specification for restructure operations across the monorepo. It covers the Edge API/proxy route checks, the Next.js web application (`apps/web`), and the Expo-based native application (`apps/native`), ensuring consistency, token-driven aesthetics, and unified access logic.

---

# Architectural Principles & Decision Rationales

Every technical decision in this plan is designed to optimize security, prevent visual drift, and ensure code maintainability.

## 1. Centralized Route Access Control

- **Our Selection**: Next.js Edge middleware (`proxy.ts`) and a React Native route guard (`RouteAccessGuard`) both import a unified route registry (`routeDefinitions`, `resolveRouteAccess`) from the shared `@sd/core-contracts` package.
- **Why this method?** Checking authentication status at the rendering boundary prevents "flash-of-content" UI issues and security bypasses. Longest-prefix matching prevents nested subroutes (e.g. `/feed/following`) from accidentally matching parent rules (e.g. `/feed`), preventing authorization leaks. This also fixes the current drift where `proxy.ts` hardcodes a `PROTECTED_PATHS` list that disagrees with `routes.ts`.
- **Why a guard on both platforms?**
  - _Web_: Next.js App Router Edge middleware checks routes server-side before pages load.
  - _Mobile_: Rather than checking auth inside each page, a **declarative** route guard reads the current path via Expo Router and renders `<Redirect href="/sign-in" />` when access is restricted. Updates to the registry apply globally to both platforms without page-by-page coding.
- **Native technique — declarative `<Redirect>`, not imperative `useEffect`.** Per the Expo Router docs ([Authentication](https://docs.expo.dev/router/advanced/authentication.md) / [redirects](https://docs.expo.dev/router/advanced/authentication-rewrites.md)), the idiomatic redirect is the `<Redirect>` component. This app runs `expo-router ~56`, so it is available. It avoids flash-of-content, redirect loops, and manual loop-guarding, and handles deep links. The guard is mounted at the `(tabs)` layout (one level below the root navigator) to avoid the `Attempted to navigate before mounting the Root Layout` error.
- **Rejected Alternatives**:
  - _Imperative `useEffect` + `router.replace` provider_: works but is the legacy pattern; causes a brief render of the protected screen and needs manual loop-guards.
  - _`<Stack.Protected guard={...}>`_: clean and declarative, but its redirect target is the stack's _anchor / first-available screen_, not `/sign-in`. With only specific leaves gated, users would fall back to the sibling index instead of sign-in. Fits only when an entire group is gated.
  - _Client-only component gates_: bypassed if client JS fails or is manipulated; flash of unauthorized layout before redirect.
  - _Scattered URL lists_: string arrays of private paths inside `proxy.ts` and native routes drift between web and mobile (the current bug).

## 2. Dynamic vs. Statically Parseable i18n Translation Helper

- **Our Selection**: Centralized translation-key builder functions (`getSubnavLabel`, `getEmptyStateText`, `getErrorStateText`) plus a static `SUBNAV_KEYS` map in `packages/core-i18n`.
- **Why this method?** Extraction tools (e.g. `i18next-parser`) parse literal strings passed to `t()`. Dynamic template strings (``t(`navigation.${section}.${tabId}`)``) cannot be parsed statically, leaving locale files incomplete. Helpers localize key construction in one place while exporting static string mappings tools can trace.
- **Rejected Alternatives**:
  - _Concatenated inline keys_ (`t('nav.' + section + '.' + id)`): missing translations in catalogs due to parsing failures, plus duplicated logic.

## 3. Strict Theme Tokens First (System-wide Audit)

- **Our Selection**: Audit and replace all hex/rgb colors, pixel spacing, shadows, and fonts in every stylesheet across `apps/web` and `apps/native` with `@sd/design-tokens` values.
- **Why this method?** Theme consistency (dark/light mode) depends on semantic tokens. Hardcoded styles bypass dark-mode and cause misalignment.
- **Rejected Alternatives**:
  - _Only modifying touched files_: leaves legacy screens inconsistent with the modernized layout. (Decision: **full system-wide sweep**.)

---

# Delivery: Branches & Worktrees

The work ships as **three independent branches + worktrees**, each independently reviewable, runnable, and revertable. Recommended merge order **1 → 2 → 3** — Branch 3's system-wide token sweep otherwise conflicts with Branch 2's navigation CSS, so create/rebase Branch 3 after Branch 2 lands.

| Branch               | Worktree                        | Theme                                 | Phases  |
| -------------------- | ------------------------------- | ------------------------------------- | ------- |
| `f/route-access`     | `.worktrees/f-route-access`     | Access control + admin provisioning   | 1, 2, 8 |
| `f/navigation-i18n`  | `.worktrees/f-navigation-i18n`  | i18n helpers + nav restructure        | 3, 4    |
| `f/feed-live-tokens` | `.worktrees/f-feed-live-tokens` | Token sweep + feed/live modernization | 5, 6, 7 |

**Decisions baked into this plan:** native = global hard redirect to `/sign-in`; design tokens = full system-wide sweep; web subnav = sticky top tabs (single-tier sidebar); route access = preserve current semantics 1:1 and keep all routes; i18n = adopt new naming and migrate existing usages; make-admin = plain Node `.js`.

At the end of every phase, ask the user to verify the app runs before proceeding.

---

# Phase 0: Repository Setup & Worktree Creation

## Objective

Create isolated development environments — one per branch.

### Task 0.1: Create Worktrees

```bash
git fetch origin
git worktree add -b f/route-access     .worktrees/f-route-access     origin/main
git worktree add -b f/navigation-i18n  .worktrees/f-navigation-i18n  origin/main
# Create AFTER f/navigation-i18n merges (or rebase before merge):
git worktree add -b f/feed-live-tokens .worktrees/f-feed-live-tokens origin/main
```

- Change directory context to the relevant worktree per branch.
- Verify the active branch with `git branch`.

### Phase 0 Completion Criteria

- Each worktree shell points at its `.worktrees/*` directory.
- `git status` reports a clean working directory on the expected branch.

---

# Branch 1 — `f/route-access` (Phases 1, 2, 8)

# Phase 1: Route Access Refactor

## Objective

Replace the existing route authorization implementation with a centralized access system, **preserving current semantics 1:1 and keeping all routes**.

### Task 1.1: Refactor Route Types

- File: `packages/core-contracts/src/routes.ts`
- Add alongside the existing `routes` object (keep `routes`):

  ```typescript
  export type RouteAccess = "public" | "auth-optional" | "auth-required";

  export interface RouteDefinition {
    path: string;
    access: RouteAccess;
  }
  ```

### Task 1.2: Define Route Access Registry

- File: `packages/core-contracts/src/routes.ts`
- Map today's `routeAuth` modes: `public→public`, `local-first→auth-optional`, `auth→auth-required`. New gates: `/feed/following`, `/account/profile`, `/admin` → `auth-required`. **Keep every route** (do not drop `library`, `scholars`, etc.).
  ```typescript
  export const routeDefinitions: RouteDefinition[] = [
    { path: "/feed/following", access: "auth-required" }, // NEW gate (was public)
    { path: "/feed", access: "public" },
    { path: "/account/profile", access: "auth-required" }, // NEW gate
    { path: "/account/legal", access: "public" }, // existing override
    { path: "/account", access: "auth-optional" }, // was local-first — keep
    { path: "/library", access: "auth-optional" }, // was local-first — do NOT drop
    { path: "/live", access: "public" },
    { path: "/search", access: "public" },
    { path: "/scholars", access: "public" },
    { path: "/collections", access: "public" },
    { path: "/series", access: "public" },
    { path: "/lectures", access: "public" },
    { path: "/support", access: "public" },
    { path: "/privacy", access: "public" },
    { path: "/terms-of-use", access: "public" },
    { path: "/admin", access: "auth-required" }, // matches proxy intent
    { path: "/", access: "public" },
  ];
  ```
- Remove legacy `RouteAuthMode`, `routeAuth`, `routeAuthOverrides`, `getEffectiveAuthMode`.

### Task 1.3: Create resolveRouteAccess()

- File: `packages/core-contracts/src/routes.ts`

  ```typescript
  export function resolveRouteAccess(pathname: string): RouteAccess {
    // 1. Normalize trailing slash
    const normalizedPath = pathname === "/" ? "/" : pathname.replace(/\/$/, "");

    // 2. Sort definitions by length descending (longest prefix matching)
    const sortedDefs = [...routeDefinitions].sort((a, b) => b.path.length - a.path.length);

    // 3. Find match
    for (const def of sortedDefs) {
      if (normalizedPath === def.path || normalizedPath.startsWith(`${def.path}/`)) {
        return def.access;
      }
    }

    return "public"; // Fallback default
  }
  ```

### Task 1.4: Update Barrels

- Update **both** `packages/core-contracts/src/index.ts` **and** `packages/core-contracts/src/index.node.ts`:
  - Drop `RouteAuthMode`, `routeAuth`, `routeAuthOverrides`, `getEffectiveAuthMode`.
  - Export `RouteAccess`, `RouteDefinition`, `routeDefinitions`, `resolveRouteAccess`.
  - Keep exporting `routes`.

### Task 1.5: Update Unit Tests (Jest)

- File: `packages/core-contracts/src/routes.spec.ts` (runner: `jest --passWithNoTests`)
- Replace the `routeAuth`/`routeAuthOverrides` assertions with `resolveRouteAccess` cases:
  - Longest prefix: `resolveRouteAccess("/feed/following")` → `"auth-required"`; `resolveRouteAccess("/feed")` → `"public"`.
  - Trailing slash: `resolveRouteAccess("/account/profile/")` → `"auth-required"`.
  - Nested paths: `resolveRouteAccess("/live/session-123")` → `"public"`; `resolveRouteAccess("/account/profile/edit")` → `"auth-required"`.
  - Override + fallback: `/account/legal` → `"public"`; `/account` → `"auth-optional"`; unknown path → `"public"`.

### Phase 1 Completion Criteria

- `pnpm --filter core-contracts test` passes 100% of tests.
- `pnpm --filter core-contracts typecheck` passes.
- Centralized routing functions match all prefix and nested paths.

### Phase 1 Commit Point

- **Commit Message**: `feat(contracts): refactor route access types and implement resolveRouteAccess`

---

# Phase 2: Route Access Integration

## Objective

Enforce the route access registry inside the Web middleware and the Native navigation globally.

### Task 2.1: Update Next.js proxy.ts

- File: `apps/web/src/proxy.ts`
- Delete the hardcoded `PROTECTED_PATHS`/`AUTH_PATHS`. Import `resolveRouteAccess` from `@sd/core-contracts`.

  ```typescript
  const access = resolveRouteAccess(pathname);
  const sessionToken = request.cookies.get("better-auth.session_token");
  const isAuthenticated = !!sessionToken?.value;

  if (access === "auth-required" && !isAuthenticated) {
    const url = new URL("/sign-in", request.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/sign-in") && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
  ```

- Keep the existing `config.matcher`.

### Task 2.2: Implement Mobile RouteAccessGuard (declarative `<Redirect>`)

- File: `apps/native/src/core/auth/RouteAccessGuard.tsx` [NEW]
- Create a registry-driven guard that renders `<Redirect>` when access is restricted (no `useEffect`, no `router.replace`):

  ```tsx
  import { Redirect, Slot, usePathname } from "expo-router";
  import { resolveRouteAccess, routes } from "@sd/core-contracts";
  import { useAuth } from "./use-auth";

  export function RouteAccessGuard() {
    const pathname = usePathname(); // group segments stripped → "/feed/following", "/account/profile"
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return null; // keep splash visible / render a loading state to match app behavior
    }

    if (resolveRouteAccess(pathname) === "auth-required" && !isAuthenticated) {
      return <Redirect href={routes.signIn} />;
    }

    return <Slot />;
  }
  ```
  - `useAuth()` from `apps/native/src/core/auth/use-auth.ts` returns `{ isAuthenticated, isLoading, user }`.

### Task 2.3: Mount the guard at the `(tabs)` layout (not the root provider)

- File: `apps/native/src/app/(tabs)/_layout.tsx`
- Render `<RouteAccessGuard />` around the tabs navigator. It must sit **one level below the root navigator**; rendering `<Redirect>` above the root `<Stack>` triggers `Attempted to navigate before mounting the Root Layout`. Therefore it does **not** go in `apps/native/src/core/providers.tsx`. The auth/i18n/query context from `Providers` (root `_layout.tsx`) is still in scope.
- Remove the manual page-level auth check from `apps/native/src/app/(tabs)/account/profile.tsx` and the inline `AuthRequiredState` gate from `apps/native/src/app/(tabs)/feed/following.tsx`. These routes now hard-redirect to `/sign-in` centrally.
- _(Verify native admin route pathnames under `account/(admin)` resolve to a path the registry gates as intended; add an explicit registry entry if not.)_

### Phase 2 Completion Criteria

- Visiting `/feed/following` or `/account/profile` unauthenticated on web redirects to `/sign-in`.
- Navigating to `/feed/following` or `/account/profile` unauthenticated on mobile redirects to the native `/sign-in` screen.

### Phase 2 Commit Point

- **Commit Message**: `feat(web/native): enforce route access registry in web proxy and native route guard`

---

# Phase 8: Manual & Automated Admin Configuration

## Objective

Provide SQL guides and an automated command-line script for assigning admin roles and permissions.

### Task 8.1: Create database-admin-setup.md

- File: `docs/database-admin-setup.md` [NEW]
- Document manual and automated processes to assign roles and permissions.

#### SQL Commands for User Promotion

```sql
-- 1. Promote User Role to 'admin'
UPDATE "User"
SET role = 'admin'
WHERE email = 'user@example.com';

-- 2. Grant Required Admin Permissions
--    AdminPermission has a composite primary key @@id([userId, permission]),
--    so ON CONFLICT targets those two columns.
INSERT INTO "AdminPermission" ("userId", "permission", "grantedAt", "grantedById")
SELECT id, 'manage:scholars', NOW(), NULL FROM "User" WHERE email = 'user@example.com'
UNION ALL
SELECT id, 'manage:topics', NOW(), NULL FROM "User" WHERE email = 'user@example.com'
UNION ALL
SELECT id, 'manage:content', NOW(), NULL FROM "User" WHERE email = 'user@example.com'
UNION ALL
SELECT id, 'manage:livestreams', NOW(), NULL FROM "User" WHERE email = 'user@example.com'
UNION ALL
SELECT id, 'manage:users', NOW(), NULL FROM "User" WHERE email = 'user@example.com'
UNION ALL
SELECT id, 'manage:admin', NOW(), NULL FROM "User" WHERE email = 'user@example.com'
ON CONFLICT ("userId", "permission") DO NOTHING;
```

#### SQL Commands for Verifying Roles & Permissions

```sql
-- Verify User Role
SELECT id, name, email, role FROM "User" WHERE email = 'user@example.com';

-- Verify Granted Permissions
SELECT p.permission, p."grantedAt", u.email AS granter_email
FROM "AdminPermission" p
LEFT JOIN "User" u ON p."grantedById" = u.id
WHERE p."userId" = (SELECT id FROM "User" WHERE email = 'user@example.com');
```

- Prisma Studio instructions:
  - Run `pnpm --filter core-db prisma studio`.
  - Double-click `User.role` and set `admin`.
  - Add the required rows to the `AdminPermission` table.
- Neon instructions:
  - Run the SQL scripts in the Neon Console SQL Editor.
- File: `docs/database.md` — reference the new document in the migrations section.

### Task 8.2: Create the make-admin Script (plain Node `.js`)

- File: `packages/core-db/scripts/make-admin.js` [NEW]
- Match the sibling scripts: run with `node`, load env via the existing helper (`load-db-env.js` / `db-env.js`), and import the generated Prisma client via the **relative path** `../src/generated/prisma/client` (the in-package convention used by `prisma/migrations/seed-locale-normalise.ts`; works right after `prisma:generate`, no `dist` build needed). Import the permission set from **`ADMIN_PERMISSIONS` in `@sd/core-contracts`** (the canonical enum the API enforces — defined in `packages/core-contracts/src/types/admin.types.ts`) instead of hardcoding. Do **not** use `ts-node` or bare `@prisma/client`.

  ```js
  // Follow the sibling scripts' env-loading pattern (e.g. require("./load-db-env")).
  require("./load-db-env");
  const { PrismaClient } = require("../src/generated/prisma/client");
  const { ADMIN_PERMISSIONS } = require("@sd/core-contracts"); // single source of truth

  async function main() {
    const email = process.argv[2];
    if (!email) {
      console.error("Usage: pnpm --filter core-db make-admin <email>");
      process.exit(1);
    }

    const prisma = new PrismaClient();
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        console.error(`User with email ${email} not found.`);
        process.exit(1);
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { role: "admin" },
      });

      for (const permission of ADMIN_PERMISSIONS) {
        await prisma.adminPermission.upsert({
          where: { userId_permission: { userId: user.id, permission } },
          create: { userId: user.id, permission },
          update: {},
        });
      }

      console.log(`Successfully made user ${email} an admin with all permissions.`);
    } catch (err) {
      console.error("Error promoting user:", err);
      process.exitCode = 1;
    } finally {
      await prisma.$disconnect();
    }
  }

  main();
  ```

- Add the script shortcut to `packages/core-db/package.json`:
  ```json
  "scripts": {
    "make-admin": "node ./scripts/make-admin.js"
  }
  ```
- Usage:

  ```bash
  # Local
  pnpm --filter core-db make-admin user@example.com

  # Against a Neon preview/production DB
  DATABASE_URL="postgresql://user:pass@ep-...neon.tech/neondb" pnpm --filter core-db make-admin user@example.com
  ```

### Phase 8 Completion Criteria

- The Node promotion script runs locally and promotes a user successfully.
- Manual admin instructions exist in `docs/` with verified SQL and Neon guidance.

### Phase 8 Commit Point

- **Commit Message**: `docs/db: add make-admin CLI utility and database-admin-setup.md guide`

---

# Branch 2 — `f/navigation-i18n` (Phases 3, 4)

# Phase 3: Internationalization Consistency Refactor

## Objective

Expand language files, **adopt consistent key naming and migrate existing usages**, and centralize key construction with static mapping functions.

### Task 3.1: Expand & Migrate Namespaces in Translation Files

- Files: `packages/core-i18n/src/locales/en.json` & `ar.json`
- Establish the consistent structure below, and **migrate the existing ad-hoc `live.*` keys** (`liveNow`, `upcoming`, `recentlyEnded`, `emptyLive`, `emptyUpcoming`, `emptyEnded`) to it — then update every consumer (web `live.screen.desktop.tsx`, native `live.screen.tsx`):
  ```json
  "navigation": {
    "subnav": {
      "feed":    { "popular": "Popular", "recent": "Recent", "following": "Following" },
      "live":    { "ongoing": "Live Now", "scheduled": "Scheduled", "ended": "Ended" },
      "library": { "saved": "Saved", "completed": "Completed" },
      "account": { "profile": "Profile", "legal": "Legal" }
    }
  },
  "feed": {
    "loading": "Loading feed...",
    "empty": "No lectures available in this feed.",
    "error": "Failed to load feed content.",
    "retry": "Try Again"
  },
  "live": {
    "loading": "Loading streams...",
    "empty": "No live sessions at the moment.",
    "error": "Failed to check live sessions.",
    "retry": "Retry",
    "sections": { "ongoing": "Live Now", "scheduled": "Upcoming", "ended": "Recently Ended" }
  }
  ```
  _(Define matching translated counterparts in `ar.json`.)_

### Task 3.2: Create Translation Helper Utilities

- File: `packages/core-i18n/src/translation-helpers.ts` [NEW]

  ```typescript
  export const SUBNAV_KEYS: Record<string, Record<string, string>> = {
    feed: {
      popular: "navigation.subnav.feed.popular",
      recent: "navigation.subnav.feed.recent",
      following: "navigation.subnav.feed.following",
    },
    live: {
      ongoing: "navigation.subnav.live.ongoing",
      scheduled: "navigation.subnav.live.scheduled",
      ended: "navigation.subnav.live.ended",
    },
    library: {
      saved: "navigation.subnav.library.saved",
      completed: "navigation.subnav.library.completed",
    },
    account: {
      profile: "navigation.subnav.account.profile",
      legal: "navigation.subnav.account.legal",
    },
  };

  export function getSubnavLabel(
    section: string,
    tabId: string,
    t: (key: string, fallback?: string) => string,
  ): string {
    const key = SUBNAV_KEYS[section]?.[tabId];
    return key ? t(key) : tabId;
  }

  export function getEmptyStateText(feature: "feed" | "live", t: (key: string) => string): string {
    return t(`${feature}.empty`);
  }

  export function getErrorStateText(feature: "feed" | "live", t: (key: string) => string): string {
    return t(`${feature}.error`);
  }
  ```

- Export all helpers from `packages/core-i18n/src/index.ts`.

### Task 3.3: Consolidate SECTION_TABS into `@sd/core-contracts`

The web and native nav config files (`apps/web/src/features/navigation/types.ts` and `apps/native/src/features/navigation/types.ts`) are currently **byte-identical** duplicates, and `icon` is a plain string name (e.g. `"flame"`, `"radio"`) resolved to a component per-platform — so the whole module is shareable.

- File: `packages/core-contracts/src/navigation.ts` [NEW] — move `Section`, `TabConfig`, `SECTION_TABS`, `DEFAULT_TABS`, `SECTION_LABELS`, `SECTION_ROUTES` here (it already depends only on `routes` from this package). Add a `labelKey` (literal i18n key string) to `TabConfig` and to every tab entry, e.g. `{ id: "popular", icon: "flame", labelKey: "navigation.subnav.feed.popular" }`. Export from both barrels (`index.ts` + `index.node.ts`).
- Update `apps/web/.../navigation/types.ts` and `apps/native/.../navigation/types.ts` to re-export from `@sd/core-contracts` (or delete and repoint importers). Icon-string → component mapping stays platform-local (each platform already maps the string, e.g. native's `getSectionTabIcon`).
- _(Branch note: this adds a new file to `@sd/core-contracts` and touches both barrels — the same barrels Branch 1 edits. Minor, expected conflict when rebasing Branch 2 on Branch 1; resolve by keeping both export groups.)_

### Task 3.4: Integrate Helper Utilities in Components

- `getSubnavLabel(section, tabId, t)` resolves the label via the static `SUBNAV_KEYS` map (literal strings → statically extractable, per Principle 2). Keep `SUBNAV_KEYS` in sync with the consolidated `labelKey` values (or derive one from the other).
- Replace the hardcoded `tab.label` renders with `getSubnavLabel(section, tab.id, t)` in every SECTION_TABS consumer:
  - Web: `apps/web/src/features/navigation/components/sidebar/sidebar.desktop.tsx`
  - Web: `apps/web/src/features/navigation/components/sidebar/adaptive-bottom-bar.tsx` _(this file exists — it is a web component)_
  - Native: `apps/native/src/features/navigation/components/SubsectionBarHost/SubsectionBarHost.tsx`
  - Native: `apps/native/src/features/navigation/utils/tab-route-config.ts` (if it reads tab labels)
- _(Note: native `CustomTabBar` already resolves bottom-tab labels via `t(config.labelKey, fallback)` — keep consistent.)_

### Phase 3 Completion Criteria

- All subnavigation tabs, empty messages, loading states, and error buttons are translated.
- The static checker / typecheck passes with no missing-key issues.

### Phase 3 Commit Point

- **Commit Message**: `feat(i18n): centralize translation helpers and migrate nav/feed/live keys`

---

# Phase 4: Navigation Restructuring

## Objective

Split primary section switches from secondary subsection navigation; move web subnav into sticky top tabs.

### Task 4.1: Simplify Desktop Sidebar

- File: `apps/web/src/features/navigation/components/sidebar/sidebar.desktop.tsx`
- Delete the nested subnavigation lists (`styles.subNav` render blocks) completely.
- Sidebar links serve only to switch top-level routes (`/feed`, `/live`, `/library`, `/account`).

### Task 4.2: Modernize Sidebar Styling

- File: `apps/web/src/features/navigation/components/sidebar/sidebar.module.css`
- Refactor styling to tokens:
  - Container: `background: var(--surface-default); border-inline-end: 1px solid var(--border-subtle);`
  - Nav items: `color: var(--content-muted); border-radius: var(--radius-component-chip);`
  - Hover: `color: var(--content-strong); background: var(--surface-hover);`
  - Active: `color: var(--content-primary); background: var(--surface-selected); font-weight: 600;`

### Task 4.3: Implement TopSubnavTabs on Web

- File: `apps/web/src/features/navigation/components/top-subnav-tabs/top-subnav-tabs.tsx` [NEW] — render horizontal tab links; labels via `getSubnavLabel`.
- File: `apps/web/src/features/navigation/components/top-subnav-tabs/top-subnav-tabs.module.css` [NEW]:
  ```css
  .tabsContainer {
    width: 100%;
    position: sticky;
    top: 3.5rem; /* Pinned below TopAuthStrip */
    z-index: 25;
    background: var(--surface-default);
    border-bottom: 1px solid var(--border-subtle);
    backdrop-filter: blur(10px);
    display: flex;
    padding: 0 var(--space-layout-page-x);
    height: 3.25rem;
  }
  .tabLink {
    padding: 0 1rem;
    display: flex;
    align-items: center;
    color: var(--content-muted);
    font-size: var(--typo-label-md-font-size);
    border-bottom: 2px solid transparent;
    transition: all 150ms ease;
  }
  .activeTab {
    color: var(--content-primary);
    border-bottom-color: var(--action-primary);
    font-weight: 500;
  }
  ```

### Task 4.4: Inject TopSubnavTabs in Layout

- File: `apps/web/src/app/(main)/layout.tsx`
- Add `<TopSubnavTabs />` directly below `<TopAuthStrip />` inside the main content area.

### Task 4.5: Update Mobile Navigation

- `SubsectionBarHost.tsx` consumes `getSubnavLabel()` (from Phase 3).
- Align container borders and spacings to design-token (Unistyles theme) values.

### Phase 4 Completion Criteria

- Subnavigations appear as sticky top tabs on desktop web routes.
- Sidebar options remain single-tiered and clean.

### Phase 4 Commit Point

- **Commit Message**: `refactor(web): implement sticky TopSubnavTabs and simplify desktop sidebar`

---

# Branch 3 — `f/feed-live-tokens` (Phases 5, 6, 7)

> Create/rebase after Branch 2 merges so the system-wide sweep also covers the new nav CSS.

# Phase 5: Design Token Adoption & UI Foundation Cleanup (System-Wide)

## Objective

Ensure **system-wide** design-token adoption across **all styling files** in both applications, eliminating hardcoded sizing, spacing, borders, shadows, and colors.

### Task 5.1: Audit and Replace Web Styles

- Scan all `.css` and `.module.css` files under `apps/web/src/`.
- Replace hardcoded hex colors, shadows, border-radiuses, and spacing with variables (e.g. `var(--surface-default)`, `var(--border-subtle)`, `var(--space-component-gap-md)`), generated in `apps/web/src/app/theme-css.ts` from `@sd/design-tokens`.

### Task 5.2: Audit and Replace Mobile Styles

- Scan all `.tsx`/`.ts` Unistyles styling definitions (`StyleSheet.create((theme) => …)`) under `apps/native/src/`.
- Replace literals with Unistyles theme selectors:
  - Spacing: `theme.spacing.scale.sm`, `theme.spacing.component.gapMd`, `theme.spacing.layout.pageX`.
  - Radius: `theme.radius.component.chip`, `theme.radius.component.panel`.
  - Colors: `theme.colors.surface.default`, `theme.colors.border.subtle`, `theme.colors.content.primary`.
  - Shadows: `theme.shadows.*`.

### Task 5.3: Define Style Helpers

- Web: `apps/web/src/features/feed/utils/feed-styles.ts` & `apps/web/src/features/live/utils/live-styles.ts`
- Mobile: `apps/native/src/features/feed/utils/feed-styles.ts` & `apps/native/src/features/live/utils/live-styles.ts`

### Phase 5 Completion Criteria

- Zero custom colors or hardcoded pixel coordinates remain in css/tsx styling sheets.
- Monorepo builds compile cleanly.

### Phase 5 Commit Point

- **Commit Message**: `style(tokens): system-wide migration of styles to design token values on web and mobile`

---

# Phase 6: Feed Modernization (Web & Mobile)

## Objective

Refactor Feed screens and components on both platforms into modern, state-driven interfaces.

### Task 6.1: Define Web Feed Layout

- File: `apps/web/src/features/feed/screens/feed-recent.screen.desktop.tsx`
- Redesign into: Hero header → Filters → Grid layout.
- Cards feature hover transformations, 1px thin borders, and soft shadows (token-driven).
- Data via the existing `useFeed()` hook from `@sd/domain-content`.

### Task 6.2: Define Mobile Feed Layout

- File: `apps/native/src/features/feed/screens/feed.screen.tsx`
- Use Unistyles theming.
- Align cards cleanly; configure a horizontal scholar profile row with circular frames.
- Data via `useFeed()` (`{ data, isFetching, hasNextPage, fetchNextPage }`).

### Task 6.3: Implement Loading Skeletons on Both Platforms

- Web: `<FeedSkeleton />` using gray placeholder boxes.
- Mobile: `<FeedSkeleton />` using React Native Views with subtle animation.

### Task 6.4: Implement Error and Empty States

- Clear error labels, connection alerts, and retry buttons wired to `fetchNextPage`/refresh.
- Empty/loading/error text via the i18n helpers (`getEmptyStateText`/`getErrorStateText`).

### Phase 6 Completion Criteria

- Web and mobile feeds support Loading (skeletons), Error (retry), Empty (localized), and Content states.
- Feed cards feature modern visual styling.

### Phase 6 Commit Point

- **Commit Message**: `ui(feed): modernize feed screens and implement skeleton states on web and mobile`

---

# Phase 7: Live Modernization (Web & Mobile)

## Objective

Modernize Live streaming lists to clearly communicate session status (ongoing, scheduled, ended) using state-driven grids.

### Task 7.1: Build Web Live Grid

- File: `apps/web/src/features/live/screens/live.screen.desktop.tsx`
- Arrange lists into an asymmetrical grid.
- Ongoing card: glowing pulsing red badge and viewer counts.
- Scheduled card: calendar icon and start time.
- Ended card: grayscale styling with an archived badge.
- Data via `useLiveSessions()` from `@sd/domain-live`.

### Task 7.2: Build Mobile Live Feed

- File: `apps/native/src/features/live/screens/live.screen.tsx`
- Restructure stream rows using Unistyles spacing and colors.
- Visual badges for ongoing, scheduled, and ended streams.

### Task 7.3: Implement Skeletons and Empty States

- Skeletons render during load.
- Empty states display localized messages (new `live.*` keys from Phase 3) when no streams exist.

### Phase 7 Completion Criteria

- Web and mobile live lists react to streaming states dynamically.
- Modern visual layout looks polished on both platforms.

### Phase 7 Commit Point

- **Commit Message**: `ui(live): modernize live screens with state-driven grids on web and mobile`

---

## Verification Plan

### Automated Verification

```bash
pnpm --filter core-contracts test          # Branch 1
pnpm --filter core-db make-admin <email>   # Branch 1 (against a test DB)
pnpm --filter web typecheck
pnpm --filter web build
pnpm --filter native typecheck             # note: package name is 'native', not 'mobile'
```

### Manual Verification

- Unauthenticated `/feed/following` & `/account/profile` redirect to `/sign-in` on web and on the Android dev client (Argent MCP; localhost via `adb reverse`).
- Language swap updates all subnav labels and feed/live states correctly.
- Web subnav renders as sticky top tabs; sidebar is single-tier; layouts scroll cleanly under sticky headers.
- Feed/live skeleton, error, empty, and content states render; active live session indicators and grids render correctly in light and dark.

## Resolved During Planning

- **Permissions:** import `ADMIN_PERMISSIONS` from `@sd/core-contracts` (canonical enum in `src/types/admin.types.ts`: `manage:scholars`, `manage:topics`, `manage:content`, `manage:livestreams`, `manage:users`, `manage:admin`).
- **SECTION_TABS:** web and native copies are byte-identical with string icon names → consolidate into `@sd/core-contracts` (Task 3.3); icon→component mapping stays per-platform.
- **make-admin client import:** relative `../src/generated/prisma/client` (in-package convention; no `dist` build needed).
- **`adaptive-bottom-bar.tsx`** exists as a **web** component (a SECTION_TABS consumer to update in Task 3.4).

## Open Items to Confirm During Implementation

- The exact `load-db-env.js` / `db-env.js` require form used by the sibling `core-db` scripts.
- Native admin route pathnames under `account/(admin)` vs the registry's `/admin` entry.
