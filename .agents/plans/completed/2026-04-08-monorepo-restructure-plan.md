# Monorepo Restructure — In-App Feature Slices + TDD Enforcement Plan

# Metadata

- **Date:** 2026-04-08
- **Status:** Completed
- **Scope:** Dissolve all `packages/feature-*` packages, migrate feature code into per-app
  `src/features/` slices, extract shared data logic into domain packages, trim
  `packages/shared` to cross-app utilities only, and enforce full TDD across the restructure.
  Also dissolved: `packages/shared`, `packages/core-styles`, `packages/core-config`,
  `packages/core-auth`, `packages/core-env`.
- **Summary:** All `feature-*` packages (legal, support, navigation, auth, account, feed,
  library, lecture, scholar, search, playback, progress, live, downloads, admin) and the
  dissolved infrastructure packages (shared, core-styles, core-config, core-auth, core-env)
  have been fully removed. Feature code now lives in `apps/mobile/src/features/` and
  `apps/web/src/features/`. Domain packages `domain-content`, `domain-account`, and
  `domain-live` were created to hold shared data hooks.
- **Dependencies:** None external.

---

# Progress

## Done

- Root `AGENT.md` updated with new app structure, platform extension rules, package map, and
  strict TDD policy.
- `.agents/skills/project-guardrails/SKILL.md` updated with new app structure, package map,
  and TDD non-negotiable workflow section.
- `apps/mobile/src/features/` and `apps/mobile/src/shared/` scaffolded.
- `apps/web/src/features/` and `apps/web/src/shared/` scaffolded.
- `packages/domain-content` created with tests passing.
- `packages/domain-account` created with tests passing.
- `packages/domain-live` created with tests passing.
- Native-only primitives moved from `packages/shared` to `apps/mobile/src/shared/`.
- Web-only primitives moved from `packages/shared` to `apps/web/src/shared/`.
- All 15 feature packages migrated: legal, support, navigation, auth, account, feed, library,
  lecture, scholar, search, playback, progress, live, downloads, admin.
- All shared hooks extracted to the appropriate domain packages.
- `turbo.json` updated — `@sd/feature-*` pipeline entries removed, new domain packages added.
- `apps/web/next.config.ts` transpile list updated.
- `apps/mobile/package.json` and `apps/web/package.json` dependencies updated.
- `packages/core-styles`, `packages/core-config`, `packages/core-auth`, `packages/core-env`,
  `packages/shared`, and all `packages/feature-*` directories deleted.
- Architecture docs and workspace `AGENT.md` files updated to reflect new structure.
- Full test suite, typecheck, lint, and web build verified passing.

## Blocked

None.

## Immediate Next Step

Plan is complete. Archived to `.agents/plans/completed/`.

---

# Staging Strategy

1. Stage 1: Documentation & Rules — update AGENT.md and guardrails skill.
2. Stage 2: Scaffold New App Structures — create features/ and shared/ directories in each app.
3. Stage 3: New Domain Packages — create domain-content, domain-account, domain-live.
4. Stage 4: Migrate packages/shared Primitives — move native and web primitives into apps.
5. Stage 5: Feature Migration — migrate all 15 feature packages, one at a time.
6. Stage 6: Build Configuration Updates — update turbo.json, next.config, and package.json deps.
7. Stage 7: Final Verification & Documentation — full test pass and documentation updates.

---

## Stage 1: Documentation & Rules

- **Status:** Completed

- **Goal:** Update root `AGENT.md` and the project-guardrails skill with the new in-app
  feature structure, platform extension rules, package map, and strict TDD policy.

- **Files:**
  - `AGENT.md`
  - `.agents/skills/project-guardrails/SKILL.md`

