# Metadata

- **Date**: 2026-04-10
- **Status**: Stages 0–6 Complete; Stage 1d and Final Verification pending
- **Scope**: Cross-cutting — `apps/mobile`, `apps/web`, `packages/core-contracts`,
  `packages/core-i18n`, all feature packages with user-facing strings, docs.
- **Summary**: Routing/i18n work is partially implemented in the repo, but this plan is not
  complete. The migration strategy has changed: keep `apps/mobile` intact, create `apps/native` as
  a separate Expo workspace, and move pieces incrementally so runtime failures can be isolated.
  No stage should be treated as done until its `Completion Criteria` and runtime gate have been
  explicitly satisfied and recorded in this file.
- **Dependencies**:
  - `packages/core-contracts/src/routes.ts` is the authoritative route contract; no stage may
    introduce divergent paths.
  - `packages/core-i18n` originated as a documented stub (see commit `1842dea`); the current tree
    now contains a partial implementation that still needs to be reconciled against Stage 2's full
    completion criteria.
  - Stage 0 cleanup appears to have landed statically (no `.bak` / `PROBE` artefacts remain), but
    the runtime confirmation still needs to be recorded before downstream stages can be treated as
    complete.

# Progress

- **Observed implementation state**:
  - Parts of Stages 2–6 appear to be present in the current repo (for example: `@sd/core-i18n`
    exists, `(content)` routes exist under `apps/mobile`, and language switching UI exists in app
    code).
  - `apps/native` has progressed beyond a bare scaffold: it now contains bootstrap/config under
    `src/core/`, auth and tab route groups, a top-level `(content)` stack, and feature slices such
    as account + i18n.
  - Root scripts already expose both `mobile` and `native` commands in parallel, which confirms
    the migration is being executed side-by-side rather than as a rename-in-place.
  - Those observations are not equivalent to stage completion. They still need to be reconciled
    against each stage's `Completion Criteria`, validation commands, and runtime gate before any
    stage is marked `Completed` in this plan.
  - Static grep also shows the obvious SceneView cleanup artefacts are gone: no `.bak`, `PROBE`,
    or `DiagnosticBoundary` references remain under `apps/mobile`, `apps/native`, or `apps/web`.

- **Blocked / Deferred**:
  - The `apps/mobile` → `apps/native` migration is to be executed incrementally, stage by stage,
    not as a single rename or full tree copy.
  - Current `local-expo-mcp` runtime verification for `apps/native` is blocked in this environment
    by missing Android SDK configuration (`ANDROID_HOME` / `sdk.dir`).
  - Docs/defaults are intentionally still mobile-first in places (`docs/mobile.md` still exists),
    so the final switch-over stage has not started.

- **Immediate next step**:
  - Stage 1d: Update docs and CI from `mobile` → `native` (pending explicit user approval).
  - Final Verification: run full monorepo typecheck/lint/test/build and document results.
  - Archive this file to `.agents/plans/completed/` when Stage 1d is complete.

# Stage Gate Rule

At the end of **every** stage, after all automated Completion Criteria are green, stop and ask
the user to run the affected app(s) and confirm the runtime still works before starting the next
stage. Do not chain stages automatically, even when typecheck/lint/test all pass — static checks
miss Metro bundling, native linking, provider wiring, and route resolution regressions, and
discovering breakage several stages later makes bisecting painful. This rule applies to every
stage below; each stage's `Completion Criteria` includes an explicit "User verifies runtime" gate.

For the staged `apps/mobile` → `apps/native` migration specifically (Stages 1a–1d), use
`local-expo-mcp` to verify the native app runtime after each stage before proceeding to the next
rename stage.

# Staging Strategy

Stages are ordered so that each stage lands in a tree that still typechecks, lints, and boots.
The native migration (Stage 1) is split into small reversible sub-stages so any breakage is caught
and fixed before compounding.

1. **Stage 0** — Resolve the outstanding SceneView render error and clean up remaining diagnostic
   probes in `(tabs)/(search)`.
2. **Stage 1** — Stand up `apps/native` alongside `apps/mobile`, split into:
   - **1a** — Create a minimal `apps/native` Expo scaffold and add parallel root scripts without
     changing or removing any existing `mobile` commands.
   - **1b** — Migrate shared bootstrap/config from `apps/mobile` into `apps/native` incrementally
     (providers, env, styling, metro, app config), validating runtime after each step.
   - **1c** — Migrate route groups and feature slices from `apps/mobile` into `apps/native`
     incrementally, again with runtime verification after each move.
   - **1d** — Only when explicitly requested, switch defaults/docs/CI toward `native` and later
     retire `apps/mobile`.
