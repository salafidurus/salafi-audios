# Metadata

- **Date:** 2026-04-09
- **Status:** Planned
- **Scope:** `apps/web`, `apps/mobile` — cleanup of relics left behind by the migration
  from centralized `packages/features-*` into app-local `src/features/`
- **Summary:** Remove dead code, naming relics, duplicated responsive CSS modules, stray
  `.native.tsx` files in the web app, React Native / React Native Web / Unistyles
  infrastructure in `apps/web`, audit component export style (named only, except for
  Next.js required defaults), and standardize the responsive rendering strategy in
  `apps/web` so that mobile/desktop branching uses a single source of truth.
- **Dependencies:**
  - Prior migration PRs that dissolved `packages/features-*` into `apps/web/src/features`
    and `apps/mobile/src/features` must be merged (they are — see commit `777d221`).
  - No blocking architectural decisions outstanding.

# Progress

## Already done (prior work, referenced here for context)

- `packages/features-*` have been dissolved. Features now live under
  `apps/web/src/features/*` and `apps/mobile/src/features/*`.
- `apps/web/AGENT.md` already declares: "no React Native Web" and "CSS-responsive default".
- Several `apps/mobile/src/types/unistyles-*.d.ts` and `apps/mobile/src/unistyles.d.ts`
  files are already deleted in the working tree (see `git status`).
- `useResponsive()` hook exists at `apps/web/src/shared/hooks/use-responsive.ts` and is
  already used by a small number of components (`sign-in`, `sign-up`, `sidebar`,
  `top-auth-strip`, `ScreenInProgress`, `AuthRequiredState`).

## Current state (relics the migration did not clean up)

1. **`apps/web` still depends on React Native stack.** `apps/web/package.json` declares
   `react-native`, `react-native-web`, `react-native-unistyles`, `react-native-safe-area-context`.
   `next.config.ts` configures a `react-native → react-native-web` alias, a `__DEV__`
   DefinePlugin, and `.native.*` resolver extensions.
2. **Unistyles bootstrap still present in web.** `apps/web/src/core/styles/unistyles.ts`
   and `apps/web/src/core/styles/UnistylesStyle.tsx` are imported from
   `apps/web/src/app/layout.tsx`.
3. **Unistyles type augmentation files still present in web.**
   `apps/web/src/unistyles.d.ts` and `apps/web/src/types/unistyles-native.d.ts`.
4. **Web components still import from `react-native-unistyles`.** 20 files (see Stage 4).
   Examples: `apps/web/src/shared/components/AppText/AppText.tsx`,
   `apps/web/src/shared/components/UniversalList/UniversalList.tsx`,
   `apps/web/src/shared/components/ScreenView/ScreenView.tsx`,
   `apps/web/src/shared/components/Button/Button.mobile.tsx`, and every
   `apps/web/src/features/search/components/*/*.mobile.tsx`.
5. **Stray `.native.tsx` files in `apps/web`.** All 5 files under
   `apps/web/src/features/admin/screens/admin-*/*.screen.native.tsx`. These are relics —
   `apps/web` does not ship native, so `.native.tsx` files must not exist here.
6. **Duplicated `responsive.module.css`.** 10 identical copies of the same 18-line file
   exist under `apps/web/src/features/*/screens/responsive.module.css`. They all define
   the same `mobileOnly` / `desktopOnly` classes.
7. **Wasteful dual-rendering pattern.** Every "responsive router" screen
   (`feed.screen.tsx`, `feed-recent.screen.tsx`, `admin-dashboard.screen.tsx`,
   `search-home.screen.tsx`, `lecture-detail.screen.tsx`, `library-*.tsx`, etc.) renders
   **both** the mobile and desktop trees and hides one with `display: none`. This doubles
   render/hydration cost and conflicts with the `useResponsive()` hook pattern already
   used elsewhere. Pick one: the established direction per `apps/web/AGENT.md` is the
   hook + conditional render.
8. **`Web` / `DesktopWeb` / `MobileWeb` naming relics.** Components live in `apps/web`
   already; the `Web` suffix dated from the era when they were shared with a native
   build. Examples: `AppTextWeb`, `ButtonDesktopWeb`, `ButtonMobileWeb`,
   `ScreenViewWeb`, `UniversalListWeb`, `UnistylesStyleDesktopWeb`,
   `FeedDesktopWebScreen`, `FeedMobileWebScreen`, `AdminDashboardDesktopWebScreen`, etc.
