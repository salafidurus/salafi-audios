# Scalable Monorepo Architecture Plan

> **For agentic workers:** Use superpowers:executing-plans or superpowers:subagent-driven-development to implement this plan.

**Goal:** Restructure the monorepo's package boundaries, dependency graph, routing conventions, and platform split to eliminate hidden coupling, establish real layer discipline, and make it easy to scale new features without dragging the full infrastructure stack into every package.

**Architecture:** Feature packages are split into a logic layer (`domain-*`) and a UI layer (`feature-*`). `@sd/shared` becomes a pure UI primitives library with no initialization concern. App shells own provider setup. Route files are thin wiring layers that pass navigation callbacks to feature screens. Route constants live in `@sd/core-contracts` as the single source of truth for all paths.

**Tech Stack:** pnpm + Turborepo, NestJS (API), Next.js App Router (web), Expo Router (mobile), Unistyles, Zustand, TanStack Query, better-auth

---

## Progress Snapshot (as of 2026-04-06)

### Completed

- **Phase 1** (`@sd/shared` cleanup): `@sd/core-api` and `@sd/core-config` removed from `shared/package.json`. Providers moved into app shells.
- **Phase 2** (framework imports): `next` moved to peerDependencies in `@sd/core-styles`. `apps/web/src/app/layout.tsx` stripped of nav chrome — now wraps only `<Providers>{children}</Providers>`.
- **API cleanup**: Removed all unused modules (`analytics`, `audio-assets`, `catalog`, `collection-topics`, `collections`, `lecture-topics`, `lectures`, `recommendations`, `scholars`, `series`, `series-topics`) and the scaffolded `AppController`/`AppService`. Only `search`, `topics`, `auth`, and shared infrastructure remain.

### In Progress / Packages Created

- **Phase 17** (`domain-playback` + `feature-playback`): Packages created and scaffolded.
- **Phase 18** (`domain-progress` + `feature-progress`): Packages created and scaffolded.
- **Phase 19** (`feature-downloads`): Package created and scaffolded.
- Feature screen implementations added across existing feature packages.

### Blocked

- **Phase 9** (standardize package exports — remove redundant `main`/`types` fields): Blocked on migrating `moduleResolution` to `"bundler"` across all packages first. Do not attempt until that tsconfig migration is done.

---

## Dependency Layer Model (Reference)

```
Layer 0 — Data/Contracts (no internal deps)
  design-tokens, core-env, core-contracts, core-db

Layer 1 — Infrastructure (depends on Layer 0 only)
  core-api, core-auth, core-config, core-styles

Layer 2 — UI Primitives (depends on Layer 0–1, no Providers)
  shared  ← stripped of API/query initialization

Layer 3 — Domain Logic (depends on Layer 0–2, no JSX, no framework imports)
  domain-search, domain-playback ✅ scaffolded, domain-progress ✅ scaffolded

Layer 4 — Feature UI (depends on Layer 3 + shared, platform-split)
  feature-search, feature-auth, feature-navigation, feature-catalog (new), ...

Layer 5 — App Shells (routing + provider initialization only)
  apps/web, apps/mobile, apps/api
```

---

## Phase 1: Clean Up `@sd/shared`

**Problem:** `@sd/shared` depends on `@sd/core-api` and initializes the API + query client inside `Providers.tsx`. This makes it impossible to use any shared UI primitive without pulling in the full API initialization stack.

**Fix:** Move `Providers` out of `@sd/shared` and into each app shell. `@sd/shared` drops its `core-api` and `core-config` dependencies.

### Files

- Modify: `packages/shared/src/index.web.ts` — remove Providers export
- Modify: `packages/shared/src/index.native.ts` — remove ProvidersMobileNative export
- Delete: `packages/shared/src/components/Providers.tsx` (or equivalent provider files)
- Create: `apps/web/src/app/providers.tsx` — owns QueryClient + API client init for web (likely already exists, just needs the logic moved in)
- Modify: `apps/web/src/app/layout.tsx` — import providers from local `./providers`
- Create: `apps/mobile/src/providers.tsx` — owns QueryClient + API client init for native
- Modify: `apps/mobile/src/app/_layout.tsx` — import providers locally, remove `@sd/shared` Providers import
- Modify: `packages/shared/package.json` — remove `@sd/core-api` and `@sd/core-config` from `dependencies`

### Steps

- [ ] Read `packages/shared/src/` fully — identify every file that imports from `@sd/core-api` or `@sd/core-config`
- [ ] Read `apps/web/src/app/providers.tsx` — understand what it currently does
- [ ] Read `apps/mobile/src/app/_layout.tsx` — understand current provider setup
- [ ] Move the provider initialization code (QueryClient, API client setup) from `@sd/shared` into `apps/web/src/app/providers.tsx`
- [ ] Move the native provider initialization into `apps/mobile/src/app/_layout.tsx` or a local `apps/mobile/src/providers.tsx`
- [ ] Remove the `Providers` and `ProvidersMobileNative` exports from `packages/shared/src/index.web.ts` and `packages/shared/src/index.native.ts`
- [ ] Remove `@sd/core-api` and `@sd/core-config` from `packages/shared/package.json` dependencies
- [ ] Run `pnpm typecheck:api+web` and `pnpm typecheck:api+mobile` — fix any broken imports
- [ ] Run `pnpm lint` — fix any lint errors
- [ ] Commit: `refactor(shared): move provider initialization into app shells`

---

## Phase 2: Remove Framework Imports from Feature Packages

**Problem:** `feature-search`, `feature-auth`, `feature-navigation`, and `core-styles` declare `next` as a production dependency. `feature-navigation` also imports `expo-router` directly. This means package dependency graphs imply framework ownership that belongs to the apps, not the packages.

**Fix:** Move `next` and `expo-router` to `peerDependencies` in feature packages. Feature screens that currently call `useRouter` from `next/navigation` directly should receive navigation callbacks as props instead — the route file wires the router, the screen is framework-agnostic.

### Files