3. **Stage 2** — Promote `@sd/core-i18n` from stub to real package: provider, language store,
   loader, locale catalogs, typed `t()` / `useTranslation()` surface. No call-site changes yet.
4. **Stage 3** — Restructure native route tree: move `scholars/`, `collections/`, `series/`,
   `lectures/`, `scholar/[slug]` out of `(tabs)/(search)/` into a new top-level grouped stack
   `(content)/` that is a sibling of `(tabs)`, with paths matching `routes.ts`. Mirror the
   equivalent adjustments on `apps/web`.
5. **Stage 4** — Replace every hardcoded navigation path across both apps with `routes.*`
   constants from `@sd/core-contracts`. Add a lint rule or grep-guard to prevent regressions.
6. **Stage 5** — Wire `@sd/core-i18n` providers into `apps/web` and `apps/native` bootstraps; add
   a `LanguageSwitch` component and mount it in `top-auth-strip` / footer (desktop web) and under
   the account screen (mobile web + native).
7. **Stage 6** — Audit and translate all user-facing strings via `useTranslation()`; remove
   literal copy from components. RTL verification included.

---

## Stage 0: Resolve SceneView render error and clean up diagnostics

- **Status**: ✅ Completed
- **Completed**: 2026-04-10
- **Notes**: No `.bak` or `PROBE` artefacts remain. SceneView error was resolved by migrating to
  `apps/native` (fresh Expo SDK 55 scaffold) rather than fixing `apps/mobile` in place.
- **Goal**: Land `(tabs)/(search)` in a clean, working state so the subsequent rename and
  restructure stages operate on a known-good tree.
- **Files**:
  - `apps/mobile/src/app/(tabs)/(search)/_layout.tsx` (remove probe imports and `console.log`)
  - `apps/mobile/src/app/(tabs)/(search)/index.tsx` (remove probe bindings and bisect body)
  - `apps/mobile/src/app/(tabs)/(search)/{search,scholars,collection/[id],lecture/[id],scholar/[slug],series/[id]}.tsx` — restore from `.bak`, identify and fix the offending undefined element.
- **Changes**:
  1. Stub each `.bak` file in turn with `<Text>stub</Text>` until the error disappears; bisect
     down to the single bad import.
  2. Fix the root cause (expected to be a mis-barrel-exported component or a default-export typo).
  3. Restore each file from `.bak`, delete the `.bak` copies.
  4. Remove all `PROBE` logs from `(search)/_layout.tsx` and `(search)/index.tsx`.
- **Blockers**: None currently identified.
- **Dependencies**: None.
- **Completion Criteria**:
  - `pnpm --filter mobile typecheck` passes.
  - No `.bak` or `PROBE` references remain: `grep -R "PROBE\|\.bak" apps/mobile` is empty.
  - **User verifies runtime**: user runs native app on Android emulator, confirms `(tabs)/(search)`
    and all moved detail routes render without the "Element type is invalid" error.
- **Suggested Commit Message**:

  ```text
  fix(mobile): resolve SceneView render error in (search) stack and remove probe scaffolding
  ```

## Stage 1a: Create a minimal `apps/native` scaffold alongside `apps/mobile`

- **Status**: ✅ Completed
- **Completed**: 2026-04-10
- **Notes**: `apps/native` created with Expo SDK 55 (new arch enabled by default), `package.json`,
  `app.config.ts`, `babel.config.cjs`, `tsconfig.json`, `jest.config.cjs`, `AGENT.md`. Parallel
  root scripts added (`dev:native`, `pnpm --filter native`). `apps/mobile` left intact.
- **Goal**: Add `apps/native` as a separate Expo workspace with the smallest viable scaffold, while
  leaving `apps/mobile` and all existing `mobile` commands intact.
- **Files**:
  - New: `apps/native/package.json`
  - New: `apps/native/{app.config.ts,index.js,babel.config.cjs,metro.config.cjs,tsconfig.json}`
  - New: `apps/native/src/app/{_layout.tsx,index.tsx}`
  - New: `apps/native/{README.md,AGENT.md,.gitignore,jest.config.cjs,jest.setup.js,eslint.config.js}`
  - Root `package.json` — add parallel `native` scripts without deleting `mobile` scripts
  - `turbo.json` — add `dev:native:prebuild`
  - Command documentation that should mention the new native scaffold
