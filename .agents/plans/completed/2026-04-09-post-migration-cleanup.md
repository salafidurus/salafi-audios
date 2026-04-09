# Metadata

- **Date:** 2026-04-09
- **Status:** Complete ✅ (2026-04-09)
- **Scope:** `apps/web`, `apps/mobile` — cleanup of relics left behind by the migration
  from centralized `packages/features-*` into app-local `src/features/`
- **Summary:** Remove dead code, naming relics, duplicated responsive CSS modules, stray
  `.native.tsx` files in the web app, React Native / React Native Web / Unistyles
  infrastructure in `apps/web`, audit component export style (named only, except for
  Next.js/Expo Router required defaults), standardize the responsive rendering strategy
  in `apps/web` so that mobile/desktop branching uses a single source of truth, remove
  `MobileNative`/`Native` suffixes from 93+ mobile component exports, add consistent
  feature barrel exports to the 12 `apps/mobile` features that are missing them, and
  simplify internal naming in `apps/mobile/src/core/`, trim dead exports from
  `packages/domain-playback`, remove the stale mobile-theme re-export from
  `packages/design-tokens/src/index.web.ts`, audit `packages/core-i18n` (abandoned —
  remove if confirmed unused), and remove the `packages/shared` ghost reference from the
  root `AGENT.md`.
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
9. **Export style and barrel scope audit needed.** Grep shows 0 `export default` inside
   feature and shared directories — good. But the rule must be codified. Additionally,
   `apps/web/src/features/*/index.ts` barrels must be **lean**: export only screens (the
   public routing surface of the feature) and components that are **demonstrably consumed
   by another feature**. Everything else (internal hooks, utilities, sub-components) stays
   private. Before adding any non-screen export to a barrel, verify a cross-feature
   consumer actually exists. The same restrained policy applies to `apps/mobile`.
10. **Mobile-side still imports from `react-native-unistyles/components/native/*`.**
    Several mobile files already modified in the working tree use this path — not in
    scope for this cleanup plan (mobile should keep Unistyles), but the plan must avoid
    touching mobile except where clearly a leftover from the old shared layout.

### `apps/mobile` — additional relics identified by deep audit

11. **`MobileNative` / `Native` naming relics — 93+ exports.** During the shared-package
    era components had to signal their platform. Now that they live inside `apps/mobile`
    the suffix is redundant:
    - `ButtonMobileNative` → `Button`
    - `CustomTabBarMobileNative` → `CustomTabBar`
    - `SubsectionBarHostMobileNative` → `SubsectionBarHost`
    - `ProvidersMobileNative` → `Providers`
    - `TextInputMobileNative` → `TextInput`
    - All `*MobileNativeScreen` exports → `*Screen`
    - `AppText` is already cleaned up (no suffix). `TabIcon` also clean. The rename
      is incomplete and inconsistent — needs to be finished systematically.

12. **Missing or over-scoped feature barrel exports.** `feed` and `lecture` have
    `index.ts` barrels; the remaining 12 features do not. Barrels must follow a lean
    policy: export only screens and components that have a confirmed cross-feature
    consumer. Internal hooks, utilities, and sub-components must not be re-exported.
    Before adding anything beyond screens, verify an actual caller outside the feature
    exists.

13. **`Mobile*` prefix on core config functions.** `getMobileRuntimeEnv()` and
    `getMobileBuildEnv()` in `apps/mobile/src/core/config/` carry a redundant `Mobile`
    infix. Internal functions within `apps/mobile` need no platform qualifier.

14. **`apps/mobile/AGENT.md` not updated.** Doesn't document the suffix removal
    convention, barrel strategy, or the type-declaration cleanup already done in this
    branch.

### `packages/*` — cleanup items identified by deep audit

15. **`packages/design-tokens/src/index.web.ts` exports mobile themes.** Lines 2-5 of
    `index.web.ts` re-export `lightMobileTheme` and `darkMobileTheme` from the native
    theme file, with a comment noting that "some workspace package builds resolve
    @sd/design-tokens through the default export path even when compiling native-only
    sources." After Stage 7 removes Unistyles from `apps/web`, no web-context file will
    need mobile themes. This export must be removed — but only _after_ Stages 3 and 7
    have been completed, because web files still reference these types during the
    intermediate migration.