- **Changes:**
  - Replaced the Repo Layout and App Structure sections in `AGENT.md` with the new structure
    (`app/` routing only, `features/`, `shared/` per app).
  - Added platform extension rules (`.ios.tsx`, `.android.tsx`, `.desktop.tsx`, `.mobile.tsx`).
  - Replaced TDD policy section with stricter non-negotiable workflow.
  - Updated Package Map in `AGENT.md`.
  - Updated `SKILL.md` App Structure section and Package Map.
  - Added TDD — Non-Negotiable Workflow section to `SKILL.md`.

- **Blockers:** None currently identified.

- **Dependencies:** None.

- **Completion Criteria:**
  - `grep "apps/mobile/src/features" AGENT.md` returns a match.
  - `grep "domain-content" AGENT.md` returns a match.
  - `grep "Test everything" .agents/skills/project-guardrails/SKILL.md` returns a match.

- **Suggested Commit Message:**

  ```
  docs(agent): update structure, platform extensions, and TDD policy

  Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
  ```

---

## Stage 2: Scaffold New App Structures

- **Status:** Completed

- **Goal:** Create the `features/` and `shared/` directory trees inside `apps/mobile/src/` and
  `apps/web/src/`.

- **Files:**
  - `apps/mobile/src/features/.gitkeep`
  - `apps/mobile/src/shared/components/.gitkeep`
  - `apps/mobile/src/shared/hooks/.gitkeep`
  - `apps/mobile/src/shared/utils/.gitkeep`
  - `apps/web/src/features/.gitkeep`
  - `apps/web/src/shared/components/.gitkeep`
  - `apps/web/src/shared/hooks/.gitkeep`
  - `apps/web/src/shared/utils/.gitkeep`

- **Changes:** Created directories with `.gitkeep` markers.

- **Blockers:** None currently identified.

- **Dependencies:** Stage 1 must be complete.

- **Completion Criteria:**
  - `apps/mobile/src/features/` and `apps/mobile/src/shared/` directories exist.
  - `apps/web/src/features/` and `apps/web/src/shared/` directories exist.

- **Suggested Commit Message:**

  ```
  chore(scaffold): create features/ and shared/ directories in mobile and web apps

  Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
  ```

---

## Stage 3: New Domain Packages

- **Status:** Completed

- **Goal:** Create `packages/domain-content`, `packages/domain-account`, and
  `packages/domain-live` to hold shared data hooks extracted from feature packages.

- **Files:**
  - `packages/domain-content/package.json`
  - `packages/domain-content/tsconfig.json`
  - `packages/domain-content/src/index.ts`
  - `packages/domain-content/src/index.spec.ts`
  - `packages/domain-account/package.json`
  - `packages/domain-account/tsconfig.json`
  - `packages/domain-account/src/index.ts`
  - `packages/domain-account/src/index.spec.ts`
  - `packages/domain-live/package.json`
  - `packages/domain-live/tsconfig.json`
  - `packages/domain-live/src/index.ts`
  - `packages/domain-live/src/index.spec.ts`

- **Changes:**
  - Created `@sd/domain-content` package for lectures, scholars, series, feed, and library
    data hooks.
  - Created `@sd/domain-account` package for user profile and auth state hooks.
  - Created `@sd/domain-live` package for live session and channel hooks.
  - Each package includes a passing smoke test.

- **Blockers:** None currently identified.

- **Dependencies:** Stage 2 must be complete.

- **Completion Criteria:**
  - `pnpm --filter domain-content test` passes.
  - `pnpm --filter domain-account test` passes.
  - `pnpm --filter domain-live test` passes.
  - `pnpm test` passes across the full monorepo.

- **Suggested Commit Message:**

  ```
  feat(domain): scaffold domain-content, domain-account, and domain-live packages

  Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
  ```

---

## Stage 4: Migrate packages/shared Primitives

- **Status:** Completed

- **Goal:** Move native-only primitives from `packages/shared` to `apps/mobile/src/shared/`
  and web-only primitives to `apps/web/src/shared/`. Trim `packages/shared` to only truly
  cross-app utilities.