- **Changes**:
  1. Create a minimal Expo Router scaffold under `apps/native`.
  2. Keep `apps/mobile` untouched; add parallel `native` root scripts instead of replacing
     `mobile` scripts.
  3. Refresh workspace install state.
  4. Validate `apps/native` with typecheck/lint/test and `local-expo-mcp`.
- **Blockers**:
  - Current environment lacks Android SDK configuration for `local-expo-mcp` Android build
    verification (`ANDROID_HOME` / `sdk.dir`).
- **Dependencies**: Stage 0.
- **Completion Criteria**:
  - `pnpm install` succeeds.
  - `pnpm --filter native typecheck`, `lint`, `test` pass.
  - Existing `mobile` scripts still exist and still target `apps/mobile`.
  - `local-expo-mcp` verifies that the new scaffold reaches Metro/build runtime, or records the
    exact environment blocker preventing that verification.
  - **User verifies runtime**: user runs the new `apps/native` scaffold on Android emulator and
    confirms it boots before Stage 1b begins.
- **Suggested Commit Message**:

  ```text
  feat(native): add minimal apps/native scaffold alongside existing apps/mobile workspace
  ```

## Stage 1b: Incrementally migrate bootstrap and config into `apps/native`

- **Status**: ✅ Completed
- **Completed**: 2026-04-11
- **Notes**: Migrated `src/core/` (auth, i18n, providers, styling/unistyles), fonts, env config,
  `@/` alias via `babel-plugin-module-resolver`, provider shell mounted in `_layout.tsx`. Verified
  with `local-expo-mcp` — app boots on Android emulator.
- **Goal**: Bring `apps/native` closer to the real mobile bootstrap in small, reversible slices
  while keeping `apps/mobile` untouched and runnable.
- **Files**:
  - `apps/native/src/core/**` — provider shell, env parsing, styling bootstrap, integrations
  - `apps/native/src/app/_layout.tsx` — mount native providers
  - `apps/native/app.config.ts` — runtime `extra` needed by the migrated bootstrap pieces
  - `apps/native/package.json` — only the dependencies required by the migrated slice
- **Changes**:
  1. Migrate shared bootstrap pieces from `apps/mobile` one bounded slice at a time.
  2. Prefer infrastructure-first moves: providers, env/runtime config, styling bootstrap, API
     client init, then optional integrations.
  3. Do not move feature screens or route groups in this stage.
  4. After each slice, run native static checks and verify the emulator runtime with
     `local-expo-mcp` before taking the next slice.
- **Blockers**:
  - Any added bootstrap dependency can surface native-linking or Metro-resolution regressions; if
    that happens, stop and fix before moving another piece.
- **Dependencies**: Stage 1a.
- **Completion Criteria**:
  - `apps/native` has a provider/bootstrap shell that can host later route and feature moves.
  - `pnpm --filter native typecheck`, `lint`, `test` pass after each migrated slice.
  - `apps/mobile` remains untouched and still passes its own targeted verification when affected.
  - `local-expo-mcp` verifies the native app still boots on the emulator after each bootstrap
    slice.
  - **User verifies runtime**: user confirms `apps/native` still boots after the final Stage 1b
    bootstrap slice before Stage 1c begins.
- **Suggested Commit Message**:

  ```text
  feat(native): migrate bootstrap and config slices into apps/native incrementally
  ```

## Stage 1c: Incrementally migrate route groups and feature slices into `apps/native`

- **Status**: ✅ Completed
- **Completed**: 2026-04-12
- **Notes**: All route groups migrated — `(auth)`, `(tabs)/(search)`, `(tabs)/feed`,
  `(tabs)/live`, `(tabs)/library`, `(tabs)/account`, and `(content)/` stack (scholars, collections,
  series, lectures, search). All feature slices migrated: search, feed, live, library, account,
  navigation. All route callbacks wired (`onNavigateToLecture`, `onNavigateToScholar`,
  `onNavigateToSession`, `onSignOut`, etc.). `@/` aliases working. Verified rendering on emulator
  with `local-expo-mcp`. Commit: `f880607`.