9. **Export style audit needed.** Grep shows 0 `export default` inside
   `apps/web/src/features`, `apps/web/src/shared`, `apps/mobile/src/features`,
   `apps/mobile/src/shared` — good. But `app/**/layout.tsx` and `app/**/page.tsx` in Next.js
   and `app/_layout.tsx` in Expo Router are _required_ to use `export default`. The audit
   must codify this rule, not regress it. Also confirm `index.ts` barrels use only named
   re-exports.
10. **Mobile-side still imports from `react-native-unistyles/components/native/*`.**
    Several mobile files already modified in the working tree use this path — not in
    scope for this cleanup plan (mobile should keep Unistyles), but the plan must avoid
    touching mobile except where clearly a leftover from the old shared layout.

## Immediate next step

Execute Stage 1 (create the unified responsive infrastructure) first so later stages
can depend on it.

# Staging Strategy

The stages are dependency-ordered:

1. **Stage 1** — Add the single canonical `useResponsive()` render-branching helper and
   a single shared `responsive.module.css` used as a fallback, so every subsequent stage
   can migrate screens one-at-a-time.
2. **Stage 2** — Delete stray `.native.tsx` files from `apps/web` (pure deletion, no
   dependencies on other stages).
3. **Stage 3** — Rewrite `apps/web/src/shared/components/*` that still use
   `react-native-unistyles` as plain React + CSS Modules. This unblocks feature files
   that import them.
4. **Stage 4** — Rewrite `apps/web/src/features/search/components/*.mobile.tsx` and
   any other feature files still using `react-native-unistyles`.
5. **Stage 5** — Migrate every "responsive router" screen from dual-rendering +
   `mobileOnly/desktopOnly` CSS to `useResponsive()` conditional rendering, and delete
   the 10 duplicated `responsive.module.css` files.
6. **Stage 6** — Rename `*Web` / `*DesktopWeb` / `*MobileWeb` identifiers to drop the
   `Web` suffix, and rename files to drop `.mobile.tsx` / `.desktop.tsx` where the
   component is no longer needed (collapsed into one). Update every call site.
7. **Stage 7** — Delete Unistyles bootstrap from `apps/web/src/core/styles/*`, delete
   `apps/web/src/unistyles.d.ts` and `apps/web/src/types/unistyles-native.d.ts`, remove
   `UnistylesStyleDesktopWeb` from `apps/web/src/app/layout.tsx`.
8. **Stage 8** — Remove `react-native`, `react-native-web`, `react-native-unistyles`,
   `react-native-safe-area-context` from `apps/web/package.json`, remove the
   corresponding `next.config.ts` alias / DefinePlugin / `.native.*` resolver entries,
   and run `pnpm install`.
9. **Stage 9** — Audit export style across both apps: enforce named exports everywhere
   except in Next.js `layout.tsx` / `page.tsx` / `error.tsx` / `not-found.tsx` /
   `loading.tsx` / `template.tsx` / `route.ts` (which require default exports) and Expo
   Router `apps/mobile/src/app/**/_layout.tsx` / `apps/mobile/src/app/**/*.tsx`
   route files (which require default exports). Add an ESLint rule to lock it in.
10. **Stage 10** — Final verification pass.

Each stage is small enough to commit independently and, except where noted, does not
require test rewrites because the rewrites are presentational.

---

## Stage 1: Establish canonical responsive rendering utilities

**Status:** Planned

**Goal:** Give every web feature a single way to branch on viewport, and a single
`responsive.module.css` if CSS-based branching is ever needed again.

**Files:**

- Modify: `apps/web/src/shared/hooks/use-responsive.ts`
  - Add a second exported helper `useIsDesktop()` that returns `boolean` and is
    SSR-safe (same default as current `useResponsive()` — assume desktop during SSR).
- Create: `apps/web/src/shared/components/Responsive/Responsive.tsx`
  - Small client component `<Responsive mobile={<M/>} desktop={<D/>} />` that calls
    `useResponsive()` and renders exactly one branch. This replaces the
    `mobileOnly`/`desktopOnly` CSS pattern.
- Create: `apps/web/src/shared/components/Responsive/index.ts` (named re-export only).
- Create: `apps/web/src/shared/styles/responsive.module.css`
  - Single file with `.mobileOnly` / `.desktopOnly` rules kept as a **fallback** for any
    non-React-render case (e.g. server-rendered marketing pages where we want no JS).
    Not expected to be widely used.
