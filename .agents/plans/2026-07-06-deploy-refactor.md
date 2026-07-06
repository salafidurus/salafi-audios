# Metadata

- **Date**: 2026-07-06
- **Status**: Planned
- **Scope**: CI/CD, deployment optimization, scripts, monorepo configuration
- **Summary**: Refactor NestJS API and Next.js Web deployment pipelines using `turbo prune` to deploy with minimal dependency closures, reducing build durations and memory usage.
- **Dependencies**: None.

---

# Progress

- [x] Stage 1: Setup Git Worktree (`feat/deploy-script`)
- [x] Stage 2: Create Deployment Helper Utilities (`utils.mjs`)
- [x] Stage 3: Create Pruned Build Script (`build.mjs`)
- [x] Stage 4: Create Start Script (`start.mjs`)
- [x] Stage 5: Update Vercel and Render Configurations
- [x] Stage 6: Update DevOps Documentation
- [x] Stage 7: Local Verification & Clean up

---

# Staging Strategy

The implementation is broken down into modular steps starting with setting up the isolated development environment (Git Worktree), followed by the creation of scripts, application of configuration overrides, updates to DevOps docs, and final verification.

---

## Stage 1: Setup Git Worktree (`feat/deploy-script`)

- **Status**: Completed
- **Goal**: Create an isolated git worktree to develop the deployment scripts.
- **Files**:
  - `[NEW]` `.worktrees/feat-deploy-script/`
- **Changes**:
  - Create a new Git worktree at `.worktrees/feat-deploy-script` pointing to the new branch `feat/deploy-script`.
- **Blockers**: None currently identified.
- **Dependencies**: None.
- **Completion Criteria**:
  - Command `git worktree list` shows `.worktrees/feat-deploy-script` associated with branch `feat/deploy-script`.
- **Suggested Commit Message**:
  - `chore: bootstrap feat/deploy-script worktree`

---

## Stage 2: Create Deployment Helper Utilities (`utils.mjs`)

- **Status**: Completed
- **Goal**: Implement shared helper functions for directory cleanups, command execution, and root directory resolution.
- **Files**:
  - `[NEW]` [utils.mjs](file:///C:/dev/salafi-audios/scripts/deploy/utils.mjs)
- **Changes**:
  - Resolve the monorepo root dynamically by walking up directories.
  - Implement a synchronized command-execution wrapper that pipes outputs in real-time and propagates exit codes.
  - Retrieve the local Turborepo version from the root `package.json` dynamically.
- **Blockers**: None.
- **Dependencies**: Stage 1.
- **Completion Criteria**:
  - Utility module compiles and exports helper functions successfully.
- **Suggested Commit Message**:
  - `feat(deploy): implement core deployment utility helpers`

---

## Stage 3: Create Pruned Build Script (`build.mjs`)

- **Status**: Completed
- **Goal**: Implement the generic build script that prunes the monorepo workspace for a given target before building it.
- **Files**:
  - `[NEW]` [build.mjs](file:///C:/dev/salafi-audios/scripts/deploy/build.mjs)
- **Changes**:
  - Accept and validate target parameter (`web` or `api`).
  - Clean any existing `out/` build artifacts directory.
  - Run `bunx turbo@<version> prune <target> --docker`.
  - Delete directories that might pollute dependency resolution (`node_modules/`, `apps/`, `packages/`).
  - Copy pruned files from `out/full` and `out/json` back to the root to form the minimal workspace.
  - Run `bun install --frozen-lockfile` to install the pruned dependency closure.
  - Build the target via `bun run build --filter=<target>...`.
- **Blockers**: None.
- **Dependencies**: Stage 2.
- **Completion Criteria**:
  - Script successfully prunes and compiles target workspaces when executed.
- **Suggested Commit Message**:
  - `feat(deploy): implement generic build script with turbo prune`

---

## Stage 4: Create Start Script (`start.mjs`)

- **Status**: Completed
- **Goal**: Implement the production server launch starter script.
- **Files**:
  - `[NEW]` [start.mjs](file:///C:/dev/salafi-audios/scripts/deploy/start.mjs)
- **Changes**:
  - Support `api` starting via `bun run --filter=api start:prod`.
  - Support `web` starting via `bun run --filter=web start`.
- **Blockers**: None.
- **Dependencies**: Stage 2.
- **Completion Criteria**:
  - Script executes the correct startup command based on the target argument.
- **Suggested Commit Message**:
  - `feat(deploy): implement production startup script`

---

## Stage 5: Update Vercel and Render Configurations

- **Status**: Completed
- **Goal**: Update Vercel project configuration to override the install/build phases and document the Render dashboard variables.
- **Files**:
  - `[MODIFY]` [vercel.json](file:///C:/dev/salafi-audios/apps/web/vercel.json)
- **Changes**:
  - Set `installCommand` to `echo "Skipping default install"`.
  - Set `buildCommand` to `bun ../../scripts/deploy/build.mjs web`.
- **Blockers**: None.
- **Dependencies**: Stage 3.
- **Completion Criteria**:
  - `apps/web/vercel.json` matches the pruned build configuration.
- **Suggested Commit Message**:
  - `chore(deploy): configure vercel settings to use build script`

---

## Stage 6: Update DevOps Documentation

- **Status**: Completed
- **Goal**: Add deployment setup documentation for Render and Vercel dashboards inside `docs/dev-ops.md`.
- **Files**:
  - `[MODIFY]` [dev-ops.md](file:///C:/dev/salafi-audios/docs/dev-ops.md)
- **Changes**:
  - Add "8. Production Deployment Configuration" section detailing Vercel override command values and Render settings.
- **Blockers**: None.
- **Dependencies**: Stage 5.
- **Completion Criteria**:
  - `docs/dev-ops.md` accurately describes dashboard options for Render and Vercel.
- **Suggested Commit Message**:
  - `docs(devops): document vercel and render custom deployment steps`

---

## Stage 7: Local Verification & Clean up

- **Status**: Completed
- **Goal**: Run typechecks and linting, test build scripts locally, and verify git clean state before requesting review.
- **Files**: None.
- **Changes**:
  - Execute `bun run lint` and `bun run typecheck`.
  - Perform test execution of `bun scripts/deploy/build.mjs web` and `api` on the worktree.
  - Revert test build workspaces to restore local files.
- **Blockers**: None.
- **Dependencies**: Stage 6.
- **Completion Criteria**:
  - Code compiles, linting passes, and local build runs complete successfully.
- **Suggested Commit Message**:
  - `chore(deploy): final verification pass`

---

# Final Verification

The following checks must pass:

- `bun run lint` executes successfully with no new lint errors.
- `bun run typecheck` passes with no type errors across workspaces.
- Monorepo package dependency rules are strictly followed (no app-to-app imports, etc.).
- Dev servers run correctly in development workspaces (`bun run dev:web`, `bun run dev:api`).

---

# Plan Completion

- The plan will be marked as `Completed` once all stages are verified, committed, merged to `main`, and the deployment scripts are running successfully.
- This plan will then be moved to `file:///C:/dev/salafi-audios/.agents/plans/completed/2026-07-06-deploy-refactor.md`.