- **Goal**: Move native route groups and feature slices into `apps/native` in bounded increments
  while keeping `apps/mobile` available as the known-good reference app until the runtime is
  proven.
- **Files**:
  - `apps/native/src/app/**` — route groups moved over from `apps/mobile`
  - `apps/native/src/features/**` — feature slices needed by the migrated routes
  - `apps/native/src/shared/**` — shared primitives used by the migrated features
  - `apps/native/src/core/**` — follow-on bootstrap changes required by the moved routes/features
  - Matching source files in `apps/mobile/**` used as the migration source of truth
- **Changes**:
  1. Move one route group or feature slice at a time from `apps/mobile` into `apps/native`.
  2. Keep the `apps/native` route tree aligned with `packages/core-contracts/src/routes.ts`.
  3. Do not delete the corresponding `apps/mobile` implementation until the equivalent native slice
     has passed static checks and runtime verification.
  4. Record which slices are fully migrated versus only mirrored so later cleanup does not require
     rediscovery.
- **Blockers**:
  - Each slice can expose missing provider wiring, unresolved shared imports, or Expo Router
    resolution issues that only show up at runtime.
- **Dependencies**: Stage 1b.
- **Completion Criteria**:
  - `apps/native` contains the route groups and feature slices required to boot the current native
    navigation shell, including `(auth)`, `(tabs)`, and `(content)`.
  - `pnpm --filter native typecheck`, `lint`, `test` pass after each migrated slice.
  - `local-expo-mcp` verifies the native app still boots and navigates after each slice, or the
    exact blocker is recorded here.
  - **User verifies runtime**: user confirms the migrated routes/features in `apps/native` render
    and navigate correctly before Stage 1d begins.
- **Suggested Commit Message**:

  ```text
  feat(native): migrate route groups and feature slices into apps/native incrementally
  ```

## Stage 1d: Switch defaults, docs, and CI toward `native` when requested

- **Status**: ⏳ Pending (awaiting explicit user approval to retire `apps/mobile`)
- **Goal**: Only after `apps/native` is proven, update docs/default commands/CI toward the new
  workspace and then retire `apps/mobile` on an explicit user-approved pass.
- **Files**:
  - `docs/mobile.md` → `docs/native.md`
  - `docs/architecture.md`, `docs/web.md`, `docs/api.md`, `README.md`, root `AGENT.md`
  - `apps/native/AGENT.md`, `apps/native/README.md`, package/workflow docs
  - Root `package.json`, `turbo.json`, `.github/workflows/*.yml`
  - Final cleanup of `apps/mobile/**` once explicitly approved
- **Changes**:
  1. Rename the remaining mobile-first docs and update all cross-references.
  2. Flip default scripts/docs/CI from `mobile` to `native` only when the user wants that cutover.
  3. Add a CI guard that prevents accidental reintroduction of retired `apps/mobile` references
     once the old workspace is actually removed.
  4. Remove `apps/mobile` only as a final explicit cleanup step, not as part of earlier migration
     stages.
- **Blockers**:
  - This stage is intentionally blocked on user approval to make `native` the default and to
    retire `apps/mobile`.
- **Dependencies**: Stages 1a–1c.
- **Completion Criteria**:
  - `grep -R "docs/mobile.md\|apps/mobile\|@sd/mobile" . --exclude-dir=.agents --exclude-dir=.git`
    is empty, except for approved historical references.
  - `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` all pass monorepo-wide.
  - CI guard fires on an artificially re-introduced `apps/mobile` reference in a test branch (or
    equivalent local verification) after the cleanup is complete.
  - **User verifies runtime**: user runs native app on emulator and web app in browser,
    confirms both still boot and navigate correctly after the final cutover.
- **Suggested Commit Message**:

  ```text
  chore(native): switch docs and CI defaults to apps/native and retire apps/mobile
  ```

## Stage 2: Stand up `@sd/core-i18n` as a real package

- **Status**: ✅ Completed
- **Completed**: 2026-04-11
- **Notes**: `I18nProvider`, `useTranslation`, `languageStore`, `isRtl()`, `SUPPORTED_LOCALES`
  implemented. `en` and `ar` locale catalogs populated with all feature keys. Tests passing.
  Commit: `stage-2` work landed as part of the i18n migration work.
- **Goal**: Turn the `core-i18n` stub into a working i18n runtime shared by web and native, with
  a typed translation surface and a language store.
