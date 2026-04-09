# TypeScript Config Modernization Plan

# Metadata

- **Date:** 2026-04-07
- **Status:** In Progress
- **Scope:** Unify the TypeScript version across the monorepo, normalize `tsconfig*.json`
  inheritance and intent, remove `baseUrl` deprecation, separate editor config from build
  config, and standardize module resolution by workspace family.
- **Summary:** TypeScript version consolidation is done — only `^5.9.0` in root `package.json`
  with no workspace-level TypeScript declarations. Remaining work: canonical base config
  normalization in `util-config/tsconfig/`, `baseUrl` deprecation removal, editor/build config
  separation, and module resolution standardization.
- **Dependencies:** None external.

---

# Progress

## Done

- TypeScript version consolidated to `^5.9.0` in root `package.json` only. All workspace-level
  TypeScript declarations have been removed.

## Blocked

- None currently identified.

## Immediate Next Step

- Stage 2: audit and normalize the base configs in `packages/util-config/tsconfig/`.

---

# Staging Strategy

1. Stage 1: Inventory and policy definition — partially done (TS version unified).
2. Stage 2: Establish canonical base configs in util-config/tsconfig/.
3. Stage 3: Remove baseUrl deprecation from workspace tsconfigs.
4. Stage 4: Separate editor config from build config.
5. Stage 5: Standardize module resolution by workspace family.
6. Stage 6: Final verification matrix.

---

## Stage 1: Inventory and Policy Definition

- **Status:** In Progress

- **Goal:** Produce a matrix of every workspace's TypeScript config role, confirm the version
  consolidation is complete, and define the target module-resolution policy for each workspace
  family.

- **Files:**
  - `package.json` (root) — TypeScript version already consolidated to `^5.9.0`. ✅
  - `packages/util-config/tsconfig/base.json`
  - `packages/util-config/tsconfig/packages.json`
  - `packages/util-config/tsconfig/next.json`
  - `packages/util-config/tsconfig/expo.json`
  - `apps/api/tsconfig.json`
  - `apps/web/tsconfig.json`
  - `apps/mobile/tsconfig.json`
  - All `packages/*/tsconfig.json`

- **Changes:**
  - TypeScript version unified — `^5.9.0` in root `package.json` only. No workspace-level
    `typescript` declarations remain. ✅
  - Remaining: produce inventory matrix covering runtime family, emit status, `extends` chain,
    `module`, `moduleResolution`, JSX mode, and path alias usage for each workspace.
  - Remaining: define supported module-resolution policies (Bundler for frontend/shared,
    NodeNext/node for runtime-facing packages, explicit exception list).

- **Blockers:** None currently identified.

- **Dependencies:** None.

- **Completion Criteria:**
  - `grep -r '"typescript"' packages/*/package.json apps/*/package.json` returns no results.
  - Inventory matrix exists (can be a comment block in this plan or a short doc).
  - Module-resolution policy decision is recorded.

- **Suggested Commit Message:**

  ```
  chore(typescript): consolidate TypeScript version to root package.json only

  Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
  ```

---

## Stage 2: Establish Canonical Base Configs in util-config/tsconfig/

- **Status:** Pending

- **Goal:** Normalize the base config files in `packages/util-config/tsconfig/` so each file
  owns exactly one configuration role with no silent duplication.

- **Files:**
  - `packages/util-config/tsconfig/base.json` — repo-wide language defaults and strictness
  - `packages/util-config/tsconfig/packages.json` — source-consumed shared package defaults
  - `packages/util-config/tsconfig/next.json` — Next.js-specific settings only
  - `packages/util-config/tsconfig/expo.json` — Expo/mobile-specific settings only

- **Changes:**
  - `base.json`: own only `target`, `lib`, `strict`, `skipLibCheck`, `resolveJsonModule`,
    `forceConsistentCasingInFileNames`. Remove any settings that belong in runtime-family
    configs.
  - `packages.json`: own `module`, `moduleResolution`, `noEmit: true`. Must not carry
    app-family settings.
  - `next.json`: own only JSX mode and Next-required settings. Must extend `packages.json`
    or `base.json` correctly.
  - `expo.json`: own only Expo base extension and mobile `moduleSuffixes`. Must extend
    `packages.json` or `base.json` correctly.
  - Consider adding `packages-build.json` for emitted packages (`noEmit: false`, declaration
    settings, `rootDir`, `outDir`).
  - Consider adding `nest.json` or `node-service.json` for the API/backend service family.

- **Blockers:** None currently identified.

- **Dependencies:** Stage 1 inventory must be complete so the right flags are assigned to the
  right base files.

- **Completion Criteria:**
  - Each base config file contains only the settings appropriate for its stated role.
  - `pnpm typecheck` passes across the full monorepo.
  - `pnpm --filter api typecheck` passes.
  - `pnpm --filter web typecheck` passes.
  - `pnpm --filter mobile typecheck` passes.