- Modify: `packages/feature-search/package.json` — move `next` to peerDependencies
- Modify: `packages/feature-auth/package.json` — move `next` to peerDependencies
- Modify: `packages/feature-navigation/package.json` — move `next` and `expo-router` to peerDependencies
- Modify: `packages/core-styles/package.json` — move `next` to peerDependencies
- Modify: feature screen `.desktop.web.tsx` / `.responsive.web.tsx` files that import `useRouter` from `next/navigation` — replace with `onNavigate` callback props
- Modify: corresponding web route `page.tsx` files — wire the router callbacks
- Modify: feature screen `.native.tsx` files that import from `expo-router` — replace with callback props where applicable

### Steps

- [ ] Grep all `packages/feature-*/src/**/*.tsx` and `packages/core-styles/src/**/*` for `from 'next/'` and `from 'expo-router'` — list every occurrence
- [ ] For each `next/navigation` import in a feature screen: replace `useRouter()` calls with a prop (e.g. `onOpenSearch: () => void`), update the component signature, remove the import
- [ ] Update the corresponding web `page.tsx` route files to pass the router callback: `onOpenSearch={() => router.push(routes.search)}`
- [ ] Move `next` from `dependencies` to `peerDependencies` in each affected `package.json`
- [ ] Move `expo-router` from `dependencies` to `peerDependencies` in `feature-navigation/package.json`
- [ ] Run `pnpm typecheck:api+web` and `pnpm typecheck:api+mobile` — fix type errors
- [ ] Run `pnpm lint`
- [ ] Commit: `refactor(features): receive navigation as callbacks, move next/expo-router to peerDeps`

---

## Phase 3: Route Constants in `@sd/core-contracts`

**Problem:** Route path strings (`'/feed'`, `'/search'`, etc.) are hardcoded in multiple places — feature package `router.push` calls, `href` props, and mobile route file callbacks. Renaming a route requires a codebase-wide search.

**Fix:** Define a `routes` constant in `@sd/core-contracts`. All navigation callbacks in route files and any remaining path references in feature packages use this object.

### Files

- Create: `packages/core-contracts/src/routes.ts`
- Modify: `packages/core-contracts/src/index.ts` — export `routes`
- Modify: `apps/web/src/app/**/page.tsx` files — use `routes.*` in any `router.push` calls
- Modify: `apps/mobile/src/app/**/*.tsx` route files — use `routes.*` in callbacks

### Steps

- [ ] Audit all `router.push`, `router.replace`, `href=`, and `Link href=` values across `apps/web/src` and `apps/mobile/src` — collect every unique route path used
- [ ] Create `packages/core-contracts/src/routes.ts`:

```ts
export const routes = {
  home: "/",
  search: "/search",
  feed: {
    root: "/feed",
    recent: "/feed/recent",
    following: "/feed/following",
  },
  library: {
    root: "/library",
    saved: "/library/saved",
    completed: "/library/completed",
  },
  live: {
    root: "/live",
    scheduled: "/live/scheduled",
    ended: "/live/ended",
  },
  account: {
    root: "/account",
    profile: "/account/profile",
    legal: "/account/legal",
  },
  signIn: "/sign-in",
  signUp: "/sign-up",
  support: "/support",
  privacy: "/privacy",
  termsOfUse: "/terms-of-use",
} as const;
```

- [ ] Export `routes` from `packages/core-contracts/src/index.ts`
- [ ] Replace hardcoded path strings in web route files with `routes.*`
- [ ] Replace hardcoded path strings in mobile route files with `routes.*`
- [ ] Run `pnpm typecheck:api+web` and `pnpm typecheck:api+mobile`
- [ ] Commit: `feat(contracts): add route constants`

---

## Phase 4: Web Layout — Shell Groups

**Problem:** `apps/web/src/app/layout.tsx` renders `<Sidebar>`, `<TopAuthStrip>`, and `<Footer>` around every page including sign-in and sign-up. Auth pages need a different (minimal) shell. Future admin pages need yet another shell.

**Fix:** Introduce nested layout groups. The root layout handles only fonts, providers, and theme init. Each route group (`(main)`, `(auth)`) has its own `layout.tsx` with the appropriate chrome.

### Files

- Modify: `apps/web/src/app/layout.tsx` — strip nav chrome, keep only fonts + providers + theme script + `<html>`/`<body>`
- Create: `apps/web/src/app/(main)/layout.tsx` — owns `<Sidebar>`, `<TopAuthStrip>`, `<Footer>` wrapper
- Move (rename): all existing route group folders currently at `app/(search)/`, `app/(feed)/`, etc. → `app/(main)/(search)/`, `app/(main)/(feed)/`, etc. (except `(auth)` which stays separate)
- Modify: `apps/web/src/app/(auth)/layout.tsx` — create minimal centered shell (no sidebar)

### Steps

- [ ] Read `apps/web/src/app/layout.tsx` fully
- [ ] Read `apps/web/src/app/(auth)/sign-in/page.tsx` and `sign-up/page.tsx` — confirm they currently use the full layout
- [ ] Strip nav chrome from `apps/web/src/app/layout.tsx` — move `<Sidebar>`, `<TopAuthStrip>`, `<Footer>`, and the `appFrame`/`appShell`/`appMain`/`appContent` div structure into a new `apps/web/src/app/(main)/layout.tsx`
- [ ] Move route group folders into `(main)/`: `(search)`, `(feed)`, `(library)`, `(live)`, `(account)`, `(support)`, `(legal)`
- [ ] Create `apps/web/src/app/(auth)/layout.tsx` with a minimal centered layout (no sidebar, no footer):

```tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="authShell">{children}</div>;
}
```

- [ ] Verify all web routes still resolve correctly — run `pnpm dev:web` and check each route
- [ ] Run `pnpm typecheck:api+web`
- [ ] Commit: `refactor(web): split root layout into shell groups`

---

## Phase 5: Fix Mobile Tabs Layout

**Problem:** `apps/mobile/src/app/(tabs)/_layout.tsx` is a hardcoded placeholder stub. It doesn't use Expo Router's `Tabs` component, so the custom tab bar from `@sd/feature-navigation` is never rendered and none of the tab screens work correctly.

### Files