16. **`packages/domain-playback` has potentially dead exports.** `index.ts` exports
    `usePlaybackStore`, `PlaybackStore`, `webPlaybackEngine`, `nativePlaybackEngine`,
    `PlaybackStatus`, `PlaybackState`, and `PlaybackEngine`. Grep of `apps/**` and
    `packages/**` shows none of these are imported outside the package itself. Before
    removing them, confirm by running:
    `rg "usePlaybackStore|PlaybackStore|PlaybackEngine|webPlaybackEngine|nativePlaybackEngine|PlaybackStatus|PlaybackState" apps/ packages/ --include="*.ts" --include="*.tsx" -l`
    If the only matches are inside `packages/domain-playback` itself, make them
    unexported internal implementation details rather than public API.

17. **`packages/core-i18n` appears abandoned.** `src/index.ts` is empty (one line,
    zero content). No app imports from `@sd/core-i18n`. Before deleting: check for any
    planned i18n work in `docs/`, then either remove the package entirely (and clean it
    from all `package.json` dependencies, `pnpm-workspace.yaml`, and `turbo.json`) or
    leave it as an explicit stub with a comment explaining its future purpose.

18. **`packages/shared` ghost reference in root `AGENT.md`.** The root `AGENT.md`
    package map lists `packages/shared — Cross-app utilities only (no platform-specific
UI primitives)` but this package does not exist in the repository. The line must be
    removed from `AGENT.md`.

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
10. **Stage 10** — Drop `MobileNative`/`Native` suffix from all 93+ mobile component and
    screen exports; rename call sites in `apps/mobile/src/app/**` and any `index.ts`
    barrels.
11. **Stage 11** — Add missing `index.ts` barrel exports to the 12 `apps/mobile`
    features that lack them, following the same named-export pattern as `feed` and
    `lecture`.
12. **Stage 12** — Simplify `Mobile*` prefix in `apps/mobile/src/core/config/` function
    names and update `apps/mobile/AGENT.md` to document the conventions now in place.
13. **Stage 13** — Packages cleanup: prune stale exports from `packages/domain-playback`,
    trim `packages/design-tokens` web entry once the web app no longer consumes mobile
    themes, audit `packages/core-i18n` (appears abandoned — decide keep or remove), and
    fix the `packages/shared` ghost reference in root `AGENT.md`.
14. **Stage 14** — Final verification pass.

Each stage is small enough to commit independently and, except where noted, does not
require test rewrites because the rewrites are presentational.

---

## Stage 1: Establish canonical responsive rendering utilities

**Status:** Complete ✅

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
  - **SSR / hydration safety is critical.** The component must match exactly what
    `useResponsive()` returns during SSR (desktop-biased default: `isMobile = false`).
    During the first client render before `useEffect` fires, the component must still
    render the desktop branch — this avoids a server/client mismatch. After `useEffect`
    fires and the real viewport is known, it can switch to the mobile branch if needed.
    This is identical to the pattern already used in
    `apps/web/src/features/auth/screens/sign-in/sign-in.screen.tsx` (which reads
    `useResponsive()` and defaults to desktop SSR). Do NOT add `suppressHydrationWarning`
    as a shortcut — fix the SSR default instead.
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

**AGENT.md updates (same commit):**

- `apps/web/AGENT.md` — add a **Responsive rendering** subsection:
  - The canonical branching primitive is `<Responsive mobile={…} desktop={…} />` from
    `src/shared/components/Responsive`.
  - SSR default is desktop. Mobile branch activates after first `useEffect` on narrow
    viewports. Do not use `display: none` to hide one tree.
  - `useResponsive()` from `src/shared/hooks/use-responsive` is the underlying hook;
    prefer the `<Responsive>` wrapper for screen-level branching.

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

**Status:** Complete ✅

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

- Verify with `rg --files apps/web -g '*.native.tsx' -g '*.native.ts'` — must return
  zero lines. **Note:** `rg "\\.native\\.(t|j)sx?" apps/web` searches file _contents_
  and will false-pass. Always use the filename glob form for this check.

**Blockers:** None currently identified.