- **Suggested Commit Message:**

  ```
  chore(tsconfig): normalize canonical base configs in packages/util-config/tsconfig/

  Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
  ```

---

## Stage 3: Remove baseUrl Deprecation from Workspace tsconfigs

- **Status:** Pending

- **Goal:** Remove deprecated `baseUrl` usage from workspace tsconfigs where it is used
  without a corresponding `paths` map or where it is no longer required by the module
  resolution strategy.

- **Files:**
  - `apps/api/tsconfig.json`
  - `apps/api/tsconfig.build.json`
  - `apps/web/tsconfig.json`
  - `apps/mobile/tsconfig.json`
  - `packages/core-contracts/tsconfig.json`
  - `packages/core-contracts/tsconfig.build.json`
  - `packages/domain-search/tsconfig.json`
  - `packages/util-config/tsconfig/base.json`
  - `packages/util-config/tsconfig/packages.json`
  - `packages/util-config/tsconfig/next.json`
  - `packages/util-config/tsconfig/expo.json`

- **Changes:**
  - For each file: check whether `baseUrl` is required for `paths` resolution or is a
    legacy leftover.
  - Remove `baseUrl` where it is not paired with a `paths` map or where the module resolution
    strategy no longer requires it (`Bundler` and `NodeNext` do not require `baseUrl` for
    package imports).
  - Ensure any remaining `paths` aliases have an explicit, justified `baseUrl`.

- **Blockers:** None currently identified.

- **Dependencies:** Stage 2 must be complete so base config roles are clear before touching
  workspace configs.

- **Completion Criteria:**
  - No unexplained `baseUrl` entries remain in any tsconfig.
  - `pnpm typecheck` passes across the full monorepo.
  - `pnpm --filter api typecheck` passes.
  - `pnpm --filter web typecheck` passes.
  - `pnpm --filter mobile typecheck` passes.

- **Suggested Commit Message:**

  ```
  chore(tsconfig): remove deprecated baseUrl from workspace tsconfigs

  Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
  ```

---

## Stage 4: Separate Editor Config from Build Config

- **Status:** Pending

- **Goal:** Ensure every package that emits JS has a dedicated `tsconfig.build.json` for
  runtime/emit intent and a separate `tsconfig.json` for editor/typecheck intent.

- **Files:**
  - `apps/api/tsconfig.json`
  - `apps/api/tsconfig.build.json`
  - `packages/core-contracts/tsconfig.json`
  - `packages/core-contracts/tsconfig.build.json`
  - `packages/util-config/tsconfig/` base configs (split emission settings into
    `packages-build.json` if not already done in Stage 2)

- **Changes:**
  - Packages that emit should all have `tsconfig.build.json` with emission-specific flags
    (`noEmit: false`, `declaration`, `rootDir`, `outDir`).
  - Packages that do not emit should not carry build-only compiler flags in `tsconfig.json`.
  - Avoid mixing `moduleResolution: bundler` editor behavior with Node/CommonJS runtime
    emission in the same file.
  - `apps/api`: confirm `tsconfig.json` is editor-only and `tsconfig.build.json` drives the
    NestJS CLI build.

- **Blockers:** None currently identified.

- **Dependencies:** Stage 3 must be complete so `baseUrl` issues are resolved before
  separating build configs.

- **Completion Criteria:**
  - All emitted packages have both `tsconfig.json` (editor) and `tsconfig.build.json` (build).
  - `pnpm --filter core-contracts build` succeeds.
  - `pnpm --filter api build` succeeds.
  - `pnpm typecheck` passes across the full monorepo.

- **Suggested Commit Message:**

  ```
  chore(tsconfig): separate editor config from build config for emitted packages

  Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
  ```

---

## Stage 5: Standardize Module Resolution by Workspace Family

- **Status:** Pending

- **Goal:** Ensure each workspace family uses one explicit, consistent module-resolution
  strategy that matches its real runtime.

- **Files:**
  - `apps/api/tsconfig.json` and `apps/api/tsconfig.build.json`
  - `apps/web/tsconfig.json`
  - `apps/mobile/tsconfig.json`
  - `packages/core-api/tsconfig.json`
  - `packages/core-contracts/tsconfig.json`
  - `packages/core-db/tsconfig.json`
  - `packages/core-i18n/tsconfig.json`
  - `packages/design-tokens/tsconfig.json`
  - `packages/domain-account/tsconfig.json`
  - `packages/domain-content/tsconfig.json`
  - `packages/domain-live/tsconfig.json`
  - `packages/domain-playback/tsconfig.json`
  - `packages/domain-progress/tsconfig.json`
  - `packages/domain-search/tsconfig.json`
  - `packages/util-config/tsconfig.json`
  - `packages/util-ingest/tsconfig.json`