- Modify: `apps/mobile/src/app/(tabs)/_layout.tsx` — real Tabs implementation with custom tab bar
- Modify: `apps/mobile/src/app/(tabs)/(search)/index.tsx` — wire to `SearchHomeMobileNativeScreen`
- Modify: `apps/mobile/src/app/(tabs)/feed/index.tsx` — wire to `FeedMobileNativeScreen`
- Modify: `apps/mobile/src/app/(tabs)/library/index.tsx` — wire to `LibraryMobileNativeScreen`
- Modify: `apps/mobile/src/app/(tabs)/account/index.tsx` — wire to `AccountMobileNativeScreen`
- Modify: `apps/mobile/src/app/(tabs)/live/index.tsx` — wire to `LiveMobileNativeScreen`

### Steps

- [ ] Read `packages/feature-navigation/src/index.native.ts` — confirm the exact export name for the custom tab bar component
- [ ] Read `packages/feature-navigation/src/` — understand what props `CustomTabBarMobileNative` expects
- [ ] Implement `apps/mobile/src/app/(tabs)/_layout.tsx`:

```tsx
import { Tabs } from "expo-router";
import { CustomTabBarMobileNative } from "@sd/feature-navigation";

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBarMobileNative {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="(search)" />
      <Tabs.Screen name="feed" />
      <Tabs.Screen name="library" />
      <Tabs.Screen name="live" />
      <Tabs.Screen name="account" />
    </Tabs>
  );
}
```

- [ ] Wire each tab index screen to its feature screen:

```tsx
// apps/mobile/src/app/(tabs)/feed/index.tsx
import { useRouter } from "expo-router";
import { FeedMobileNativeScreen } from "@sd/feature-feed";

export default function FeedRoute() {
  const router = useRouter();
  return <FeedMobileNativeScreen />;
}
```

- [ ] Repeat for `library/index.tsx`, `account/index.tsx`, `live/index.tsx`
- [ ] Wire `(search)/index.tsx` to `SearchHomeMobileNativeScreen` (passing `onOpenSearch` callback)
- [ ] Run `pnpm dev:mobile` — verify tabs render and custom tab bar appears
- [ ] Run `pnpm typecheck:api+mobile`
- [ ] Commit: `fix(mobile): implement real tabs layout with custom tab bar`

---

## Phase 6: Fix the Feature-Navigation → Feature-Search Coupling

**Problem:** `@sd/feature-navigation` depends on `@sd/feature-search`. Navigation should not know about a content feature. The dependency exists for routing section constants or tab definitions.

**Fix:** Extract the shared tab/section constants into `@sd/core-contracts`. Both `feature-navigation` and `feature-search` depend on `@sd/core-contracts` (which they already do). Remove the cross-feature dependency.

### Files

- Create: `packages/core-contracts/src/sections.ts` — tab section keys and route associations
- Modify: `packages/core-contracts/src/index.ts` — export sections
- Modify: `packages/feature-navigation/src/` — import section constants from `@sd/core-contracts` instead of `@sd/feature-search`
- Modify: `packages/feature-navigation/package.json` — remove `@sd/feature-search` from dependencies
- Modify: `packages/feature-search/src/` — import section constants from `@sd/core-contracts` if needed

### Steps

- [ ] Read `packages/feature-navigation/src/` — find every import from `@sd/feature-search`, understand what is used (likely tab keys, section names, or route strings)
- [ ] Read `packages/feature-search/src/` — find what it exports that navigation consumes
- [ ] Move the shared constants (tab keys, section identifiers) into `packages/core-contracts/src/sections.ts`
- [ ] Update `feature-navigation` imports to use `@sd/core-contracts`
- [ ] Remove `@sd/feature-search` from `packages/feature-navigation/package.json` dependencies
- [ ] Run `pnpm typecheck:api+web` and `pnpm typecheck:api+mobile`
- [ ] Commit: `refactor(navigation): remove feature-search dependency, use shared section constants`

---

## Phase 7: Introduce `domain-search` — Logic/UI Split for Search

**Problem:** `@sd/feature-search` is a monolith containing hooks, API calls, Zustand store, screen layouts, and framework router calls all in one package. As search grows (filters, history, suggestions), this becomes unmaintainable. The logic cannot be tested independently of the UI.

**Fix:** Extract all non-UI logic into a new `@sd/domain-search` package. `@sd/feature-search` becomes a pure UI package that depends on `@sd/domain-search`.

### Files

- Create: `packages/domain-search/` — new package
  - `package.json`
  - `src/index.ts` — single platform-agnostic entrypoint
  - `src/store/search.store.ts` — Zustand store
  - `src/hooks/use-search.ts` — search query hook
  - `src/api/search.api.ts` — API call wrappers
  - `src/types/index.ts` — domain types
  - `tsconfig.json`, `tsconfig.build.json`
- Modify: `packages/feature-search/package.json` — add `@sd/domain-search` dependency
- Modify: `packages/feature-search/src/` — remove hooks/store/api logic, import from `@sd/domain-search`
- Modify: `pnpm-workspace.yaml` (if needed) — ensure new package is picked up
- Modify: root `turbo.json` — no changes needed if package follows conventions

### Steps

- [ ] Read `packages/feature-search/src/hooks/`, `packages/feature-search/src/api/`, `packages/feature-search/src/store/` (if exists) — identify all non-UI logic
- [ ] Create `packages/domain-search/package.json`:

```json
{
  "name": "@sd/domain-search",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@sd/core-contracts": "workspace:*",
    "@sd/core-api": "workspace:*",
    "@tanstack/react-query": "^5.69.0",
    "zustand": "^5.0.11"
  },
  "devDependencies": {
    "typescript": "^5.9.2"
  }
}
```

- [ ] Move search hooks, API call functions, and store into `packages/domain-search/src/`
- [ ] Export them from `packages/domain-search/src/index.ts`
- [ ] Update `packages/feature-search/src/` — replace local hook/store/api imports with `@sd/domain-search`
- [ ] Add `@sd/domain-search` to `packages/feature-search/package.json` dependencies
- [ ] Run `pnpm --filter @sd/domain-search typecheck`
- [ ] Run `pnpm typecheck:api+web` and `pnpm typecheck:api+mobile`
- [ ] Commit: `feat(domain-search): extract search logic into domain package`

---