- **Files:**
  - `packages/shared/src/index.native.ts` — removed native-only exports
  - `packages/shared/src/index.web.ts` — removed web-only exports
  - `apps/mobile/src/shared/components/` — received native-only components
  - `apps/web/src/shared/components/` — received web-only components
  - All `apps/mobile` and `apps/web` import sites updated.

- **Changes:**
  - Audited `packages/shared/src/index.native.ts` and `index.web.ts`.
  - Moved each native-only component to `apps/mobile/src/shared/components/`.
  - Moved each web-only component to `apps/web/src/shared/components/`.
  - Updated all import paths in `apps/mobile` and `apps/web`.
  - Removed migrated exports from `packages/shared`.
  - `packages/shared` dissolved — directory removed after all consumers were updated.

- **Blockers:** None currently identified.

- **Dependencies:** Stage 3 must be complete so domain packages are available for hook rewires.

- **Completion Criteria:**
  - `pnpm --filter mobile test` passes.
  - `pnpm --filter web test` passes.
  - `pnpm test` passes across the full monorepo.
  - No `@sd/shared` imports referencing platform-specific primitives remain in apps.

- **Suggested Commit Message:**

  ```
  refactor(shared): move platform primitives into apps, dissolve packages/shared

  Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
  ```

---

## Stage 5: Feature Migration

- **Status:** Completed

- **Goal:** Migrate all 15 `packages/feature-*` packages into per-app `src/features/` slices
  and extract shared hooks into the appropriate domain packages. Delete each feature package
  after migration.

  Features migrated (in order):
  1. `feature-legal` — no shared hooks; screens split into mobile and web.
  2. `feature-support` — same pattern as legal.
  3. `feature-navigation` — mobile and web nav utilities split into respective apps.
  4. `feature-auth` — screens split; shared auth state hooks → `domain-account`.
  5. `feature-account` — screens split; profile hooks → `domain-account`.
  6. `feature-feed` — screens split; `useFeed`, `useFeedScholars` → `domain-content`.
  7. `feature-library` — screens split; library data hooks → `domain-content`.
  8. `feature-lecture` — screens split; lecture detail hooks → `domain-content`.
  9. `feature-scholar` — screens split; scholar data hooks → `domain-content`.
  10. `feature-search` — screens split; search hooks → `domain-search` (existing).
  11. `feature-playback` — mobile-only; player screen → `apps/mobile`; hooks →
      `domain-playback` (existing).
  12. `feature-progress` — hooks only → `domain-progress` (existing).
  13. `feature-live` — screens split; live session hooks → `domain-live`.
  14. `feature-downloads` — mobile-only → `apps/mobile/src/features/downloads/`.
  15. `feature-admin` — web-only → `apps/web/src/features/admin/`.

- **Files:**
  - `packages/feature-*/` — all deleted after migration.
  - `apps/mobile/src/features/<name>/` — created for each feature with native content.
  - `apps/web/src/features/<name>/` — created for each feature with web content.
  - `packages/domain-content/src/` — received feed, library, lecture, scholar hooks.
  - `packages/domain-account/src/` — received auth and profile hooks.
  - `packages/domain-live/src/` — received live session hooks.
  - `packages/domain-search/src/` — received search hooks.
  - `packages/domain-playback/src/` — received playback hooks.
  - `packages/domain-progress/src/` — received progress hooks.
  - All `apps/mobile/src/app/` and `apps/web/src/app/` routing files updated.

- **Changes:**
  - For each feature: audited files, wrote failing tests at destination, copied and renamed
    files (removed `.native`, `.web`, `.desktop.web`, `.mobile.web` suffixes as per
    conventions), rewired imports, deleted source package, verified tests pass.
  - Web feature screens rewritten to CSS-responsive single `.tsx` where applicable, with
    optional `.desktop.tsx` only where layout truly diverges.
  - React Native Web patterns removed from all web screens.

- **Blockers:** None currently identified.

- **Dependencies:** Stages 3 and 4 must be complete.