**Dependencies:** None. Independent of Stage 1.

**Completion Criteria:**

- `pnpm --filter web typecheck` passes.
- `pnpm --filter web build` succeeds.
- `rg --files apps/web -g '*.native.tsx' -g '*.native.ts'` returns zero lines.
  (Do NOT use `rg "\\.native\\.(t|j)sx?" apps/web` — that searches file contents and
  will false-pass even when the files still exist.)

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

**Status:** Complete ✅

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

**AGENT.md updates (same commit):**

- `apps/web/AGENT.md` — add a **Shared components** subsection:
  - `src/shared/components/*` are plain React + CSS Modules. No React Native imports.
  - Design tokens are consumed via CSS variables (defined in `src/app/theme-css.ts`
    and `globals.css`), not via `useUnistyles()`.

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

**Status:** Complete ✅

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

**Status:** Complete ✅

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

**AGENT.md updates (same commit):**

- `apps/web/AGENT.md` — update the **Responsive Routing Architecture** section:
  - Replace the `display: none` dual-render description with: "Use `<Responsive>` from
    `src/shared/components/Responsive` to render exactly one branch. Do not render both
    trees and hide one with CSS."
  - Remove or archive any mention of per-feature `responsive.module.css` files. The
    single canonical file lives at `src/shared/styles/responsive.module.css`.

**Completion Criteria:**

- `rg "mobileOnly|desktopOnly" apps/web/src/features` returns zero matches.
- No duplicated `responsive.module.css` remains under `apps/web/src/features`.
- Every responsive router screen imports `Responsive` from the shared location.
- `pnpm --filter web test` passes.
- `pnpm --filter web test:e2e` passes (Playwright smoke: `/`, `/feed`, `/library`,
  `/scholars`, `/admin/dashboard`, `/search`, `/lectures/[id]`).
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

**Status:** Complete ✅

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
  `apps/web/src/features/lecture/index.ts`) must re-export renamed screen identifiers.
  Do NOT use this rename pass as an opportunity to add new exports — only update
  existing ones to their new names. The barrel scope policy (screens + confirmed
  cross-feature consumers only) is enforced in Stage 9.

**Blockers:** None currently identified.

**Dependencies:** Stages 3, 4, 5.

**AGENT.md updates (same commit):**

- `apps/web/AGENT.md` — add a **Naming conventions** subsection:
  - Components, hooks, and screens in `apps/web` must not carry a `Web`, `DesktopWeb`,
    or `MobileWeb` suffix. These suffixes dated from the shared-package era and are
    redundant now that code is app-local.
  - Correct: `AppText`, `Button`, `FeedRecentScreen`, `FeedDesktopScreen`.
  - Wrong: `AppTextWeb`, `ButtonDesktopWeb`, `FeedDesktopWebScreen`.

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

**Status:** Complete ✅

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

**AGENT.md updates (same commit):**

- `apps/web/AGENT.md` — update the **Platform bootstrap** section to remove all
  mention of Unistyles. Document `ThemeSync` as the only theme-management primitive:
  "Dark/light mode is handled by `ThemeSync` in `src/core/styles/ThemeSync.tsx`, which
  listens to `prefers-color-scheme` and sets `data-theme` on `<html>`. No Unistyles
  runtime is present in `apps/web`."

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

**Status:** Complete ✅

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

**AGENT.md updates (same commit):**

- `apps/web/AGENT.md` — remove any remaining mention of `react-native-web`, Webpack
  alias, `__DEV__` polyfill, or `.web.*` / `.native.*` resolver extensions.
  Add one line to the **Non-negotiables** section: "`apps/web` has no dependency on
  `react-native`, `react-native-web`, or `react-native-unistyles`. Do not add them."

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

## Stage 9: Enforce named-export policy across both apps (web)

**Status:** Complete ✅

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

- `packages/util-config/eslint/next.js` — this is the shared ESLint config consumed by
  `apps/web/eslint.config.js`. Add `import/no-default-export` at `error` for
  `src/features/**`, `src/shared/**`, `src/core/**`. Override to `off` for the allowed
  Next.js paths listed above.
  - **`src/app/**/route.ts` is NOT in the exception list.** Next.js App Router route