## Phase 8: Trim Unused Dependencies in Placeholder Feature Packages

**Problem:** Placeholder feature packages (`feature-account`, `feature-feed`, `feature-library`, `feature-live`, `feature-legal`, `feature-support`) all declare `core-api`, `core-config`, `core-styles` as dependencies even though their current implementations only use `ScreenInProgressResponsive` from `@sd/shared`. Declared deps that aren't used slow installs, pollute the dependency graph, and create false coupling.

**Fix:** Trim each placeholder package's `dependencies` to only what it actually imports. Dependencies are added back as each feature is built out.

### Steps

- [ ] For each placeholder feature package, grep its `src/` for actual `@sd/*` imports
- [ ] Remove any declared dependency that has zero actual imports in `src/`
- [ ] Run `pnpm install` to update lockfile
- [ ] Run `pnpm typecheck:api+web` and `pnpm typecheck:api+mobile` — confirm no broken imports
- [ ] Commit: `chore(packages): trim unused dependencies from placeholder feature packages`

---

## Phase 9: Standardize Package Exports (Remove Redundant `main`/`react-native` Fields)

**Problem:** Packages declare both top-level `main`+`react-native`+`types` fields AND an `exports` map. Bundlers that support `exports` (Metro, webpack 5, Node 12+) ignore `main`. Having both is misleading.

**Fix:** Keep only the `exports` map. Remove top-level `main`, `react-native`, and `types` fields from all packages that have a complete `exports` map.

### Steps

- [ ] For each package in `packages/*/package.json` that has both `main` and `exports` defined: remove `main`, `react-native` (top-level), and `types` top-level fields
- [ ] Verify `exports` map covers all entrypoints: `"."` with `react-native` condition and `default`
- [ ] Run `pnpm install`
- [ ] Run `pnpm typecheck:api+web` and `pnpm typecheck:api+mobile`
- [ ] Run `pnpm dev:web` and `pnpm dev:mobile` — smoke test that both apps start
- [ ] Commit: `chore(packages): standardize to exports map, remove redundant main/types fields`

---

## Phase 10: Fix the Hydration Flash in `.responsive.web.tsx` Screens

**Problem:** `SearchHomeResponsiveScreen` and `SearchProcessingResponsiveScreen` return `null` until JS hydrates, then switch between mobile/desktop variants using a `useState(false)` gate. This causes blank content on first render (CLS).

**Fix:** Replace JS-based responsive switching with CSS-based layout. Keep `.mobile.web.tsx` and `.desktop.web.tsx` as code-organization files, but render both in the DOM and hide the inactive one via CSS media query. Or consolidate into a single `.web.tsx` component that uses Unistyles breakpoints.

### Files

- Modify: `packages/feature-search/src/screens/search-home/search-home.screen.responsive.web.tsx`
- Modify: `packages/feature-search/src/screens/search-processing/search-processing.screen.responsive.web.tsx`
- Apply same fix to any other `*.responsive.web.tsx` files added in future features

### Steps

- [ ] Read `search-home.screen.responsive.web.tsx` and `search-home.screen.mobile.web.tsx` and `search-home.screen.desktop.web.tsx` fully
- [ ] Replace the `isHydrated` gate with CSS-driven visibility. One approach — render both and toggle via className:

```tsx
export function SearchHomeResponsiveScreen() {
  return (
    <>
      <div className="mobileOnly"><SearchHomeMobileWebScreen ... /></div>
      <div className="desktopOnly"><SearchHomeDesktopWebScreen ... /></div>
    </>
  );
}
```

With CSS:

```css
.mobileOnly {
  display: block;
}
.desktopOnly {
  display: none;
}
@media (min-width: 1024px) {
  .mobileOnly {
    display: none;
  }
  .desktopOnly {
    display: block;
  }
}
```

- [ ] Apply same fix to `search-processing.screen.responsive.web.tsx`
- [ ] Verify no layout shift on hard refresh in `pnpm dev:web`
- [ ] Run `pnpm typecheck:api+web`
- [ ] Commit: `fix(feature-search): eliminate hydration flash in responsive screens`

---

---

## Phase 11: Create `feature-catalog` (Phase 03 — Scholars, Collections, Series)

**Problem:** The API has complete implementations for scholars, collections, and series but there are zero web or mobile screens for them. These are CRITICAL MVP gaps.

**Scope:** `feature-catalog` covers list and detail screens for scholars, collections, and series. Lecture detail gets its own package (Phase 12) because it carries audio playback concerns.

### Package structure

```
packages/feature-catalog/
  package.json
  src/
    index.web.ts
    index.native.ts
    screens/
      scholar-detail/
        scholar-detail.screen.desktop.web.tsx
        scholar-detail.screen.mobile.web.tsx
        scholar-detail.screen.native.tsx
      collection-detail/
        collection-detail.screen.desktop.web.tsx
        collection-detail.screen.mobile.web.tsx
        collection-detail.screen.native.tsx
      series-detail/
        series-detail.screen.desktop.web.tsx
        series-detail.screen.mobile.web.tsx
        series-detail.screen.native.tsx
    components/
      lecture-list-item/
        lecture-list-item.web.tsx
        lecture-list-item.native.tsx
      scholar-header/
        scholar-header.web.tsx
        scholar-header.native.tsx
    hooks/
      use-scholar-detail.ts
      use-collection-detail.ts
      use-series-detail.ts
    api/
      catalog.api.ts
    types/
      index.ts
    unistyles.d.ts
```

### Route files to create

**Web:**

- `apps/web/src/app/(main)/(catalog)/scholars/[slug]/page.tsx`
- `apps/web/src/app/(main)/(catalog)/collections/[id]/page.tsx`
- `apps/web/src/app/(main)/(catalog)/series/[id]/page.tsx`

**Mobile:**

- `apps/mobile/src/app/(tabs)/(search)/scholar/[slug].tsx`
- `apps/mobile/src/app/(tabs)/(search)/collection/[id].tsx`
- `apps/mobile/src/app/(tabs)/(search)/series/[id].tsx`

### Steps