- **Changes:**
  - Frontend apps and source-consumed UI packages: use `Bundler` module resolution where
    consumed as source by Next.js or Expo.
  - Backend app and Node-oriented utilities: use a runtime-compatible Node model for emitted
    JS.
  - Remove any `Bundler` settings that leak into packages that produce emitted JS for Node
    runtime.
  - Document any exceptions explicitly in the affected tsconfig file with a comment.

- **Blockers:** None currently identified.

- **Dependencies:** Stage 4 must be complete so the editor/build split is in place before
  resolving module resolution across families.

- **Completion Criteria:**
  - Each workspace uses one explicit, documented module-resolution strategy.
  - `pnpm --filter api build` produces valid CommonJS output (API boots in watch mode).
  - `pnpm --filter web build` succeeds.
  - `pnpm --filter mobile typecheck` resolves native/web suffixes correctly.
  - `pnpm typecheck` passes across the full monorepo.

- **Suggested Commit Message:**

  ```
  chore(tsconfig): standardize module resolution by workspace family

  Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
  ```

---

## Stage 6: Final Verification Matrix

- **Status:** Pending

- **Goal:** Run the full verification suite after all tsconfig normalization is complete to
  confirm no regressions and produce a passing baseline.

- **Files:** No file changes in this stage — verification only.

- **Changes:** None.

- **Blockers:** None currently identified.

- **Dependencies:** All previous stages must be complete.

- **Completion Criteria:**
  - `pnpm typecheck` passes across all workspaces.
  - `pnpm --filter api typecheck` passes.
  - `pnpm --filter web typecheck` passes.
  - `pnpm --filter mobile typecheck` passes.
  - `pnpm --filter core-contracts build` succeeds.
  - `pnpm --filter core-db build` succeeds.
  - `pnpm --filter web build` succeeds.
  - `pnpm --filter api build` succeeds.
  - `pnpm --filter api test` passes.
  - API watch mode boots without module-format errors.
  - Mobile typecheck still resolves native/web suffixes correctly.

- **Suggested Commit Message:**

  ```
  chore(tsconfig): final verification — all workspaces typecheck and build clean

  Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
  ```

---

# Final Verification

- `pnpm typecheck` passes across all workspaces.
- `pnpm --filter api typecheck` passes.
- `pnpm --filter web typecheck` passes.
- `pnpm --filter mobile typecheck` passes.
- `pnpm --filter core-contracts build` succeeds.
- `pnpm --filter core-db build` succeeds.
- `pnpm --filter web build` succeeds.
- `pnpm --filter api build` succeeds.
- `pnpm --filter api test` passes.
- API watch mode boots without module-format errors.
- Web and mobile builds do not regress on source-consumed packages.
- Mobile typecheck still resolves native/web suffixes correctly.
- No unexplained per-package compiler flag drift remains.
- VS Code diagnostics align with CLI typecheck output.

---

# Plan Completion

- All six stages are complete.
- Final verification passes.
- TypeScript policy documented in `AGENT.md` or `docs/dev-ops.md`.
- Plan status updated to `Completed`.
- Plan archived to `.agents/plans/completed/`.

---

## Background Context

### Why This Plan Was Needed

The repo showed several consistency problems before this plan:

- TypeScript versions drifted across workspaces (root `^5.9.0`, various workspace overrides).
- Config inheritance split across multiple bases without clear role separation.
- Module resolution inconsistent across workspaces.
- Some packages used a single `tsconfig.json` for both editor and build concerns.
- API and contracts exposed a real failure mode where runtime module resolution and TypeScript
  editor resolution diverged.

### Remaining Known Inconsistent Workspace Configs

These files require attention in Stages 2–5:

- `apps/api/tsconfig.json`
- `apps/api/tsconfig.build.json`
- `apps/web/tsconfig.json`
- `apps/mobile/tsconfig.json`
- `packages/core-contracts/tsconfig.json`
- `packages/core-contracts/tsconfig.build.json`
- `packages/domain-search/tsconfig.json`
- `packages/util-config/tsconfig/base.json`
- `packages/util-config/tsconfig/packages.json`
- `packages/util-config/tsconfig/next.json`
- `packages/util-config/tsconfig/expo.json`

### Remaining Packages with tsconfig.json

All remaining packages (tsconfig.json exists in each):

- `packages/core-api`
- `packages/core-contracts`
- `packages/core-db`
- `packages/core-i18n`
- `packages/design-tokens`
- `packages/domain-account`
- `packages/domain-content`
- `packages/domain-live`
- `packages/domain-playback`
- `packages/domain-progress`
- `packages/domain-search`
- `packages/util-config`
- `packages/util-ingest`

### Non-Goals

- Do not upgrade frameworks as part of this change unless the TypeScript target forces it.
- Do not rewrite package boundaries or import architecture as part of this change.
- Do not convert all packages to project references in the first pass unless audit proves
  that is necessary.