handlers use named exports (`GET`, `POST`, etc.) and must not use default exports.
    Do not add an override for route files.
- `packages/util-config/eslint/expo.js` — this is the shared ESLint config consumed by
  `apps/mobile/eslint.config.js`. Add `import/no-default-export` at `error` for
  `src/features/**`, `src/shared/**`, `src/core/**`. Override to `off` for `src/app/**`
  (Expo Router requires default exports for every route and layout file).
- Fix any existing violations the new rule reports.
- Audit `index.ts` barrels under `apps/web/src/features/*/index.ts` and
  `apps/mobile/src/features/*/index.ts`:
  - Named exports only — no `export { default as X }`.
  - **Web barrel scope rule (enforce now):** only export screens plus any component
    that is verifiably imported by a _different_ feature. To verify, grep for the
    component name outside its own feature folder before keeping it in the barrel.
    Remove any export that has no cross-feature consumer.
  - **Mobile barrel scope rule:** same policy — screens plus confirmed cross-feature
    consumers only. Do not add exports speculatively.
- Update `apps/web/AGENT.md` and `apps/mobile/AGENT.md` with a **Barrel exports**
  subsection documenting this policy so future contributors do not add speculative
  exports.

**Changes:**

- Document the policy in `apps/web/AGENT.md` and `apps/mobile/AGENT.md` under a new
  "Export style" subsection.
- Added `import/no-default-export` to `packages/util-config/eslint/next.js` and `expo.js`
  (scoped to `src/features/**`, `src/shared/**`, `src/core/**`) with overrides for
  Next.js App Router and Expo Router framework files.
- Added `no-restricted-syntax` barrel re-export restriction to `base.js` (all `src/**`),
  with designated barrel-file exemptions in `next.js`, `expo.js`, and `base.js`.
- Created `packages/util-config/eslint/packages.js` — extends `base.js` and adds
  `import/no-default-export` for `src/**`. Used by all packages that lint (`core-contracts`,
  `core-db`, `core-i18n`, `design-tokens`, `util-ingest`). Avoids plugin-conflict with
  the `import` plugin already registered by `eslint-config-next`/`eslint-config-expo`.
- All 5 linted packages updated to import from `@sd/util-config/eslint/packages`.

**Blockers:** None currently identified.

**Dependencies:** Stages 1–8 (so rename churn does not fight the lint rule).

**Completion Criteria:**

- `pnpm --filter web lint` passes with the new rule enabled. ✅
- `pnpm --filter mobile lint` passes with the new rule enabled. ✅
- Package lint passes (`core-contracts`, `core-db`, `core-i18n`, `design-tokens`, `util-ingest`). ✅
- `pnpm --filter web typecheck` and `pnpm --filter mobile typecheck` pass.

**Suggested Commit Message:**