- [ ] Read `packages/core-contracts/src/index.ts` — confirm `ScholarViewDto`, `ScholarDetailDto`, `CollectionViewDto`, `SeriesViewDto` types are exported
- [ ] Read `apps/api/src/` — grep for scholar, collection, series endpoints to understand response shapes
- [ ] Create `packages/feature-catalog/package.json` following the same structure as `feature-search` — dependencies: `@sd/core-contracts`, `@sd/core-api`, `@sd/design-tokens`, `@sd/shared`; peerDependencies: `next`, `expo-router`, `react`, `react-native`, `react-native-unistyles`
- [ ] Create `tsconfig.json` and `tsconfig.build.json` — copy from `packages/feature-search/`
- [ ] Create `src/api/catalog.api.ts` — API call functions using `httpClient` from `@sd/core-contracts`
- [ ] Create `src/hooks/use-scholar-detail.ts`, `use-collection-detail.ts`, `use-series-detail.ts` — TanStack Query hooks
- [ ] Create `src/types/index.ts` — any catalog-specific types not already in contracts
- [ ] Create scholar detail screens (desktop web, mobile web, native)
- [ ] Create collection detail screens (desktop web, mobile web, native)
- [ ] Create series detail screens (desktop web, mobile web, native)
- [ ] Create shared components (`LectureListItem`, `ScholarHeader`) in platform variants
- [ ] Export all screens from `src/index.web.ts` and `src/index.native.ts`
- [ ] Add web route files — each imports the relevant screen and wires `router.push` callbacks using `routes.*`
- [ ] Add mobile route files — each reads `useLocalSearchParams` and passes navigation callbacks
- [ ] Add `routes.scholars`, `routes.collections`, `routes.series` entries to `packages/core-contracts/src/routes.ts`
- [ ] Add `@sd/feature-catalog` to `apps/web/package.json` and `apps/mobile/package.json`
- [ ] Run `pnpm typecheck:api+web` and `pnpm typecheck:api+mobile`
- [ ] Commit: `feat(feature-catalog): add scholar, collection, series detail screens`

---

## Phase 12: Create `feature-lecture` (Phase 03 — Lecture Detail)

**Problem:** Lecture detail pages are missing on both web and mobile. Unlike catalog items, a lecture screen needs to trigger audio playback — so it is a separate package to avoid coupling `feature-catalog` to `feature-playback` before playback exists.

**Scope:** Lecture detail screen (metadata, description, audio asset info). Playback trigger is a callback prop — the route wires it to whatever the playback system will be. No actual audio engine in this phase.

### Package structure

```
packages/feature-lecture/
  package.json
  src/
    index.web.ts
    index.native.ts
    screens/
      lecture-detail/
        lecture-detail.screen.desktop.web.tsx
        lecture-detail.screen.mobile.web.tsx
        lecture-detail.screen.native.tsx
    components/
      audio-asset-info/
        audio-asset-info.web.tsx
        audio-asset-info.native.tsx
    hooks/
      use-lecture-detail.ts
    api/
      lecture.api.ts
    types/
      index.ts
    unistyles.d.ts
```

### Route files to create

**Web:**

- `apps/web/src/app/(main)/(catalog)/lectures/[id]/page.tsx`

**Mobile:**

- `apps/mobile/src/app/(tabs)/(search)/lecture/[id].tsx`

### Steps

- [ ] Read `packages/core-contracts/src/index.ts` — confirm `LectureViewDto`, `AudioAssetViewDto` are exported
- [ ] Create `packages/feature-lecture/package.json` — same dependency pattern as `feature-catalog`; peerDeps: `next`, `expo-router`, `react`, `react-native`, `react-native-unistyles`
- [ ] Create `src/api/lecture.api.ts` — fetch lecture by id
- [ ] Create `src/hooks/use-lecture-detail.ts` — TanStack Query hook
- [ ] Create `LectureDetailDesktopWebScreen`, `LectureDetailMobileWebScreen`, `LectureDetailMobileNativeScreen` — each accepts `onPlay: (audioAssetId: string) => void` callback prop (wired to nothing for now — playback comes in Phase 05)
- [ ] Create `AudioAssetInfo` component — displays duration, format, file size
- [ ] Export from `src/index.web.ts` and `src/index.native.ts`
- [ ] Add web route `lectures/[id]/page.tsx` — passes `onPlay={() => {/* TODO Phase 05 */}}` for now
- [ ] Add mobile route `lecture/[id].tsx` — same
- [ ] Add `routes.lectures` to `packages/core-contracts/src/routes.ts`
- [ ] Run `pnpm typecheck:api+web` and `pnpm typecheck:api+mobile`
- [ ] Commit: `feat(feature-lecture): add lecture detail screen with playback callback stub`

---

## Phase 13: Build Out `feature-feed` (Phase 04)

**Problem:** `feature-feed` exists as a package but renders only `ScreenInProgressResponsive`/`ScreenInProgressMobileNative` placeholders. The Feed section shows recent and following lecture activity.

### Screens to implement

- `FeedRecentDesktopWebScreen` / `FeedRecentMobileWebScreen` / `FeedRecentMobileNativeScreen`
- `FeedFollowingDesktopWebScreen` / `FeedFollowingMobileWebScreen` / `FeedFollowingMobileNativeScreen`
- Root `FeedDesktopWebScreen` / `FeedMobileNativeScreen` (tab landing — defaults to recent)

### Steps

- [ ] Read `apps/api/src/` — grep for feed or recommendations endpoints to understand data available
- [ ] Read `packages/core-contracts/src/index.ts` — confirm what feed-related DTOs exist; add any missing ones
- [ ] Add `src/api/feed.api.ts` to `packages/feature-feed/` — API call functions
- [ ] Add `src/hooks/use-feed-recent.ts` and `use-feed-following.ts`
- [ ] Implement screen components in platform variants
- [ ] Update `src/index.web.ts` and `src/index.native.ts` exports
- [ ] Update web route files (`/feed`, `/feed/recent`, `/feed/following`) to use real screens
- [ ] Update mobile route files (`feed/index.tsx`, `feed/recent.tsx`, `feed/following.tsx`)
- [ ] Add `@sd/core-api` to `packages/feature-feed/package.json` only if `src/` actually imports it
- [ ] Run `pnpm typecheck:api+web` and `pnpm typecheck:api+mobile`
- [ ] Commit: `feat(feature-feed): implement feed recent and following screens`