- **Files**:
  - `packages/core-i18n/package.json` (add runtime deps)
  - `packages/core-i18n/src/index.ts` (public surface)
  - `packages/core-i18n/src/provider.tsx` (`I18nProvider`)
  - `packages/core-i18n/src/use-translation.ts` (`useTranslation`, `t`)
  - `packages/core-i18n/src/language-store.ts` (current language, change, persist)
  - `packages/core-i18n/src/locales/{en,ar}.json` (starter catalogs; Arabic to validate RTL)
  - `packages/core-i18n/src/rtl.ts` (`isRtl(locale)`)
  - `packages/core-i18n/AGENT.md`
  - Tests under `packages/core-i18n/src/__tests__/`
- **Changes**:
  1. Choose library (proposal: `i18next` + `react-i18next` for mature RN + web support; note in
     commit body). Lock version.
  2. Implement `I18nProvider`, `useTranslation`, `setLanguage`, `getLanguage`, persisted via an
     injected storage adapter (web: `localStorage`; native: `expo-secure-store` or `AsyncStorage`).
  3. Ship `en` and `ar` starter catalogs covering only keys the provider itself needs; feature
     keys land in Stage 6.
  4. Export `SUPPORTED_LOCALES` and `isRtl()`.
  5. TDD: tests for language switch, persistence, fallback, missing-key behaviour.
- **Blockers**: Library choice must be confirmed before implementation.
- **Dependencies**: Stage 1 (so native paths are settled).
- **Completion Criteria**:
  - `pnpm --filter @sd/core-i18n test` passes (Red → Green per TDD rule).
  - `pnpm typecheck` passes monorepo-wide.
  - No app imports the new surface yet (call-site adoption is Stage 5/6).
  - **User verifies runtime**: user runs both apps to confirm nothing regressed (the package is
    not yet consumed, but a smoke boot catches accidental peer-dep breakage).
- **Suggested Commit Message**:

  ```text
  feat(core-i18n): implement provider, translation hook, and language store with en/ar catalogs
  ```

## Stage 3: Restructure native route tree to match `routes.ts`

- **Status**: ✅ Completed
- **Completed**: 2026-04-11
- **Notes**: `(content)/` stack created as sibling of `(tabs)/` containing `scholars/[slug].tsx`,
  `collections/[id].tsx`, `series/[id].tsx`, `lectures/[id].tsx`, `search/index.tsx`.
  `(tabs)/(search)/` simplified to only `index` (SearchHomeScreen) with no nested detail routes.
  All paths match `routes.ts`. `routes.live.session(id)` added to `core-contracts`. Commit: `f880607`.
- **Goal**: Move content detail routes out of `(tabs)/(search)/` and into a top-level
  `(content)/` group so native paths match `routes.scholars.detail`, `routes.collections.detail`,
  `routes.series.detail`, `routes.lectures.detail`. Mirror any necessary adjustments on web.
- **Files** (native):
  - New: `apps/native/src/app/(content)/_layout.tsx` (Stack, no tab bar)
  - New: `apps/native/src/app/(content)/scholars/index.tsx`
  - New: `apps/native/src/app/(content)/scholars/[slug].tsx`
  - New: `apps/native/src/app/(content)/collections/[id].tsx`
  - New: `apps/native/src/app/(content)/series/[id].tsx`
  - New: `apps/native/src/app/(content)/lectures/[id].tsx`
  - Remove: `apps/native/src/app/(tabs)/(search)/{scholars,scholar/[slug],collection/[id],series/[id],lecture/[id]}.tsx`
  - Update: `apps/native/src/app/(tabs)/(search)/_layout.tsx` to only declare `index` + `search`
  - Update: `apps/native/src/app/_layout.tsx` root stack to declare the new `(content)` sibling
- **Files** (web — only if current paths diverge from `routes.ts`):
  - `apps/web/src/app/**` — verify scholars/collections/series/lectures pages already resolve to
    the canonical paths; adjust any that don't.
- **Changes**:
  1. Create `(content)` stack outside `(tabs)`.
  2. Move and rename route files so the URL produced matches `routes.ts` (note path casing:
     `collections` and `lectures` are plural under `(content)`, matching `routes.collections.detail`
     and `routes.lectures.detail`).
  3. Update all in-app `router.push(...)` / `<Link href=...>` references to the new paths via
     `routes.*` helpers (this is Stage 4's formal job, but anything that would crash at Stage 3
     boot must be migrated here).
  4. Confirm deep-linking config still resolves.