```text
chore(config): enforce named exports outside framework route files

Adds import/no-default-export to web and mobile eslint configs with overrides for
Next.js app-router files and Expo Router screen files.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

---

## Stage 10: Drop `MobileNative` / `Native` suffix from mobile exports

**Status:** Complete ✅

**Goal:** Every component, hook, screen, and type exported from `apps/mobile/src/features/**`,
`apps/mobile/src/shared/**`, and `apps/mobile/src/core/**` uses a clean, unsuffixed name.
The full rename set was already partially started (e.g. `AppText`, `TabIcon` are clean) but
is inconsistent — finish it systematically.

**Rename mapping (non-exhaustive; execution must grep for the full set):**

- `ButtonMobileNative` → `Button` — `apps/mobile/src/shared/components/Button/Button.tsx`
- `ButtonMobileNativeProps` → `ButtonProps`
- `TextInputMobileNative` → `TextInput` — `apps/mobile/src/shared/components/TextInput/TextInput.tsx`
- `TextInputMobileNativeProps` → `TextInputProps`
- `CustomTabBarMobileNative` → `CustomTabBar` — `apps/mobile/src/features/navigation/components/CustomTabBar/CustomTabBar.tsx`
- `SubsectionBarHostMobileNative` → `SubsectionBarHost` — `apps/mobile/src/features/navigation/components/SubsectionBarHost/SubsectionBarHost.tsx`
- `ProvidersMobileNative` → `Providers` — `apps/mobile/src/core/providers.tsx`
- Every `*MobileNativeScreen` export → `*Screen` across all feature screen files
- Any remaining `*Native` or `*MobileNative` prop-type exports

**Strategy:**

- Run: `rg "MobileNative|Native\b" apps/mobile/src --include="*.tsx" --include="*.ts" -l`
  to get the full list of files before starting.
- Rename identifiers inside each file first; then grep all callers (mostly under
  `apps/mobile/src/app/**` and feature `index.ts` barrels) and update.
- Do NOT rename Expo Router route files under `apps/mobile/src/app/**` — those use
  `export default` and the identifier name is irrelevant.
- TDD is not required for pure identifier renames; run `pnpm --filter mobile typecheck`
  and `pnpm --filter mobile test` after each batch.

**Blockers:** None currently identified.

**Dependencies:** Stage 9 (ESLint rule is in place — catch any accidental regressions).

**AGENT.md updates (same commit):**

- `apps/mobile/AGENT.md` — add a **Naming conventions** subsection:
  - Components, hooks, and screens in `apps/mobile` must not carry a `Native`,
    `MobileNative`, or `Mobile` suffix. These suffixes dated from the shared-package
    era and are redundant now that code is app-local.
  - Correct: `Button`, `CustomTabBar`, `FeedScreen`, `Providers`.
  - Wrong: `ButtonMobileNative`, `CustomTabBarMobileNative`, `FeedMobileNativeScreen`.
  - `AppText` and `TabIcon` are already clean — use them as reference.

**Completion Criteria:**

- `rg "MobileNative|Native\b" apps/mobile/src --include="*.tsx" --include="*.ts"` returns
  zero matches (excluding comments and string literals that are just docs).
- `pnpm --filter mobile typecheck` passes.
- `pnpm --filter mobile test` passes.
- `pnpm --filter mobile lint` passes.

**Suggested Commit Message:**

```text
refactor(mobile): drop MobileNative/Native suffix from all component exports

Components in apps/mobile no longer carry the suffix that dated from the
shared-package era. Button, TextInput, CustomTabBar, SubsectionBarHost,
Providers, and all screen exports renamed to clean identifiers.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

---

## Stage 11: Add missing feature barrel exports to `apps/mobile`

**Status:** Complete ✅

**Goal:** All 14 `apps/mobile/src/features/*/` folders have a lean `index.ts` barrel.
Lean means: export only screens and components with a confirmed cross-feature consumer.
Do not speculatively export hooks, utilities, or sub-components.

**Missing barrels (create `index.ts` for each):**

- `apps/mobile/src/features/account/index.ts`
- `apps/mobile/src/features/auth/index.ts`
- `apps/mobile/src/features/legal/index.ts`
- `apps/mobile/src/features/library/index.ts`
- `apps/mobile/src/features/live/index.ts`
- `apps/mobile/src/features/navigation/index.ts`
- `apps/mobile/src/features/playback/index.ts`
- `apps/mobile/src/features/progress/index.ts`
- `apps/mobile/src/features/scholar/index.ts`
- `apps/mobile/src/features/search/index.ts`
- `apps/mobile/src/features/support/index.ts`
- `apps/mobile/src/features/downloads/index.ts`

**Barrel conventions:**

- Named exports only — `export { FooScreen } from "./screens/foo.screen"`.
- Always export screens (they are the feature's routing surface consumed by
  `apps/mobile/src/app/**`).
- For each non-screen item you consider exporting: grep the rest of the codebase
  (`rg "ComponentName" apps/mobile/src --include="*.ts" --include="*.tsx"`) and only
  include it if at least one file _outside this feature folder_ imports it.
- Do NOT re-export anything from `apps/mobile/src/app/**` (route files stay route-only).

**Existing barrels to verify (no changes expected but confirm):**

- `apps/mobile/src/features/feed/index.ts`
- `apps/mobile/src/features/lecture/index.ts`

**Blockers:** None currently identified.

**Dependencies:** Stage 10 (so the correct post-rename identifiers are in the barrels).

**Completion Criteria:**

- `ls apps/mobile/src/features/*/index.ts` lists 14 files.
- `pnpm --filter mobile typecheck` passes.
- `pnpm --filter mobile lint` passes.

**Suggested Commit Message:**

```text
feat(mobile): add index.ts barrel exports to all 12 features missing them