---

## Phase 14: Build Out `feature-library` (Phase 04)

**Problem:** `feature-library` is a placeholder. The Library section shows a user's saved and completed lectures.

### Screens to implement

- `LibrarySavedDesktopWebScreen` / `LibrarySavedMobileWebScreen` / `LibrarySavedMobileNativeScreen`
- `LibraryCompletedDesktopWebScreen` / `LibraryCompletedMobileWebScreen` / `LibraryCompletedMobileNativeScreen`
- Root `LibraryDesktopWebScreen` / `LibraryMobileNativeScreen`

### Steps

- [ ] Read `apps/api/src/` — find library/bookmarks/history endpoints
- [ ] Confirm or add `LibraryItemDto`, `BookmarkDto` types in `packages/core-contracts/src/`
- [ ] Add `src/api/library.api.ts`, `src/hooks/use-library-saved.ts`, `use-library-completed.ts`
- [ ] Implement screen components in platform variants
- [ ] Update `src/index.web.ts` and `src/index.native.ts`
- [ ] Update web route files (`/library`, `/library/saved`, `/library/completed`)
- [ ] Update mobile route files (`library/index.tsx`, `library/saved.tsx`, `library/completed.tsx`)
- [ ] Run `pnpm typecheck:api+web` and `pnpm typecheck:api+mobile`
- [ ] Commit: `feat(feature-library): implement saved and completed library screens`

---

## Phase 15: Build Out `feature-account` (Phase 04)

**Problem:** `feature-account` is a placeholder. The Account section covers user profile, settings, and account-level legal links.

### Screens to implement

- `AccountDesktopWebScreen` / `AccountMobileWebScreen` / `AccountMobileNativeScreen`
- `AccountProfileDesktopWebScreen` / `AccountProfileMobileNativeScreen`

### Steps

- [ ] Read `apps/api/src/` — find user/profile endpoints
- [ ] Confirm or add `UserProfileDto` in `packages/core-contracts/src/`
- [ ] Add `src/api/account.api.ts`, `src/hooks/use-account.ts`
- [ ] Implement screen components in platform variants (profile edit form, sign out action)
- [ ] Update `src/index.web.ts` and `src/index.native.ts`
- [ ] Update web route files (`/account`, `/account/profile`, `/account/legal`)
- [ ] Update mobile route files (`account/index.tsx`, `account/profile.tsx`, `account/legal.tsx`)
- [ ] Run `pnpm typecheck:api+web` and `pnpm typecheck:api+mobile`
- [ ] Commit: `feat(feature-account): implement account and profile screens`

---

## Phase 16: Build Out `feature-live` (Phase 04)

**Problem:** `feature-live` is a placeholder. The Live section shows active, scheduled, and ended live sessions.

### Screens to implement

- `LiveDesktopWebScreen` / `LiveMobileNativeScreen` (active/default)
- `LiveScheduledDesktopWebScreen` / `LiveScheduledMobileNativeScreen`
- `LiveEndedDesktopWebScreen` / `LiveEndedMobileNativeScreen`

### Steps

- [ ] Read `apps/api/src/` — find live session endpoints
- [ ] Confirm or add `LiveSessionDto` in `packages/core-contracts/src/`
- [ ] Add `src/api/live.api.ts`, `src/hooks/use-live.ts`
- [ ] Implement screen components in platform variants
- [ ] Update `src/index.web.ts` and `src/index.native.ts`
- [ ] Update web route files (`/live`, `/live/scheduled`, `/live/ended`)
- [ ] Update mobile route files (`live/index.tsx`, `live/scheduled.tsx`, `live/ended.tsx`)
- [ ] Run `pnpm typecheck:api+web` and `pnpm typecheck:api+mobile`
- [ ] Commit: `feat(feature-live): implement live, scheduled, and ended screens`

---

## Phase 17: Create `domain-playback` + `feature-playback` (Phase 05 — Audio Player)

**Problem:** Audio playback is the most architecturally sensitive feature. It requires background audio, lock screen controls, and a persistent mini-player UI that sits above the tab bar on mobile and in the layout footer on web. This cannot be bolted on later — the architecture must be designed before any audio code is written.

**Design decisions:**

- Native audio engine: `react-native-track-player` (supports background playback, lock screen, queue management; Expo AV does not)
- Player state: Zustand store in `@sd/domain-playback` — single store, survives tab navigation
- Mini-player: rendered in `apps/mobile/src/app/(tabs)/_layout.tsx` as a slot above the tab bar; web renders it in `apps/web/src/app/(main)/layout.tsx` above the footer
- `feature-playback` exposes the mini-player UI and full-screen player UI; `domain-playback` owns state + engine calls

### Package structure

```
packages/domain-playback/
  package.json
  src/
    index.ts                         ← platform-agnostic (state + types)
    store/
      playback.store.ts              ← Zustand store (currentTrack, queue, isPlaying, progress)
    hooks/
      use-playback.ts                ← consume store + trigger engine
    types/
      index.ts                       ← Track, PlaybackState, QueueItem
    engine/
      playback.engine.native.ts      ← react-native-track-player calls
      playback.engine.web.ts         ← HTML Audio API calls (web player)

packages/feature-playback/
  package.json
  src/
    index.web.ts
    index.native.ts
    screens/
      player-fullscreen/
        player-fullscreen.screen.native.tsx
    components/
      mini-player/
        mini-player.native.tsx
        mini-player.web.tsx
      progress-bar/
        progress-bar.native.tsx
        progress-bar.web.tsx
      playback-controls/
        playback-controls.native.tsx
        playback-controls.web.tsx
```

### Steps