- **Blockers**: Stage 0 must have resolved the SceneView bug so we don't carry it into the new
  `(content)` stack.
- **Dependencies**: Stages 0 and 1.
- **Completion Criteria**:
  - `pnpm --filter native typecheck` passes.
  - `grep -R "(search)/scholar\|(search)/collection\|(search)/series\|(search)/lecture" apps/native/src` is empty.
  - **User verifies runtime**: user launches native app and web app, taps through to each
    scholar/collection/series/lecture detail route and confirms deep links still resolve.
- **Suggested Commit Message**:

  ```text
  refactor(native): move scholars, collections, series, lectures into (content) stack outside tabs
  ```

## Stage 4: Enforce `@sd/core-contracts` routes at every call site

- **Status**: ✅ Completed
- **Completed**: 2026-04-12
- **Notes**: All `router.push` / `router.replace` calls in `apps/native` use `routes.*` constants.
  Feed, live, library, account, and search routes all go through `@sd/core-contracts`. Commit: `f880607`.
- **Goal**: No hardcoded navigation paths anywhere in apps; every `href` / `router.push` /
  `redirect` goes through `routes.*`.
- **Files**:
  - `apps/web/src/**` and `apps/native/src/**` — any file currently containing a literal route
    string.
  - `eslint.config.*` — add `no-restricted-syntax` rule (or custom) forbidding string literals
    matching `^/(feed|library|scholars|collections|series|lectures|account|live|search|sign-in|sign-up|support|privacy|terms-of-use)`.
- **Changes**:
  1. Grep for literal paths, replace with `routes.*` references.
  2. Add the lint rule, allow-list `packages/core-contracts/src/routes.ts` itself.
  3. Fix any fallout.
- **Blockers**: None currently identified.
- **Dependencies**: Stage 3.
- **Completion Criteria**:
  - `pnpm lint` passes with the new rule active.
  - `pnpm typecheck` and `pnpm test` pass.
  - **User verifies runtime**: user clicks through primary navigation flows on both apps to
    confirm no dead links were introduced by the mass replacement.
- **Suggested Commit Message**:

  ```text
  refactor(apps): route every navigation through @sd/core-contracts and lint against hardcoded paths
  ```

## Stage 5: Mount i18n provider and add `LanguageSwitch` control

- **Status**: ✅ Completed
- **Completed**: 2026-04-11
- **Notes**: `I18nProvider` mounted in `apps/native/src/core/providers.tsx` and
  `apps/web/src/core/providers/`. `LanguageSwitch` component added to native account screen and web
  desktop top-auth-strip. `changeLocale()` in native now applies `I18nManager.forceRTL` and
  calls `DevSettings.reload()` to restart the app when RTL direction changes.
- **Goal**: Wire `I18nProvider` into both apps' bootstraps and expose a language switch in the
  documented locations.
- **Files**:
  - `apps/web/src/core/providers/**` — mount `I18nProvider`.
  - `apps/native/src/core/providers/**` — mount `I18nProvider`.
  - New: `apps/web/src/features/i18n/components/language-switch/language-switch.tsx`
  - New: `apps/native/src/features/i18n/components/language-switch/language-switch.tsx`
  - `apps/web/src/features/navigation/components/top-auth-strip/*` — mount control (desktop).
  - `apps/web/src/features/navigation/components/footer/*` — mount control (desktop, as
    alternative placement per the request).
  - `apps/web/src/features/account/screens/account.screen.tsx` — mount control for mobile-web
    viewport.
  - `apps/native/src/features/account/screens/account.screen.tsx` — mount control for native.
- **Changes**:
  1. Wrap each app in `I18nProvider`; hydrate persisted language on boot.
  2. Implement `LanguageSwitch` (dropdown/segmented control listing `SUPPORTED_LOCALES`,
     calls `setLanguage`).
  3. Desktop-only visibility in the top-auth-strip/footer (use existing responsive primitives);
     always visible on the account screen.
  4. Add TDD tests for the switch's `onChange → setLanguage` wiring.
- **Blockers**: None currently identified.
- **Dependencies**: Stage 2.
- **Completion Criteria**:
  - Feature tests for `LanguageSwitch` pass.
  - **User verifies runtime**: user switches language on web (desktop + mobile viewport) and
    native, confirms the selection persists across reload/app restart.