Consistent named barrels across all features so callers do not need
direct deep imports.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

---

## Stage 12: Clean up `Mobile*` prefix in `apps/mobile/src/core/` and update AGENT.md

**Status:** Complete ✅

**Goal:** Internal `apps/mobile/src/core/` functions shed their redundant `Mobile`
infix; `apps/mobile/AGENT.md` is updated to document the conventions this cleanup
establishes.

**Files to modify:**

- `apps/mobile/src/core/config/env.ts`
  - Rename `getMobileRuntimeEnv` → `getRuntimeEnv`.
  - Update every call site (likely just `apps/mobile/src/core/providers.tsx` and one or
    two feature hooks that read env at startup).
- `apps/mobile/src/core/config/build-env.ts`
  - Rename `getMobileBuildEnv` → `getBuildEnv`.
  - Update call sites.
- `apps/mobile/AGENT.md` — add or update:
  - **Export style** subsection: named exports everywhere; `export default` only in
    `src/app/**` route and layout files required by Expo Router.
  - **Naming convention** subsection: no `MobileNative`, `Native`, or `Mobile` suffix
    on identifiers inside `apps/mobile`. Components are named for their domain purpose
    only.
  - **Feature barrels** subsection: every `src/features/<name>/` must have an
    `index.ts` with named re-exports of the feature's public surface.
  - **Type declarations**: note that `src/types/unistyles-*.d.ts` and `src/unistyles.d.ts`
    were removed; Unistyles module augmentation now lives only in
    `src/core/styles/unistyles.ts`.

**Blockers:** None currently identified.

**Dependencies:** Stages 10, 11.

**Completion Criteria:**

- `rg "getMobileRuntimeEnv|getMobileBuildEnv" apps/mobile/src` returns zero matches.
- `pnpm --filter mobile typecheck` passes.
- `pnpm --filter mobile lint` passes.

**Suggested Commit Message:**