- Create: `apps/web/src/shared/components/Responsive/Responsive.spec.tsx`
  - Jest + `@testing-library/react` test: mocks `window.innerWidth` at 320 → asserts
    only `mobile` prop is rendered; at 1440 → asserts only `desktop` prop is rendered.

**Changes:**

- `<Responsive>` must only render the chosen branch — no dual render.
- `useResponsive()` SSR default must remain desktop-biased to avoid hydration flash on
  crawler bots.
- Named exports only.

**Blockers:** None currently identified.

**Dependencies:** None. This stage is the foundation.

**Completion Criteria:**

- `pnpm --filter web test -- src/shared/components/Responsive/Responsive.spec.tsx` passes.
- `pnpm --filter web typecheck` passes.
- `pnpm --filter web lint` passes.

**Suggested Commit Message:**

```text
feat(web/shared): add Responsive component and unified useResponsive helpers

Introduces a single render-branching primitive so feature screens can stop
double-rendering both mobile and desktop trees.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

---

## Stage 2: Delete `.native.tsx` relics from `apps/web`

**Status:** Planned

**Goal:** `apps/web` must contain zero `.native.tsx` files.

**Files (delete):**

- `apps/web/src/features/admin/screens/admin-dashboard/admin-dashboard.screen.native.tsx`
- `apps/web/src/features/admin/screens/admin-livestreams/admin-livestreams.screen.native.tsx`
- `apps/web/src/features/admin/screens/admin-permissions/admin-permissions.screen.native.tsx`
- `apps/web/src/features/admin/screens/admin-scholars/admin-scholars.screen.native.tsx`
- `apps/web/src/features/admin/screens/admin-topics/admin-topics.screen.native.tsx`

**Files (modify):**

- `apps/web/next.config.ts` — remove `.native.tsx`, `.native.ts`, `.native.jsx`,
  `.native.js` entries from `config.resolve.extensions` and
  `turbopack.resolveExtensions`. (Full dependency removal happens in Stage 8; here we
  only remove the `.native.*` entries so that dead files never resolve again.)

**Changes:**

- Verify with `rg "\\.native\\.(t|j)sx?" apps/web/` — must return zero matches.

**Blockers:** None currently identified.

**Dependencies:** None. Independent of Stage 1.

**Completion Criteria:**

- `pnpm --filter web typecheck` passes.
- `pnpm --filter web build` succeeds.
- No file in `apps/web/` matches `*.native.ts(x)`.

**Suggested Commit Message:**

```text
chore(web): remove stray .native.tsx files and native resolver extensions

These files were relics from when admin screens lived in a shared package that also
targeted native. apps/web does not ship native; drop the files and the native
resolver entries.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

---

## Stage 3: Rewrite `apps/web/src/shared/components/*` off react-native-unistyles

**Status:** Planned

**Goal:** Every `apps/web/src/shared/components/*` file becomes plain React + CSS
Modules (or inline style where trivial), with no imports from `react-native`,
`react-native-web`, or `react-native-unistyles`. Consume design tokens from
`@sd/design-tokens` via a CSS-variable layer we already expose in
`apps/web/src/app/theme-css.ts` / `globals.css`.

**Files to rewrite:**

- `apps/web/src/shared/components/AppText/AppText.tsx`
  - Replace RN `Text` + `useUnistyles()` with a `<span>` / `<p>` (variant-driven tag)
    and `app-text.module.css` that maps variant → class.
- `apps/web/src/shared/components/UniversalList/UniversalList.tsx`
  - Replace RN `View` with a plain `<ul>` (or `<div>` if semantics would be wrong) and
    `Fragment` separators.
- `apps/web/src/shared/components/ScreenView/ScreenView.tsx`
  - Replace RN `View` + `StyleSheet.create` with `<div>` + `screen-view.module.css`.
    Preserve the `backgroundVariant` API via `data-bg="primaryWash"` attributes.
- `apps/web/src/shared/components/Button/Button.tsx`
  - Already uses plain `<button>` + CSS Modules — no rewrite needed. Only rename in
    Stage 6.
- Delete: `apps/web/src/shared/components/Button/Button.mobile.tsx`
  - Its behavior (label, icon, loading, fullWidth, variant, size) must be folded into
    the single `Button.tsx` as optional props. Loading state uses a CSS spinner, not
    `ActivityIndicator`.
- `apps/web/src/shared/components/ScreenInProgress/ScreenInProgress.mobile.tsx`
  - Rewrite as plain React + CSS Modules; or delete if the non-mobile `ScreenInProgress.tsx`
    already handles every viewport (check first, then decide).