- [ ] Read `packages/core-contracts/src/index.ts` — confirm `AudioAssetViewDto` shape; note audio URL field name
- [ ] Create `packages/domain-playback/package.json` — dependencies: `@sd/core-contracts`, `zustand`; peerDeps: `react`, `react-native`, `react-native-track-player`
- [ ] Create `src/types/index.ts` — `Track`, `PlaybackState`, `QueueItem` types
- [ ] Create `src/store/playback.store.ts` — Zustand store with: `currentTrack`, `queue`, `isPlaying`, `position`, `duration`, `actions.play`, `actions.pause`, `actions.seek`, `actions.enqueue`
- [ ] Create `src/hooks/use-playback.ts` — wraps store; exposes clean API to UI
- [ ] Create `src/engine/playback.engine.native.ts` — `react-native-track-player` integration (setup, add, play, pause, seek, event listeners that sync store)
- [ ] Create `src/engine/playback.engine.web.ts` — HTML `Audio` element integration
- [ ] Add `pnpm --filter mobile add react-native-track-player` (native only)
- [ ] Create `packages/feature-playback/package.json` — dependencies: `@sd/domain-playback`, `@sd/shared`, `@sd/design-tokens`; peerDeps: `react`, `react-native`, `react-native-unistyles`, `expo-router`
- [ ] Implement `MiniPlayerNative` — shows current track title, play/pause button, progress bar; fixed height, rendered above tab bar
- [ ] Implement `MiniPlayerWeb` — similar, rendered in main layout above footer
- [ ] Implement `PlayerFullscreenMobileNativeScreen` — full-screen player with large artwork, seek bar, queue
- [ ] Export from `src/index.web.ts` and `src/index.native.ts`
- [ ] Add `MiniPlayerNative` to `apps/mobile/src/app/(tabs)/_layout.tsx` — render it between `<Tabs>` output and the tab bar
- [ ] Add `MiniPlayerWeb` to `apps/web/src/app/(main)/layout.tsx` — render it above `<Footer>`
- [ ] Wire `onPlay` callbacks in `apps/mobile/src/app/(tabs)/(search)/lecture/[id].tsx` and the web equivalent to `domain-playback` actions
- [ ] Add `@sd/feature-playback` to `apps/web/package.json` and `apps/mobile/package.json`
- [ ] Run `pnpm typecheck:api+web` and `pnpm typecheck:api+mobile`
- [ ] Commit: `feat(domain-playback): add playback engine and state store`
- [ ] Commit: `feat(feature-playback): add mini-player and fullscreen player UI`

---

## Phase 18: Create `domain-progress` + `feature-progress` (Phase 05 — Progress Tracking)

**Problem:** Listening progress (how far a user has listened, resume position, completion status) needs to be persisted both locally and synced to the backend. The domain logic is independent of the playback UI.

### Package structure

```
packages/domain-progress/
  package.json
  src/
    index.ts
    store/
      progress.store.ts              ← per-lecture position + completion map
    hooks/
      use-lecture-progress.ts
    sync/
      progress.sync.ts               ← debounced backend sync
    types/
      index.ts

packages/feature-progress/
  package.json
  src/
    index.web.ts
    index.native.ts
    components/
      progress-indicator/
        progress-indicator.web.tsx
        progress-indicator.native.tsx
      resume-badge/
        resume-badge.web.tsx
        resume-badge.native.tsx
```

### Steps

- [ ] Confirm or add `ProgressUpdateDto`, `LectureProgressDto` in `packages/core-contracts/src/`
- [ ] Create `packages/domain-progress/package.json` — dependencies: `@sd/core-contracts`, `@sd/core-api`, `zustand`
- [ ] Create `src/store/progress.store.ts` — map of `lectureId → { position, duration, completedAt }`
- [ ] Create `src/sync/progress.sync.ts` — debounced POST to backend progress endpoint on position change
- [ ] Create `src/hooks/use-lecture-progress.ts` — reads store, triggers sync
- [ ] Create `packages/feature-progress/` — `ProgressIndicator` (bar/ring showing % listened) and `ResumeBadge` (shows "Resume at 12:34") in web and native variants
- [ ] Integrate `use-lecture-progress` into `domain-playback` store — playback position changes update progress store
- [ ] Add `ProgressIndicator` to `LectureListItem` components in `feature-catalog` and `feature-library`
- [ ] Run `pnpm typecheck:api+web` and `pnpm typecheck:api+mobile`
- [ ] Commit: `feat(domain-progress): add progress store and backend sync`
- [ ] Commit: `feat(feature-progress): add progress indicator and resume badge components`

---

## Phase 19: Create `feature-downloads` + Offline Outbox (Phase 06)

**Problem:** Offline playback requires downloaded audio files and an outbox for queued writes (progress updates, bookmarks) that happen when the device is offline.

**Design decisions:**

- Downloads: `expo-file-system` for native file storage; download job tracked in a Zustand store
- Outbox: Array of pending mutations in async storage, drained on reconnect
- Backend coordinates download URLs via presigned URLs (already architecture-compliant)
- Offline mode NEVER enables admin actions (per guardrails)

### Package structure

```
packages/feature-downloads/
  package.json
  src/
    index.native.ts                  ← native only (no web downloads)
    store/
      downloads.store.ts             ← download queue, status per lecture
    hooks/
      use-download.ts
    engine/
      download.engine.native.ts      ← expo-file-system integration
    outbox/
      outbox.store.ts                ← pending mutations queue
      outbox.drain.ts                ← drain on reconnect
    components/
      download-button/
        download-button.native.tsx
      download-progress/
        download-progress.native.tsx
    types/
      index.ts
```

### Steps

- [ ] Read `docs/mobile.md` — confirm outbox pattern specification
- [ ] Confirm presigned URL endpoint exists in `apps/api/src/` for audio asset download
- [ ] Create `packages/feature-downloads/package.json` — native-only package; no `index.web.ts`; peerDeps: `expo-file-system`, `@react-native-async-storage/async-storage`, `react-native`
- [ ] Create `src/store/downloads.store.ts` — `lectureId → { status: 'pending'|'downloading'|'complete'|'error', localUri, progress }`
- [ ] Create `src/engine/download.engine.native.ts` — requests presigned URL from backend, streams to local file via `expo-file-system`
- [ ] Create `src/outbox/outbox.store.ts` — array of `{ id, type, payload, createdAt }` persisted to AsyncStorage
- [ ] Create `src/outbox/outbox.drain.ts` — on network reconnect, iterate outbox and POST each mutation; remove on success
- [ ] Create `DownloadButton` and `DownloadProgress` native components
- [ ] Add `DownloadButton` to `LectureDetailMobileNativeScreen` in `feature-lecture`
- [ ] Integrate outbox drain into `apps/mobile/src/app/_layout.tsx` — fire drain on app foreground
- [ ] `react-native-track-player` should serve local file URI when available instead of remote URL — wire this in `domain-playback` engine
- [ ] Add `@sd/feature-downloads` to `apps/mobile/package.json` only
- [ ] Run `pnpm typecheck:api+mobile`
- [ ] Commit: `feat(feature-downloads): add download engine, queue, and outbox`