```text
chore(mobile): remove Mobile prefix from core config helpers and update AGENT.md

getMobileRuntimeEnv → getRuntimeEnv, getMobileBuildEnv → getBuildEnv.
AGENT.md documents the naming, barrel, and export-style conventions.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

---

## Stage 13: Packages cleanup

**Status:** Complete ✅

**Goal:** Trim dead exports from `packages/domain-playback`, remove stale mobile-theme
re-exports from `packages/design-tokens`'s web entry, decide the fate of the abandoned
`packages/core-i18n`, and remove the `packages/shared` ghost reference from the root
`AGENT.md`.

**Sub-task A — `packages/design-tokens/src/index.web.ts`:**

- Remove lines that re-export `lightMobileTheme` and `darkMobileTheme` from the native
  theme file. Run the following grep first to confirm no web-context file still imports
  them (this stage runs after Stages 3 and 7 have cleared all web Unistyles usage):
  `rg "lightMobileTheme|darkMobileTheme" apps/web --include="*.ts" --include="*.tsx"`
  — must return zero matches before making the deletion.
- The native entry point (`index.native.ts`) is unaffected — it legitimately exports
  both mobile themes for `apps/mobile`.

**Sub-task B — `packages/domain-playback` dead exports:**

- Before touching anything, run the verification grep:

  ```bash
  rg "usePlaybackStore|PlaybackStore\b|PlaybackEngine\b|webPlaybackEngine|nativePlaybackEngine|PlaybackStatus\b|PlaybackState\b" \
    apps/ packages/ --include="*.ts" --include="*.tsx" -l
  ```

- If the only matching files are inside `packages/domain-playback/src/` itself, remove
  these from the public `index.ts` export. Do not delete the implementations — just stop
  re-exporting them so they become internal.
- Keep in the barrel: `usePlayback` and `Track` (verify these are actually imported by
  apps first with the same grep pattern before deciding).
- If any of the "dead" exports are actually consumed (grep returns an app file), keep
  them and update the relic description accordingly.

**Sub-task C — `packages/core-i18n` abandoned package:**

- Check `docs/` for any mention of i18n work planned. Run:
  `rg "@sd/core-i18n" apps/ packages/ --include="*.ts" --include="*.tsx" --include="*.json" -l`
- If zero matches outside `packages/core-i18n` itself:
  - Remove the package's entries from:
    - `pnpm-workspace.yaml`
    - Root `turbo.json` pipeline
    - Any `package.json` that lists it as a dependency
  - Delete `packages/core-i18n/` directory.
- If matches exist, leave the package and add a `README.md` explaining its current stub
  status and intended scope.

**Sub-task D — `packages/shared` ghost reference:**

- Edit the root `AGENT.md` package map: remove the line
  `packages/shared - Cross-app utilities only (no platform-specific UI primitives)`.
  This package does not exist; keeping the line misleads contributors.

**Files to modify:**

- `packages/design-tokens/src/index.web.ts` — remove mobile theme re-exports.
- `packages/domain-playback/src/index.ts` — remove dead public exports (after
  verification).
- Root `AGENT.md` — remove `packages/shared` line from the package map.
- `pnpm-workspace.yaml`, root `turbo.json`, dependent `package.json` files — remove
  `core-i18n` references if the package is deleted.

**Blockers:**

- Sub-task A is blocked on Stages 3 and 7 completing (web must not import mobile themes
  before this removal).
- Sub-task B requires the verification grep to confirm orphan status before removal.

**Dependencies:** Stages 7 and 8 for Sub-task A. Stages 1–12 for Sub-tasks B, C, D (run
this near the end so the codebase is in its final state before auditing for dead exports).

**AGENT.md updates (same commit):**

- Root `AGENT.md` — remove the `packages/shared` ghost entry (Sub-task D above).
- If `core-i18n` is removed: also remove it from the package map in root `AGENT.md`.

**Completion Criteria:**

- `rg "lightMobileTheme|darkMobileTheme" apps/web` returns zero matches.
- `rg "packages/shared" AGENT.md` returns zero matches.
- `pnpm install` succeeds (no dangling workspace references).
- `pnpm --filter domain-playback typecheck` passes.
- `pnpm --filter design-tokens typecheck` passes (both web and native entry points).
- `pnpm typecheck` — full monorepo passes.
- `pnpm build` — full monorepo passes.

**Suggested Commit Message:**

```text
chore(packages): trim dead exports, remove ghost package reference, drop core-i18n stub

- design-tokens/index.web.ts no longer re-exports mobile themes
- domain-playback stops exporting unused engine internals
- packages/shared ghost removed from AGENT.md
- core-i18n removed (was empty stub with no consumers)

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

---

## Stage 14: Final verification pass

**Status:** Complete ✅

**Goal:** Confirm the cleanup holds together at monorepo level.

**Checks:**

- `pnpm typecheck` — full monorepo clean.
- `pnpm lint` — full monorepo clean.
- `pnpm test` — full monorepo clean.
- `pnpm build` — all apps and packages build.
- `pnpm --filter web test:e2e` — Playwright smoke of (use actual route paths from
  `apps/web/src/app/(main)/`):
  - `/`, `/feed`, `/feed/following`
  - `/library`, `/library/saved`, `/library/completed`
  - `/lectures/[id]` (the real slug — not `/lecture/[slug]`)
  - `/scholars`, `/scholars/[slug]` (not `/scholar/…`)
  - `/search`
  - `/admin/dashboard`, `/admin/scholars`, `/admin/topics`, `/admin/livestreams`,
    `/admin/permissions`
  - `/sign-in`, `/sign-up`
  - `/support`, `/legal/privacy`, `/legal/terms-of-use`
  - `/live/*`
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
  - `rg --files apps/web -g '*.native.tsx' -g '*.native.ts'` (filename check — not
    content grep, which would false-pass)
  - `rg "export default" apps/web/src/features apps/web/src/shared --include="*.tsx" --include="*.ts"`
    (exclude `apps/web/src/shared/types/css.d.ts` which legitimately has a module
    declaration — use `--glob '!**/types/**'` or inspect manually)
  - `rg "export default" apps/mobile/src/features apps/mobile/src/shared --include="*.tsx" --include="*.ts"`

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