- `apps/web/src/shared/components/AuthRequiredState/*`
  - Audit both `.desktop.tsx` and `.mobile.tsx`; if they share 80%+ markup, collapse
    into one responsive file using a CSS-only layout.
- Co-located specs (`.spec.tsx`) — update or create if missing.

**Changes:**

- **TDD required for any file with logic** (e.g. `Button`'s `loading` disables click,
  `ScreenView`'s `backgroundVariant` mapping). Write the failing test first.
- Presentational-only rewrites (no logic) are exempt from TDD per root `AGENT.md`, but
  must still run `pnpm --filter web test` at the end.
- Keep props identical (same public surface) so Stage 4/5 call sites do not need to
  change yet.
- No `useUnistyles()` — read theme via CSS variables (see `apps/web/src/app/theme-css.ts`
  for the existing mapping).

**Blockers:** None currently identified.

**Dependencies:** Stage 1 (for `<Responsive>` if any shared component needs branching).

**Completion Criteria:**

- `rg "react-native|react-native-web|react-native-unistyles" apps/web/src/shared` returns
  zero matches.
- `pnpm --filter web test` passes.
- `pnpm --filter web typecheck` passes.
- `pnpm --filter web build` succeeds.

**Suggested Commit Message:**

```text
refactor(web/shared): rewrite shared components off react-native-unistyles

AppText, UniversalList, ScreenView, Button, ScreenInProgress, and AuthRequiredState
now render as plain React with CSS Modules and consume design tokens via CSS
variables. Public prop surface is preserved.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

---

## Stage 4: Rewrite `apps/web/src/features/**` files off react-native-unistyles

**Status:** Planned

**Goal:** Zero imports from `react-native`, `react-native-web`, or
`react-native-unistyles` anywhere under `apps/web/src/features`.

**Files to rewrite (all in `apps/web/src/features/search/components/`):**

- `BrowseCard/BrowseCard.mobile.tsx`
- `MarqueeText/MarqueeText.mobile.tsx`
- `QuickBrowse/QuickBrowse.mobile.tsx`
- `SearchButton/SearchButton.mobile.tsx`
- `SearchFilter/SearchFilter.mobile.tsx`
- `SearchInput/SearchInput.mobile.tsx`
- `SearchResultEmpty/SearchResultEmpty.mobile.tsx`
- `SearchResultItem/SearchResultItem.mobile.tsx`
- `SearchResultsList/SearchResultsList.mobile.tsx`

**Files to rewrite (search screens):**

- `apps/web/src/features/search/screens/search-home/search-home.screen.mobile.tsx`
- `apps/web/src/features/search/screens/search-processing/search-processing.screen.mobile.tsx`

**Changes:**

- Replace `View`/`Text`/`Pressable`/`StyleSheet`/`useUnistyles` with `<div>` / `<span>` /
  `<button>` / CSS Modules.
- `MarqueeText` animation: use CSS `@keyframes` + `animation` instead of a JS-driven RN
  animation loop.
- Keep the `.mobile.tsx` suffix in place for now — Stage 5 decides per-screen whether
  to collapse into a single file. This stage only removes RN dependencies.
- TDD for anything with logic (e.g. `SearchFilter` toggling, `SearchInput` debounced
  change); presentational-only components are exempt.

**Blockers:** None currently identified.

**Dependencies:** Stage 3 (`AppText`, `Button`, etc. must already be plain React).

**Completion Criteria:**

- `rg "react-native|react-native-web|react-native-unistyles" apps/web/src/features` returns
  zero matches.
- `pnpm --filter web test` passes.
- `pnpm --filter web typecheck` passes.
- `pnpm --filter web build` succeeds.

**Suggested Commit Message:**

```text
refactor(web/search): rewrite mobile search components off react-native-unistyles

BrowseCard, MarqueeText, QuickBrowse, SearchButton, SearchFilter, SearchInput,
SearchResultEmpty, SearchResultItem, SearchResultsList, and their mobile screens
now render as plain React with CSS Modules.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

---

## Stage 5: Collapse responsive router screens and dedupe `responsive.module.css`

**Status:** Planned

**Goal:** Replace the dual-render `display: none` pattern with `<Responsive>`. Delete
the 10 per-feature `responsive.module.css` files. Delete or merge sibling
`.desktop.tsx` / `.mobile.tsx` files where they are just thin wrappers that could be a
single CSS-responsive component.

**Files to modify (responsive router screens — use `<Responsive>`):**

- `apps/web/src/features/feed/screens/feed.screen.tsx`
- `apps/web/src/features/feed/screens/feed-recent.screen.tsx`
- `apps/web/src/features/feed/screens/feed-following.screen.tsx`
- `apps/web/src/features/admin/screens/admin-dashboard/admin-dashboard.screen.tsx`
- `apps/web/src/features/admin/screens/admin-livestreams/admin-livestreams.screen.tsx`
- `apps/web/src/features/admin/screens/admin-permissions/admin-permissions.screen.tsx`
- `apps/web/src/features/admin/screens/admin-scholars/admin-scholars.screen.tsx`
- `apps/web/src/features/admin/screens/admin-topics/admin-topics.screen.tsx`
- `apps/web/src/features/search/screens/search-home/search-home.screen.tsx`
- `apps/web/src/features/search/screens/search-processing/search-processing.screen.tsx`
- `apps/web/src/features/lecture/screens/lecture-detail/lecture-detail.screen.tsx`
- `apps/web/src/features/library/screens/library-saved.screen.tsx`
- `apps/web/src/features/library/screens/library-completed.screen.tsx`
- `apps/web/src/features/library/screens/library.screen.tsx`
- `apps/web/src/features/account/screens/account.screen.tsx`
- `apps/web/src/features/account/screens/account-profile.screen.tsx`
- `apps/web/src/features/legal/screens/privacy.screen.tsx` (if it follows the pattern)
- `apps/web/src/features/legal/screens/terms-of-use.screen.tsx` (if it follows the pattern)
- `apps/web/src/features/live/screens/live.screen.tsx`
- `apps/web/src/features/live/screens/live-scheduled.screen.tsx`
- `apps/web/src/features/live/screens/live-ended.screen.tsx`
- `apps/web/src/features/scholar/screens/scholar-list/scholar-list.screen.tsx`
- `apps/web/src/features/scholar/screens/scholar-detail/scholar-detail.screen.tsx`
- `apps/web/src/features/support/screens/support.screen.tsx`
- `apps/web/src/features/auth/screens/sign-in/sign-in.screen.tsx` (already uses hook — verify)
- `apps/web/src/features/auth/screens/sign-up/sign-up.screen.tsx` (already uses hook — verify)

**Files to delete (duplicated `responsive.module.css`):**

- `apps/web/src/features/feed/screens/responsive.module.css`
- `apps/web/src/features/admin/screens/responsive.module.css`
- `apps/web/src/features/search/screens/responsive.module.css`
- `apps/web/src/features/lecture/screens/responsive.module.css`
- `apps/web/src/features/library/screens/responsive.module.css`
- `apps/web/src/features/account/screens/responsive.module.css`
- `apps/web/src/features/legal/screens/responsive.module.css`
- `apps/web/src/features/live/screens/responsive.module.css`
- `apps/web/src/features/scholar/screens/responsive.module.css`
- `apps/web/src/features/support/screens/responsive.module.css`

**Changes per router file:**

Before:

```tsx
"use client";
import { FeedDesktopWebScreen } from "./feed-recent.screen.desktop";
import { FeedMobileWebScreen } from "./feed-recent.screen.mobile";
import styles from "./responsive.module.css";

export function FeedRecentResponsiveScreen(props) {
  return (
    <>
      <div className={styles.mobileOnly}>
        <FeedMobileWebScreen {...props} />
      </div>
      <div className={styles.desktopOnly}>
        <FeedDesktopWebScreen {...props} />
      </div>
    </>
  );
}
```

After:

```tsx
"use client";
import { Responsive } from "@/shared/components/Responsive";
import { FeedRecentDesktopScreen } from "./feed-recent.screen.desktop";
import { FeedRecentMobileScreen } from "./feed-recent.screen.mobile";

export function FeedRecentScreen(props: FeedRecentScreenProps) {
  return (
    <Responsive
      mobile={<FeedRecentMobileScreen {...props} />}
      desktop={<FeedRecentDesktopScreen {...props} />}
    />
  );
}
```

- Where the `.desktop.tsx` and `.mobile.tsx` differ only in a handful of sizes/spacing
  and share 80%+ markup, collapse them into a single `*.screen.tsx` using CSS-only
  responsive rules and delete the two variants.
- Update any `app/**/page.tsx` that imported the old responsive-router component name.

**Blockers:** None currently identified.

**Dependencies:** Stages 1, 3, 4.

**Completion Criteria:**

- `rg "mobileOnly|desktopOnly" apps/web/src/features` returns zero matches.
- No duplicated `responsive.module.css` remains under `apps/web/src/features`.
- Every responsive router screen imports `Responsive` from the shared location.
- `pnpm --filter web test` passes.
- `pnpm --filter web test:e2e` passes (Playwright smoke of key routes: `/`, `/feed`,
  `/library`, `/scholar`, `/admin/dashboard`, `/search`, `/lecture/[slug]`).
- `pnpm --filter web typecheck` and `pnpm --filter web build` pass.

**Suggested Commit Message:**

```text
refactor(web): replace dual-render responsive routers with <Responsive>

Feature screens now render exactly one branch instead of rendering both and hiding
one with CSS. Deletes 10 duplicated responsive.module.css files.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

---

## Stage 6: Drop `Web` / `DesktopWeb` / `MobileWeb` suffix from identifiers and filenames

**Status:** Planned

**Goal:** Components and files that live in `apps/web` do not need to brand themselves
as `Web`. Rename every exported identifier, filename, and import site.

**Identifier renames (non-exhaustive; Stage execution must grep for the full set):**

- `AppTextWeb` → `AppText`
- `ButtonDesktopWeb` → `Button`
- `ButtonMobileWeb` → folded into `Button` during Stage 3 (deleted here)
- `ScreenViewWeb` → `ScreenView`
- `UniversalListWeb` → `UniversalList`
- `UnistylesStyleDesktopWeb` → deleted in Stage 7
- `FeedDesktopWebScreen` → `FeedDesktopScreen`
- `FeedMobileWebScreen` → `FeedMobileScreen`
- `FeedRecentResponsiveScreen` → `FeedRecentScreen`
- `FeedResponsiveScreen` → `FeedScreen`
- `AdminDashboardResponsiveScreen` → `AdminDashboardScreen`
- `AdminDashboardDesktopWebScreen` → `AdminDashboardDesktopScreen`
- `AdminDashboardMobileWebScreen` → `AdminDashboardMobileScreen`
- …same for every other `*DesktopWebScreen` / `*MobileWebScreen` /
  `*ResponsiveScreen`.
- `AppTextProps`, `ButtonDesktopWebProps`, `ButtonMobileWebProps`,
  `ScreenViewProps`, `UniversalListWebProps` → drop `Web` suffix consistently.

**File renames:**

- None at the component level in `apps/web/src/shared` (already named `AppText.tsx`,
  `Button.tsx`, etc.). Just delete `Button.mobile.tsx` (done in Stage 3).
- Feature screens: leave filenames alone — keep `*.screen.desktop.tsx` and
  `*.screen.mobile.tsx` where two variants still exist. Only the exported symbols
  change.

**Call site updates:**

- `apps/web/src/app/**/page.tsx` — every Next.js page that imports a `*ResponsiveScreen`
  must be updated.
- Feature-level `index.ts` barrels (e.g. `apps/web/src/features/feed/index.ts`,
  `apps/web/src/features/lecture/index.ts`) must re-export under the new names.

**Blockers:** None currently identified.

**Dependencies:** Stages 3, 4, 5.

**Completion Criteria:**

- `rg "DesktopWeb|MobileWeb\b|ResponsiveScreen\b" apps/web/src` returns zero matches
  (aside from `feed-recent.screen.*`-style filenames which remain).
- `rg "Web\\b" apps/web/src/shared/components` returns only acceptable matches
  (e.g. none).
- `pnpm --filter web typecheck` passes.
- `pnpm --filter web build` succeeds.
- `pnpm --filter web test` passes.

**Suggested Commit Message:**

```text
refactor(web): drop 'Web' suffix from components and screens

Components and screens in apps/web no longer carry the Web/DesktopWeb/MobileWeb
suffix that dated from the shared-package era.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

---

## Stage 7: Delete Unistyles bootstrap and type augmentation from `apps/web`

**Status:** Planned

**Goal:** No Unistyles code in `apps/web`.

**Files to delete:**

- `apps/web/src/core/styles/unistyles.ts`
- `apps/web/src/core/styles/UnistylesStyle.tsx`
- `apps/web/src/unistyles.d.ts`
- `apps/web/src/types/unistyles-native.d.ts`
- `apps/web/src/types/` directory if now empty.

**Files to modify:**

- `apps/web/src/app/layout.tsx`
  - Remove `import { UnistylesStyleDesktopWeb } from "../core/styles/UnistylesStyle";`
  - Remove the `<UnistylesStyleDesktopWeb>` wrapper. The dark/light theme flow was
    handled by `document.documentElement.setAttribute("data-theme", ...)` inside
    `UnistylesStyle.tsx`. That logic must be preserved — move it into a small
    `apps/web/src/core/styles/ThemeSync.tsx` client component that only handles the
    `prefers-color-scheme` listener and sets `data-theme`, with no Unistyles runtime
    calls.
  - Wire `<ThemeSync>` into `layout.tsx`.
- `apps/web/src/core/providers.tsx` — check for any Unistyles provider and remove.

**Changes:**

- The `data-theme` CSS-variable flow defined in
  `apps/web/src/app/theme-css.ts` / `globals.css` must keep working.
- Dark mode must continue to track `prefers-color-scheme`.

**Blockers:** None currently identified.

**Dependencies:** Stages 3, 4 (nothing in `apps/web/src/**` may still import Unistyles).

**Completion Criteria:**

- `rg "unistyles|react-native-unistyles" apps/web/src` returns zero matches.
- Toggling OS dark mode still flips `data-theme` on `<html>` (manual smoke).
- `pnpm --filter web typecheck`, `test`, `build` all pass.

**Suggested Commit Message:**

```text
chore(web): delete Unistyles bootstrap and type augmentation

Replaces UnistylesStyle with a focused ThemeSync client component that only handles
the prefers-color-scheme listener.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

---

## Stage 8: Remove React Native deps from `apps/web/package.json` and `next.config.ts`

**Status:** Planned

**Goal:** `apps/web` no longer depends on `react-native*`. Next.js builds without the
alias.

**Files to modify:**

- `apps/web/package.json` — remove, from `dependencies`:
  - `react-native`
  - `react-native-safe-area-context`
  - `react-native-unistyles`
  - `react-native-web`
- `apps/web/next.config.ts` — remove:
  - The `webpack(config)` callback in its entirety if it only configured the
    react-native-web alias, the `__DEV__` DefinePlugin, and custom `resolveExtensions`.
    Otherwise, remove only those three entries.
  - The `turbopack.resolveAlias["react-native"]` entry.
  - The entire `turbopack.resolveExtensions` override (default Next.js extensions
    suffice once `.native.*` and `.web.*` are gone).
- `apps/web/AGENT.md` — remove any lines that still document the Unistyles bootstrap
  or the `react-native → react-native-web` alias. Keep the "no React Native Web" rule.

**Changes:**

- Run `pnpm --filter web add` / `pnpm install` as required by Stage-8 skill: use
  `pnpm --filter web remove react-native react-native-web react-native-unistyles
react-native-safe-area-context` (per `feedback_pnpm_add.md` memory — always use
  `pnpm --filter`, never hand-edit + reinstall).
- Regenerate the lockfile (`pnpm install`).

**Blockers:** None currently identified.

**Dependencies:** Stage 7. Must be last before the audit stage because any remaining
import would break the build.

**Completion Criteria:**

- `rg "\"react-native" apps/web/package.json` returns zero matches.
- `rg "react-native" apps/web/next.config.ts` returns zero matches.
- `pnpm install` succeeds with no peer-dependency errors.
- `pnpm --filter web build` succeeds.
- `pnpm --filter web test` passes.
- `pnpm --filter web test:e2e` passes.

**Suggested Commit Message:**

```text
chore(web): drop react-native, react-native-web, unistyles, safe-area-context

apps/web is React-only. Removes the deps, the next.config alias, the DefinePlugin
for __DEV__, and the custom resolveExtensions override.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

---

## Stage 9: Enforce named-export policy across both apps

**Status:** Planned

**Goal:** Named exports are the default everywhere. Default exports are allowed only
where the framework requires them:

- Next.js (`apps/web`):
  - `src/app/**/layout.tsx`
  - `src/app/**/page.tsx`
  - `src/app/**/error.tsx`
  - `src/app/**/not-found.tsx`
  - `src/app/**/loading.tsx`
  - `src/app/**/template.tsx`
  - `src/app/**/default.tsx`
  - `src/app/**/global-error.tsx`
  - `src/app/**/route.ts` (HTTP method exports are named — default allowed for middleware)
  - `src/middleware.ts`
  - `src/instrumentation.ts`
- Expo Router (`apps/mobile`):
  - `src/app/**/_layout.tsx`
  - Any file that defines a route under `src/app/**/*.tsx`
    (Expo Router requires default exports for screen routes).

**Files to modify:**

- `packages/util-config/eslint/web.mjs` (or wherever `apps/web` flat config lives):
  - Add `import/no-default-export` at `error` for `src/features/**`, `src/shared/**`,
    `src/core/**`.
  - Override to `off` for the allowed Next.js paths above.
- `packages/util-config/eslint/mobile.mjs` (or wherever `apps/mobile` flat config lives):
  - Add `import/no-default-export` at `error` for `src/features/**`, `src/shared/**`,
    `src/core/**`.
  - Override to `off` for `src/app/**`.
- Fix any existing violations the new rule reports.
- Audit `index.ts` barrels under `apps/web/src/features/*/index.ts` and
  `apps/mobile/src/features/*/index.ts` — ensure each uses only `export { X } from ...`
  (no `export { default as X }`).

**Changes:**

- Document the policy in `apps/web/AGENT.md` and `apps/mobile/AGENT.md` under a new
  "Export style" subsection.

**Blockers:** None currently identified.

**Dependencies:** Stages 1–8 (so rename churn does not fight the lint rule).

**Completion Criteria:**

- `pnpm --filter web lint` passes with the new rule enabled.
- `pnpm --filter mobile lint` passes with the new rule enabled.
- `pnpm --filter web typecheck` and `pnpm --filter mobile typecheck` pass.

**Suggested Commit Message:**

```text
chore(config): enforce named exports outside framework route files

Adds import/no-default-export to web and mobile eslint configs with overrides for
Next.js app-router files and Expo Router screen files.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

---

## Stage 10: Final verification pass

**Status:** Planned

**Goal:** Confirm the cleanup holds together at monorepo level.

**Checks:**

- `pnpm typecheck` — full monorepo clean.
- `pnpm lint` — full monorepo clean.
- `pnpm test` — full monorepo clean.
- `pnpm build` — all apps and packages build.
- `pnpm --filter web test:e2e` — Playwright smoke of:
  - `/`, `/feed`, `/feed/following`, `/library`, `/library/saved`, `/lecture/[slug]`,
    `/scholar`, `/scholar/[slug]`, `/search`, `/admin/dashboard`, `/admin/scholars`,
    `/admin/topics`, `/admin/livestreams`, `/admin/permissions`, `/sign-in`, `/sign-up`,
    `/support`, `/legal/privacy`, `/legal/terms-of-use`, `/live/*`.
  - Each route must render one tree (no `display: none` phantom), and viewport resize
    must switch branches without full reload.
- Manual dark-mode toggle on `apps/web` — `data-theme` still flips.
- Manual run of `apps/mobile` — Android + iOS still boot (no accidental web-side
  cleanup bled into mobile).
- Grep sweeps — all must return zero:
  - `rg "react-native" apps/web`
  - `rg "react-native-web" apps/web`
  - `rg "react-native-unistyles" apps/web`
  - `rg "DesktopWeb|MobileWeb\b" apps/web/src`
  - `rg "mobileOnly|desktopOnly" apps/web/src/features`
  - `rg "\\.native\\.(t|j)sx?" apps/web`
  - `rg "export default" apps/web/src/features apps/web/src/shared apps/mobile/src/features apps/mobile/src/shared`

**Blockers:** None currently identified.

**Dependencies:** All prior stages.

**Completion Criteria:** Every check above passes.

**Suggested Commit Message:** n/a — verification only.

---

# Final Verification

See Stage 10.

Additional repo-level checks:

- `pnpm test:prepush` green.
- Conventional Commits respected across the stage commits.
- No `@sd/features-*` or `packages/features-*` imports remain anywhere in the repo
  (regression guard against the old centralized layout).
- `docs/web.md` updated if it still references the old responsive pattern or
  Unistyles on web.

# Plan Completion

This plan is `Completed` when:

- Every stage from 1 to 10 is `Completed`.
- All `Final Verification` checks pass on `main` (or the integration branch).
- `apps/web/package.json` and `apps/web/next.config.ts` contain no React Native
  references.
- `apps/web` builds, typechecks, tests, and e2e passes without Unistyles or
  react-native-web at runtime.
- `docs/web.md` and `apps/web/AGENT.md` reflect the new CSS-only responsive strategy
  and the named-export policy.

Once completed, move this file to `.agents/plans/completed/` and update the metadata
status to `Completed`.