---

## Phase 20: Build Out `feature-support` and `feature-legal` (Supporting)

**Problem:** Both are placeholder packages. These are low-complexity screens with no data fetching — static content only.

### Steps

- [ ] Implement `SupportDesktopWebScreen`, `SupportMobileWebScreen`, `SupportMobileNativeScreen` in `feature-support` — static contact/FAQ content
- [ ] Implement `PrivacyDesktopWebScreen`, `PrivacyMobileWebScreen`, `PrivacyMobileNativeScreen` in `feature-legal`
- [ ] Implement `TermsOfUseDesktopWebScreen`, `TermsOfUseMobileWebScreen`, `TermsOfUseMobileNativeScreen` in `feature-legal`
- [ ] Update `src/index.web.ts` and `src/index.native.ts` in both packages
- [ ] Update web and mobile route files to use real screens
- [ ] Remove `core-api`, `core-config` from both packages' `dependencies` (static screens don't need them)
- [ ] Run `pnpm typecheck:api+web` and `pnpm typecheck:api+mobile`
- [ ] Commit: `feat(feature-support, feature-legal): implement static content screens`

---

## Execution Order

Phases are ordered by dependency. Each phase is safe to ship independently.

| Phase | Status         | Description                                                  | Risk   | Prerequisite                                                                  |
| ----- | -------------- | ------------------------------------------------------------ | ------ | ----------------------------------------------------------------------------- |
| 1     | ✅ Done        | Move Providers out of `@sd/shared`                           | Medium | —                                                                             |
| 2     | ✅ Done        | Framework imports → peerDeps + callbacks                     | Medium | Phase 1                                                                       |
| 3     | ⬜ Todo        | Route constants in `core-contracts`                          | Low    | Phase 2                                                                       |
| 4     | ⬜ Todo        | Web layout shell groups (`(main)` + `(auth)`)                | Low    | —                                                                             |
| 5     | ⬜ Todo        | Fix mobile tabs layout                                       | Medium | Phase 3                                                                       |
| 6     | ⬜ Todo        | Remove `feature-navigation → feature-search` dep             | Low    | Phase 3                                                                       |
| 7     | ⬜ Todo        | Introduce `domain-search`                                    | Medium | Phase 2                                                                       |
| 8     | ⬜ Todo        | Trim unused deps in placeholder feature packages             | Low    | —                                                                             |
| 9     | 🚫 Blocked     | Standardize package exports (remove `main`/`types` fields)   | Low    | Requires `moduleResolution: "bundler"` tsconfig migration across all packages |
| 10    | ⬜ Todo        | Fix responsive hydration flash (CSS not JS)                  | Low    | Phase 2                                                                       |
| 11    | ⬜ Todo        | Create `feature-catalog`                                     | Medium | Phases 3, 4, 5                                                                |
| 12    | ⬜ Todo        | Create `feature-lecture`                                     | Low    | Phases 3, 11                                                                  |
| 13    | ⬜ Todo        | Build out `feature-feed`                                     | Medium | Phases 3, 4, 5                                                                |
| 14    | ⬜ Todo        | Build out `feature-library`                                  | Medium | Phases 3, 4, 5                                                                |
| 15    | ⬜ Todo        | Build out `feature-account`                                  | Medium | Phases 3, 4, 5                                                                |
| 16    | ⬜ Todo        | Build out `feature-live`                                     | Medium | Phases 3, 4, 5                                                                |
| 17    | 🔄 In Progress | `domain-playback` + `feature-playback` (packages scaffolded) | High   | Phases 5, 12                                                                  |
| 18    | 🔄 In Progress | `domain-progress` + `feature-progress` (packages scaffolded) | Medium | Phase 17                                                                      |
| 19    | 🔄 In Progress | `feature-downloads` + outbox (package scaffolded)            | High   | Phases 17, 18                                                                 |
| 20    | ⬜ Todo        | Build out `feature-support` + `feature-legal`                | Low    | Phases 3, 4, 5                                                                |

**Next recommended sequence:** 3 → 4 → 5 (these unblock 6, 10, 11–16, and complete the in-progress playback/download packages).

Phases 4, 8 can run in parallel with anything. Phase 9 is deferred until `moduleResolution: "bundler"` migration is complete. Phases 11–16 can run in parallel once Phases 3–5 are done. Phase 17 gates 18 and 19.

---

## Definition of Done

### Architecture cleanup (Phases 1–10)

- [ ] `pnpm typecheck` passes with zero errors
- [ ] `pnpm lint` passes with zero errors
- [ ] `@sd/shared` has no dependency on `@sd/core-api` or `@sd/core-config`
- [ ] No feature package lists `next` or `expo-router` in `dependencies` (only `peerDependencies`)
- [ ] `feature-navigation` does not depend on `feature-search`
- [ ] All route files are under 25 lines
- [ ] `routes` constant exported from `@sd/core-contracts` and used everywhere
- [ ] `pnpm dev:web` renders all routes without a blank flash
- [ ] `pnpm dev:mobile` shows all tabs with the custom tab bar

### Feature completeness (Phases 11–20)

- [ ] `/scholars/[slug]`, `/collections/[id]`, `/series/[id]`, `/lectures/[id]` all render on web
- [ ] Scholar, collection, series, lecture detail screens work on mobile
- [ ] Feed, Library, Account, Live, Support, Legal screens are real implementations (no placeholders)
- [ ] Audio plays on mobile with background support and lock screen controls
- [ ] Mini-player appears above tab bar on mobile and above footer on web
- [ ] Listening progress persists across app restarts
- [ ] Downloaded lectures play offline
- [ ] Outbox drains pending mutations on reconnect
