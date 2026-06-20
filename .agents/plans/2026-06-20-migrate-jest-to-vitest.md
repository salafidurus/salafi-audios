# Metadata

- **Date**: 2026-06-20
- **Status**: In Progress
- **Scope**: Monorepo-wide (excluding apps/native)
- **Summary**: Migrate the test suites of apps/api, apps/livestreams, apps/web, and packages/* from Jest to Vitest. Refactor all occurrences of jest APIs (e.g. jest.fn, jest.mock, jest.spyOn) to native Vitest vi APIs (vi.fn, vi.mock, vi.spyOn) and imports, keeping apps/native on Jest for stability.
- **Dependencies**: None.

---

# Progress

- Audit of current test files and configurations completed.
- Hybrid migration strategy decided: Vitest for web, API, and packages; Jest-expo for mobile.
- Refactoring strategy updated: directly rewrite all Jest mocks and globals to Vitest's `vi` and native Vitest imports (no global shims).
- Architectural blueprint drafted and approved.
- Stage 0 completed: git worktree setup and husky pre-push hook configuration.

---

# Staging Strategy

Implementation is split into 7 sequential, incremental stages:

0. **Stage 0**: Create git worktree and clean up husky pre-push hook.
1. **Stage 1**: Add Vitest toolchain dependencies to pnpm-workspace catalogs.
2. **Stage 2**: Configure TypeScript type isolation between Jest and Vitest to prevent global name clashes.
3. **Stage 3**: Create shared base configs, refactor tests, and migrate all `packages/*` to Vitest.
4. **Stage 4**: Migrate NestJS backend apps (`apps/api` and `apps/livestreams`) tests using `unplugin-swc` and refactor mocks.
5. **Stage 5**: Migrate Next.js frontend app (`apps/web`) tests using `@vitejs/plugin-react` and `jsdom`, refactoring hooks and screen mocks.
6. **Stage 6**: Align Turborepo configs and prune unused Jest catalog entries.

---

## Stage 0: Create git worktree and clean up husky pre-push hook

- **Status**: Completed (Commit 72fc320)
- **Goal**: Establish a dedicated git worktree and update the husky pre-push hooks.
- **Files**:
  - [pre-push](file:///C:/dev/salafi-audios/.husky/pre-push) (MODIFY)
- **Changes**:
  - Create a new git worktree at `.worktrees/migrate-jest-to-vitest` and checking out branch `f/migrate-jest-to-vitest`.
  - Remove the non-fatal error fallback from the `expo-doctor` command in `.husky/pre-push`.
- **Blockers**: None currently identified.
- **Dependencies**: None.
- **Completion Criteria**:
  - Git worktree is successfully created.
  - `.husky/pre-push` only runs `pnpm --filter native exec expo-doctor`.
- **Suggested Commit Message**:
  ```text
  ci: update prepush hook to enforce strict expo-doctor check
  ```

---

## Stage 1: Add Vitest catalog dependencies

- **Status**: Planned
- **Goal**: Register Vitest and supporting compilation/routing libraries in the monorepo catalog.
- **Files**:
  - [pnpm-workspace.yaml](file:///C:/dev/salafi-audios/pnpm-workspace.yaml)
- **Changes**:
  - Add `vitest`, `@vitejs/plugin-react`, `vite-tsconfig-paths`, and `unplugin-swc` to the `catalog` section.
- **Blockers**: None currently identified.
- **Dependencies**: Stage 0 completed.
- **Completion Criteria**:
  - `pnpm install` completes successfully without lockfile conflicts.
- **Suggested Commit Message**:
  ```text
  build: add vitest toolchain dependencies to catalogs
  ```

---

## Stage 2: Configure type isolation and TS compiler targets

- **Status**: Planned
- **Goal**: Isolate `jest` global types to `apps/native` and introduce `vitest/globals` to Vitest workspaces.
- **Files**:
  - [apps/native/tsconfig.json](file:///C:/dev/salafi-audios/apps/native/tsconfig.json)
  - [apps/api/tsconfig.json](file:///C:/dev/salafi-audios/apps/api/tsconfig.json)
  - [apps/web/tsconfig.json](file:///C:/dev/salafi-audios/apps/web/tsconfig.json)
  - [tsconfig.base.json](file:///C:/dev/salafi-audios/tsconfig.base.json)
- **Changes**:
  - Remove generic global types from `tsconfig.base.json` if any.
  - Add `"types": ["jest"]` to native's tsconfig.
  - Add `"types": ["vitest/globals"]` to api, web, and packages configurations.
- **Blockers**: None currently identified.
- **Dependencies**: Stage 1 completed.
- **Completion Criteria**:
  - Running `pnpm typecheck` successfully passes without duplicate identifier conflicts or namespace clash errors.
- **Suggested Commit Message**:
  ```text
  config: isolate jest and vitest global types in tsconfig files
  ```

---

## Stage 3: centralize and migrate packages/ domain tests

- **Status**: Planned
- **Goal**: Replace Jest configurations with Vitest base configurations, and directly refactor mock/spy usages in `packages/*`.
- **Files**:
  - [packages/vitest.config.base.ts](file:///C:/dev/salafi-audios/packages/vitest.config.base.ts) (NEW)
  - [packages/*/package.json](file:///C:/dev/salafi-audios/packages) (MODIFY)
  - [packages/*/vitest.config.ts](file:///C:/dev/salafi-audios/packages) (NEW)
  - [packages/*/jest.config.cjs](file:///C:/dev/salafi-audios/packages) (DELETE)
  - All test files under `packages/*/src/**/*.spec.ts` (MODIFY)
- **Changes**:
  - Implement a centralized base Vitest configuration.
  - Replace `"test"` script commands in package.json with `vitest run`.
  - Refactor all instances of `jest.fn()`, `jest.spyOn()`, `jest.mock()`, and typings like `jest.Mocked` to native Vitest `vi` APIs (`vi.fn`, `vi.mock`, `vi.spyOn`, and `Mocked` from `vitest`).
- **Blockers**: None currently identified.
- **Dependencies**: Stage 2 completed.
- **Completion Criteria**:
  - Running `pnpm --filter "@sd/domain-*" test` runs and passes all tests under Vitest.
- **Suggested Commit Message**:
  ```text
  test: migrate packages to vitest base config and refactor jest to vi
  ```

---

## Stage 4: Migrate NestJS backend tests to Vitest

- **Status**: Planned
- **Goal**: Configure SWC compiler, rewrite mocks to `vi` API, and execute backend tests in Vitest.
- **Files**:
  - [apps/api/package.json](file:///C:/dev/salafi-audios/apps/api/package.json)
  - [apps/api/vitest.config.ts](file:///C:/dev/salafi-audios/apps/api/vitest.config.ts) (NEW)
  - [apps/api/jest.config.cjs](file:///C:/dev/salafi-audios/apps/api/jest.config.cjs) (DELETE)
  - [apps/api/test/jest-e2e.json](file:///C:/dev/salafi-audios/apps/api/test/jest-e2e.json) (DELETE)
  - [apps/livestreams/package.json](file:///C:/dev/salafi-audios/apps/livestreams/package.json)
  - [apps/livestreams/vitest.config.ts](file:///C:/dev/salafi-audios/apps/livestreams/vitest.config.ts) (NEW)
  - [apps/livestreams/jest.config.cjs](file:///C:/dev/salafi-audios/apps/livestreams/jest.config.cjs) (DELETE)
  - All test files under `apps/api/src/**/*.spec.ts` (MODIFY)
  - All test files under `apps/livestreams/src/**/*.spec.ts` (MODIFY)
- **Changes**:
  - Add `vitest.config.ts` loading `unplugin-swc` for decorators in both api and livestreams directories.
  - Update `"test"`, `"test:cov"`, and `"test:e2e"` scripts to use Vitest commands.
  - Refactor all instances of `jest.fn()`, `jest.spyOn()`, `jest.mock()`, and `jest.Mocked` to native Vitest `vi` APIs and type definitions.
- **Blockers**: None currently identified.
- **Dependencies**: Stage 3 completed.
- **Completion Criteria**:
  - `pnpm --filter api test` and `pnpm --filter api test:e2e` run and pass.
  - `pnpm --filter livestreams test` runs and passes.
- **Suggested Commit Message**:
  ```text
  test: configure vitest with swc and migrate backend test suites
  ```

---

## Stage 5: Migrate Next.js frontend web app tests to Vitest

- **Status**: Planned
- **Goal**: Migrate the web app unit tests using Vite's React plugin, JSDOM, and rewrite mocks to `vi` API.
- **Files**:
  - [apps/web/package.json](file:///C:/dev/salafi-audios/apps/web/package.json)
  - [apps/web/vitest.config.ts](file:///C:/dev/salafi-audios/apps/web/vitest.config.ts) (NEW)
  - [apps/web/jest.config.cjs](file:///C:/dev/salafi-audios/apps/web/jest.config.cjs) (DELETE)
  - [apps/web/jest.setup.ts](file:///C:/dev/salafi-audios/apps/web/jest.setup.ts) (DELETE)
  - [apps/web/vitest.setup.ts](file:///C:/dev/salafi-audios/apps/web/vitest.setup.ts) (NEW)
  - All test files under `apps/web/src/**/*.spec.{ts,tsx}` (MODIFY)
- **Changes**:
  - Introduce `vitest.config.ts` using `@vitejs/plugin-react` and `jsdom` environment.
  - Create setup file importing `@testing-library/jest-dom/vitest`.
  - Update web app test script commands in package.json.
  - Refactor all instances of `jest.fn()`, `jest.spyOn()`, `jest.mock()`, and `jest.Mocked` to native Vitest `vi` APIs and type definitions.
- **Blockers**: None currently identified.
- **Dependencies**: Stage 3 completed.
- **Completion Criteria**:
  - `pnpm --filter web test` executes and passes all client-side tests.
- **Suggested Commit Message**:
  ```text
  test: migrate frontend web tests to vitest and refactor mocks to vi
  ```

---

## Stage 6: Align Turborepo pipelines and clean catalog

- **Status**: Planned
- **Goal**: Update test configurations globally and prune unused Jest catalog entries.
- **Files**:
  - [turbo.json](file:///C:/dev/salafi-audios/turbo.json)
  - [pnpm-workspace.yaml](file:///C:/dev/salafi-audios/pnpm-workspace.yaml)
- **Changes**:
  - Update `test` inputs in `turbo.json` to monitor `vitest.config.*` files.
  - Remove unused Jest-specific dependencies from the catalog (e.g. `@types/jest`, `ts-jest` if not required by mobile app, etc.). Note: `jest` and `jest-expo` will remain for the mobile app workspace.
- **Blockers**: None currently identified.
- **Dependencies**: Stage 4 and Stage 5 completed.
- **Completion Criteria**:
  - `pnpm test` successfully triggers all workspaces (packages, api, livestreams, web running under Vitest, and native running under Jest).
  - All tests complete successfully.
- **Suggested Commit Message**:
  ```text
  build: update turborepo configuration and prune jest catalog entries
  ```

---

# Final Verification

The migration is verified complete when the following verification commands pass:

1. **Full Workspace Typecheck**:
   ```bash
   pnpm typecheck
   ```
2. **Full Workspace Test Suite**:
   ```bash
   pnpm test
   ```
3. **Full Build Success**:
   ```bash
   pnpm build
   ```

---

# Plan Completion

- **Completion Criteria**: All 6 stages completed, all workspace tests running correctly, type isolation successfully verified.
- **Archival Action**: Set metadata status to `Completed` and move this plan file into `.agents/plans/completed/`.
