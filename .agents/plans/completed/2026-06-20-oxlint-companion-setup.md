# Metadata

- Date: 2026-06-20
- Status: Completed
- Scope: Monorepo-wide dev environment / lint configurations
- Summary: Integrate Oxlint as a companion to ESLint in the Salafi Durus monorepo to accelerate linting times while preserving custom AST rule guardrails and framework-specific rules.
- Dependencies: None

# Progress

- [x] Create a git worktree at `.worktrees/c-oxlint` on branch `c/oxlint`.
- [x] Install devDependencies (`oxlint`, `eslint-plugin-oxlint`).
- [x] Configure `eslint-plugin-oxlint` in base and app ESLint configs.
- [x] Set up package-level `oxlint` scripts and `.oxlintrc.json` configuration.
- [x] Update `lint-staged` pre-commit config and root `ci:local` workflow.

# Staging Strategy

The implementation is broken down into five sequential stages to ensure correctness and testability: 0. Stage 0: Create a git worktree at `.worktrees/c-oxlint` on branch `c/oxlint`.

1. Stage 1: Install `oxlint` and `eslint-plugin-oxlint` at the monorepo root.
2. Stage 2: Update all ESLint configurations to extend `eslint-plugin-oxlint` (disabling duplicate ESLint checks).
3. Stage 3: Add Oxlint config and package-level run scripts.
4. Stage 4: Hook up Oxlint to `lint-staged` for pre-commit checks and integrate with CI commands.

## Stage 0: Create a git worktree

- Status: Completed
- Goal: Create a git worktree named `c/oxlint` under the `.worktrees` directory.
- Files: None.
- Changes:
  - Add git worktree at `.worktrees/c-oxlint` checked out to branch `c/oxlint`.
- Blockers: None currently identified.
- Dependencies: None.
- Completion Criteria:
  - Worktree `.worktrees/c-oxlint` is created successfully.
  - Current git branch in that worktree is `c/oxlint`.
- Suggested Commit Message:
  `chore: create worktree for oxlint migration`

## Stage 1: Install devDependencies

- Status: Completed
- Goal: Install `oxlint` and `eslint-plugin-oxlint` at the monorepo root.
- Files:
  - [package.json](file:///C:/dev/salafi-audios/package.json)
- Changes:
  - Add `oxlint` and `eslint-plugin-oxlint` to `devDependencies` in the root `package.json`.
- Blockers: None currently identified.
- Dependencies: None.
- Completion Criteria:
  - Running `pnpm install` completes successfully.
  - Verification that the packages are resolved and installed in `node_modules`.
- Suggested Commit Message:
  `build(root): install oxlint and eslint-plugin-oxlint`

## Stage 2: Configure ESLint configs to extend eslint-plugin-oxlint

- Status: Completed
- Goal: Extend `eslint-plugin-oxlint` in all base and app-level ESLint configs to disable redundant rules that are natively checked by Oxlint.
- Files:
  - [eslint.config.base.mjs](file:///C:/dev/salafi-audios/eslint.config.base.mjs)
  - [eslint.config.nest.mjs](file:///C:/dev/salafi-audios/eslint.config.nest.mjs)
  - [eslint.config.packages.mjs](file:///C:/dev/salafi-audios/eslint.config.packages.mjs)
  - [apps/web/eslint.config.js](file:///C:/dev/salafi-audios/apps/web/eslint.config.js)
  - [apps/native/eslint.config.js](file:///C:/dev/salafi-audios/apps/native/eslint.config.js)
- Changes:
  - Import `eslint-plugin-oxlint` in each config file.
  - Append `oxlint.configs.recommended` at the end of each config's exported array.
- Blockers: None currently identified.
- Dependencies: Stage 1.
- Completion Criteria:
  - `pnpm lint` runs successfully without duplicate rule warnings.
- Suggested Commit Message:
  `build(eslint): integrate eslint-plugin-oxlint to turn off redundant rules`

## Stage 3: Add Oxlint config and run scripts

- Status: Completed
- Goal: Establish Oxlint ignore rules and define scripts to run Oxlint in each package.
- Files:
  - [package.json](file:///C:/dev/salafi-audios/package.json)
  - [turbo.json](file:///C:/dev/salafi-audios/turbo.json)
  - [NEW] `.oxlintrc.json`
  - [apps/\*/package.json](file:///C:/dev/salafi-audios/apps/api/package.json)
  - [packages/\*/package.json](file:///C:/dev/salafi-audios/packages/core-db/package.json)
- Changes:
  - Create a root `.oxlintrc.json` configured with global ignores matching `eslint.config.base.mjs` (e.g. `dist/`, `build/`, `.next/`, `.expo/`, `node_modules/`, `coverage/`, etc.).
  - Add `"lint": "oxlint . && eslint ."` to existing packages/apps configurations.
- Blockers: None currently identified.
- Dependencies: Stage 2.
- Completion Criteria:
  - Running `pnpm lint` triggers package-level scripts correctly.
- Suggested Commit Message:
  `build(oxlint): add oxlint config and run scripts`

## Stage 4: Integrate with lint-staged and CI workflows

- Status: Completed
- Goal: Run Oxlint before committing and enforce it as part of CI quality gates.
- Files:
  - [.lintstagedrc.cjs](file:///C:/dev/salafi-audios/.lintstagedrc.cjs)
  - [package.json](file:///C:/dev/salafi-audios/package.json)
- Changes:
  - Edit [.lintstagedrc.cjs](file:///C:/dev/salafi-audios/.lintstagedrc.cjs) to run `oxlint` on `*.{js,jsx,ts,tsx}` staged files.
  - Update `ci:local` script in the root `package.json` to execute `pnpm lint && pnpm typecheck && ...`.
- Blockers: None currently identified.
- Dependencies: Stage 3.
- Completion Criteria:
  - Committing a JS/TS file executes `oxlint` on the staged file.
  - Running `pnpm ci:local` completes successfully.
- Suggested Commit Message:
  `build(ci): integrate oxlint into pre-commit and ci pipelines`

# Final Verification

- `pnpm install` runs successfully.
- `pnpm lint` runs successfully (executing oxlint then ESLint rules concurrently).
- `pnpm typecheck` passes across all workspaces.
- `pnpm build` succeeds for all affected apps and packages.
- `pnpm ci:local` passes fully.

# Plan Completion

- The plan is marked as `Completed` as all stages have been implemented, verified, and merged.
- This plan file will be moved to the `.agents/plans/completed/` directory.