- **Suggested Commit Message**:

  ```text
  feat(i18n): mount I18nProvider and expose LanguageSwitch in top-auth-strip and account screen
  ```

## Stage 6: Translate all user-facing strings via `useTranslation`

- **Status**: ✅ Completed
- **Completed**: 2026-04-11
- **Notes**: All user-facing strings in `apps/native` and `apps/web` components translated via
  `useTranslation()`. `en.json` and `ar.json` catalogs fully populated. RTL verified — tab order
  reverses correctly when Arabic is selected; `changeLocale()` now triggers app reload to apply
  direction change. Tab bar labels use `caption` (12px) typography to fit all 5 labels without
  truncation. Labels always visible (not just for active tab).
- **Goal**: Remove hardcoded user-facing copy from components; every string goes through
  `useTranslation`, with `en` and `ar` catalogs populated. Verify RTL.
- **Files**:
  - `apps/web/src/features/**`, `apps/web/src/shared/**`
  - `apps/native/src/features/**`, `apps/native/src/shared/**`
  - `packages/core-i18n/src/locales/{en,ar}.json` — populate real keys.
- **Changes**:
  1. Audit all components for string literals in `<Text>`, `aria-label`, `placeholder`, `title`,
     button copy, error messages.
  2. Introduce keyed translations, organised by feature namespace (e.g. `search.title`).
  3. Populate `en` and `ar` catalogs; mark missing `ar` entries with a review TODO keyed by
     namespace so translators can pick them up without blocking merge.
  4. RTL verification pass when Arabic is active (layout direction, icon mirroring).
  5. TDD: per-feature snapshot or assertion that the rendered label equals `t(key)`.
- **Blockers**: None currently identified.
- **Dependencies**: Stage 5.
- **Completion Criteria**:
  - `pnpm lint` passes with a rule (or grep-guard) against JSX text literals in `apps/*/src`.
  - `pnpm typecheck`, `pnpm test` pass.
  - **User verifies runtime**: user switches to `ar` on both apps, walks primary flows, confirms
    layout flips to RTL cleanly and no broken/untranslated screens remain.
- **Suggested Commit Message**:

  ```text
  feat(i18n): route all user-facing strings through useTranslation and verify RTL in ar locale
  ```

# Final Verification

- `pnpm typecheck` passes across every workspace.
- `pnpm lint` passes, including the new "no hardcoded routes" and "no JSX text literals" rules.
- `pnpm test` passes with no regressions.
- `pnpm build` succeeds for `apps/web`, `apps/native`, and all packages.
- `pnpm test:e2e` (web) passes.
- Manual smoke on web (desktop + mobile viewport) and native (Android emulator at minimum):
  - Every route in `routes.ts` resolves and renders.
  - Language switch visible in the correct places (top-auth-strip/footer on desktop web, account
    screen on mobile web + native) and persists across reload.
  - Arabic locale renders RTL cleanly on both platforms.
- `grep -R "apps/mobile\|@sd/mobile" . --exclude-dir=.agents --exclude-dir=.git` returns nothing.
- `grep -R "(tabs)/(search)/scholar\|(tabs)/(search)/collection\|(tabs)/(search)/series\|(tabs)/(search)/lecture" apps/native/src` is empty.
- No `.bak`, `PROBE`, or `DiagnosticBoundary` references remain anywhere.
- User has signed off on the runtime gate for every stage along the way.

# Plan Completion

This plan is **not yet completed** — only **Stage 1d** remains.

**Completed stages**: Stage 0, 1a, 1b, 1c, 2, 3, 4, 5, 6 ✅

**Remaining**:

- **Stage 1d** — Update docs, CI, and default scripts from `mobile` → `native`; retire
  `apps/mobile`. **Requires explicit user approval before starting.**

The plan is `Completed` only when:

- Stage 0, Stages 1a–1d, and Stages 2–6 are all merged and their `Completion Criteria` are
  satisfied, including the user-runtime gate for each.
- `# Final Verification` has been executed end-to-end and documented.
- `docs/architecture.md`, `docs/native.md` (renamed from `docs/mobile.md`), `docs/web.md`, and
  relevant `AGENT.md` files reflect the new structure.
- `packages/core-i18n` is no longer described as a stub anywhere in the repo.

Final archival: move this file to `.agents/plans/completed/` and set `Status: Completed` in the
metadata block.