- **Completion Criteria:**
  - `ls packages/ | grep "^feature-"` returns no output.
  - `grep -r "@sd/feature-" apps packages --include="*.ts" --include="*.tsx" --include="*.json"`
    returns no results (excluding node_modules and .git).
  - `pnpm test` passes.
  - `pnpm typecheck` passes.

- **Suggested Commit Message:**

  ```
  feat(features): migrate all feature-* packages into apps; dissolve packages/feature-*

  Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
  ```

---

## Stage 6: Build Configuration Updates

- **Status:** Completed

- **Goal:** Remove all `@sd/feature-*` references from build tooling and add the new domain
  packages to the Turborepo pipeline and Next.js transpile list.

- **Files:**
  - `turbo.json`
  - `apps/web/next.config.ts`
  - `apps/mobile/package.json`
  - `apps/web/package.json`

- **Changes:**
  - `turbo.json`: removed explicit `@sd/feature-*` pipeline entries; added `@sd/domain-content`,
    `@sd/domain-account`, `@sd/domain-live` with build and test tasks consistent with existing
    domain packages.
  - `apps/web/next.config.ts`: removed `@sd/feature-*` from `transpilePackages`; added new
    domain packages.
  - `apps/mobile/package.json`: removed `@sd/feature-*` dependencies; added `@sd/domain-content`,
    `@sd/domain-account`, `@sd/domain-live`.
  - `apps/web/package.json`: same dependency updates.

- **Blockers:** None currently identified.

- **Dependencies:** Stage 5 must be complete.

- **Completion Criteria:**
  - `grep "feature-" turbo.json` returns no results.
  - `grep "feature-" apps/web/next.config.ts` returns no results.
  - `pnpm --filter web build` succeeds.
  - `pnpm --filter mobile typecheck` passes.

- **Suggested Commit Message:**

  ```
  chore(build): update turbo pipeline and transpilePackages for new domain packages

  Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
  ```

---

## Stage 7: Final Verification & Documentation

- **Status:** Completed

- **Goal:** Confirm no stale `feature-*` or dissolved package references remain, run the full
  verification matrix, and update all affected documentation.

- **Files:**
  - `docs/architecture.md`
  - `apps/mobile/AGENT.md`
  - `apps/web/AGENT.md`

- **Changes:**
  - Verified zero stale `@sd/feature-*` import references across apps and packages.
  - Verified all dissolved package directories are gone.
  - `pnpm test`, `pnpm typecheck`, `pnpm lint`, and `pnpm --filter web build` all pass.
  - `docs/architecture.md` updated to reflect in-app feature slice architecture.
  - `apps/mobile/AGENT.md` and `apps/web/AGENT.md` updated to document new `features/` and
    `shared/` structure.

- **Blockers:** None currently identified.

- **Dependencies:** Stage 6 must be complete.

- **Completion Criteria:**
  - `pnpm test` passes with no regressions.
  - `pnpm typecheck` passes across all workspaces.
  - `pnpm lint` passes with no new violations.
  - `pnpm --filter web build` succeeds.
  - No `@sd/feature-*` or dissolved package imports remain in source.

- **Suggested Commit Message:**

  ```
  docs: update architecture docs and workspace AGENT.md files for feature-slice structure

  Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
  ```

---

# Final Verification

- `pnpm test` passes across the full monorepo with no regressions.
- `pnpm typecheck` passes across all workspaces.
- `pnpm lint` passes with no new violations.
- `pnpm --filter web build` succeeds.
- `pnpm --filter api build` succeeds.
- `ls packages/ | grep "^feature-"` returns no output.
- `grep -r "@sd/feature-" apps packages --include="*.ts" --include="*.tsx" --include="*.json"`
  returns no results (excluding node_modules and .git).
- No references to dissolved packages (`@sd/shared`, `@sd/core-styles`, `@sd/core-config`,
  `@sd/core-auth`, `@sd/core-env`) remain in non-test source files.

---

# Plan Completion

- All seven stages are complete.
- Final verification passed.
- Plan status updated to `Completed`.
- Plan archived to `.agents/plans/completed/`.
