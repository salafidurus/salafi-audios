# Metadata

- **Date**: 2026-04-10
- **Status**: Planned
- **Scope**: Cross-cutting — `apps/mobile` (→ `apps/native`), `apps/web`, `packages/core-contracts`,
  `packages/core-i18n`, all feature packages with user-facing strings, docs.
- **Summary**: Align all routing with the canonical `@sd/core-contracts` route model, restructure
  native route groups so content routes live outside `(tabs)`, rename `apps/mobile` → `apps/native`
  to disambiguate from "mobile web", stand up `@sd/core-i18n` as a real i18n layer for both apps,
  wire translations through every user-facing component, and expose a language-switch control in
  the desktop auth strip/footer and under the account screen on mobile web + native.
- **Dependencies**:
  - `packages/core-contracts/src/routes.ts` is the authoritative route contract; no stage may
    introduce divergent paths.
  - `packages/core-i18n` is currently a documented stub (see commit `1842dea`); Stage 2 turns it
    into a real package.
  - The in-flight SceneView render-error debug in `(tabs)/(search)` (6 `.bak` sibling files) must
    be resolved or explicitly parked before Stage 3 executes, because Stage 3 moves those files
    out of `(search)` entirely and would otherwise mask the root cause.

# Progress

- **Done**: None — plan only.
- **Blocked / uncertain**:
  - SceneView "Element type is invalid" error still unresolved in `(tabs)/(search)`; 6 sibling
    route files are currently backed up as `.bak`. Stage 3 must not paper over this; we resolve
    it first as Stage 0.
  - `@sd/core-i18n` currently ships no runtime; library choice (formatjs vs i18next vs
    lingui) not yet decided — Stage 2 begins with a short spike note.
- **Immediate next step**: Finish Stage 0 (SceneView root-cause fix and cleanup of probe/bak
  files) so the native route tree is in a known-good state before the rename and restructure.

# Staging Strategy

Stages are ordered so that each stage lands in a tree that still typechecks, lints, and boots.

1. **Stage 0** — Resolve the outstanding SceneView render error and clean up diagnostic scaffolding.
2. **Stage 1** — Rename `apps/mobile` → `apps/native` (pure path + identifier rename, no behaviour
   changes). Must land before any further edits to native routes so subsequent stages touch the
   new path only.
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

- **Status**: Planned
- **Goal**: Land `(tabs)/(search)` in a clean, working state so the subsequent rename and
  restructure stages operate on a known-good tree.
- **Files**:
  - `apps/mobile/src/app/_layout.tsx` (remove `DiagnosticBoundary`, restore route `ErrorBoundary`)
  - `apps/mobile/src/app/(tabs)/(search)/_layout.tsx` (remove probe imports and `console.log`)
  - `apps/mobile/src/app/(tabs)/(search)/index.tsx` (remove probe bindings and bisect body)
  - `apps/mobile/src/app/(tabs)/(search)/{search,scholars,collection/[id],lecture/[id],scholar/[slug],series/[id]}.tsx` — restore from `.bak`, identify and fix the offending undefined element.
- **Changes**:
  1. Stub each `.bak` file in turn with `<Text>stub</Text>` until the error disappears; bisect
     down to the single bad import.
  2. Fix the root cause (expected to be a mis-barrel-exported component or a default-export typo).
  3. Restore each file from `.bak`, delete the `.bak` copies.
  4. Remove all `PROBE` logs and the `DiagnosticBoundary`; restore the route-level `ErrorBoundary`.
- **Blockers**: None currently identified.
- **Dependencies**: Must be completed before Stage 1 so the rename does not carry broken code
  across paths.
- **Completion Criteria**:
  - `pnpm --filter mobile typecheck` passes.
  - App launches on Android emulator without the "Element type is invalid" error.
  - No `.bak`, `PROBE`, or `DiagnosticBoundary` references remain: `grep -R "PROBE\|DiagnosticBoundary\|\.bak" apps/mobile` is empty.
- **Suggested Commit Message**:

  ```text
  fix(mobile): resolve SceneView render error in (search) stack and remove debug scaffolding
  ```

## Stage 1: Rename `apps/mobile` → `apps/native`

- **Status**: Planned
- **Goal**: Eliminate "mobile" ambiguity by renaming the native Expo app to `apps/native`. Pure
  path and identifier rename; no behavioural changes.
- **Files**:
  - `apps/mobile/**` → `apps/native/**` (git mv)
  - `apps/native/package.json` (`"name": "native"`)
  - `pnpm-workspace.yaml`
  - Root `package.json` scripts referencing `--filter mobile`
  - `tsconfig.base.json` path aliases
  - `turbo.json` / any pipeline config referencing `mobile`
  - `apps/native/app.json` / `app.config.ts` (scheme, slug — keep Android `applicationId` and iOS
    `bundleIdentifier` unchanged to avoid a store identity break; document this)
  - `apps/native/android/app/build.gradle`, `settings.gradle` (namespace only if safe)
  - `.github/workflows/*.yml`
  - `docs/mobile.md` → `docs/native.md`; update cross-references in `docs/architecture.md`,
    `docs/web.md`, root `AGENT.md`
  - `apps/native/AGENT.md` (formerly `apps/mobile/AGENT.md`)
  - Any `@sd/mobile` imports in `packages/*` or `apps/*` (should be none per guardrails; verify)
- **Changes**:
  1. `git mv apps/mobile apps/native`.
  2. Bulk-replace workspace-package name `"mobile"` → `"native"` and filter flags.
  3. Rename `docs/mobile.md` → `docs/native.md`; update doc cross-links.
  4. Leave native Android/iOS bundle IDs untouched (document rationale in the commit body).
  5. Update root and workspace `AGENT.md` references.
- **Blockers**: None currently identified (Android appId intentionally preserved).
- **Dependencies**: Stage 0 must be green.
- **Completion Criteria**:
  - `pnpm install` succeeds.
  - `pnpm typecheck`, `pnpm lint`, `pnpm test` all pass across the monorepo.
  - `pnpm --filter native start` boots Metro; app launches on Android emulator.
  - `grep -R "apps/mobile\|@sd/mobile\|--filter mobile" .` returns only historical plan files.
- **Suggested Commit Message**:

  ```text
  chore(workspace): rename apps/mobile to apps/native to disambiguate from mobile web
  ```

## Stage 2: Stand up `@sd/core-i18n` as a real package

- **Status**: Planned
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
- **Suggested Commit Message**:

  ```text
  feat(core-i18n): implement provider, translation hook, and language store with en/ar catalogs
  ```

## Stage 3: Restructure native route tree to match `routes.ts`

- **Status**: Planned
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
  - App launches on emulator and every content route resolves by both tab tap and direct deep
    link.
  - `grep -R "(search)/scholar\|(search)/collection\|(search)/series\|(search)/lecture" apps/native/src` is empty.
- **Suggested Commit Message**:

  ```text
  refactor(native): move scholars, collections, series, lectures into (content) stack outside tabs
  ```

## Stage 4: Enforce `@sd/core-contracts` routes at every call site

- **Status**: Planned
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
- **Suggested Commit Message**:

  ```text
  refactor(apps): route every navigation through @sd/core-contracts and lint against hardcoded paths
  ```

## Stage 5: Mount i18n provider and add `LanguageSwitch` control

- **Status**: Planned
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
  - Manual smoke: switching language persists across reload on web and app restart on native.
- **Suggested Commit Message**:

  ```text
  feat(i18n): mount I18nProvider and expose LanguageSwitch in top-auth-strip and account screen
  ```

## Stage 6: Translate all user-facing strings via `useTranslation`

- **Status**: Planned
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
  - Manual: switching to `ar` flips layout to RTL on web and native without broken screens.
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
- `grep -R "apps/mobile\|@sd/mobile" .` returns only historical plan content.
- `grep -R "(tabs)/(search)/scholar\|(tabs)/(search)/collection\|(tabs)/(search)/series\|(tabs)/(search)/lecture" apps/native/src` is empty.
- No `.bak`, `PROBE`, or `DiagnosticBoundary` references remain anywhere.

# Plan Completion

The plan is `Completed` when:

- All seven stages (0–6) are merged and their `Completion Criteria` are satisfied.
- `# Final Verification` has been executed end-to-end and documented.
- `docs/architecture.md`, `docs/native.md` (renamed from `docs/mobile.md`), `docs/web.md`, and
  relevant `AGENT.md` files reflect the new structure.
- `packages/core-i18n` is no longer described as a stub anywhere in the repo.

Final archival: move this file to `.agents/plans/completed/` and set `Status: Completed` in the
metadata block.
