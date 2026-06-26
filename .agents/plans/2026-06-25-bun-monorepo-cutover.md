# Metadata

- Date: 2026-06-25
- Status: Planned
- Scope: Migrate the monorepo from `pnpm` to Bun in a dedicated worktree.
- Summary: Replace `pnpm` with Bun for installs, workspace resolution, script execution, and CI
  while keeping the existing Turbo-based monorepo structure intact.
- Dependencies:
  - Official Bun workspace docs: <https://bun.com/docs/pm/workspaces>
  - Official Expo Bun guide: <https://docs.expo.dev/guides/using-bun/>
  - Official Expo monorepo guide: <https://docs.expo.dev/guides/monorepos/>
  - Official Next.js Bun guide: <https://bun.com/docs/guides/ecosystem/nextjs>
  - Turbo package-manager support policy: <https://turborepo.dev/docs/support-policy#package-managers>
  - No official Bun/NestJS migration guide was found; Nest behavior must be validated empirically.

# Progress

- The repo has been reviewed for `pnpm` touchpoints across root manifests, app/package scripts,
  CI workflows, helper scripts, and docs.
- A dedicated migration worktree already exists at `.worktrees/bun-monorepo-cutover`.
- Bun is installed locally, so the migration can proceed without bootstrapping the runtime.
- Immediate next step: cut the first stage that establishes the Bun baseline and updates the root
  package-manager metadata in the migration worktree.

# Staging Strategy

1. Establish the Bun baseline in the dedicated worktree and make the workspace config compatible
   with Bun.
2. Convert all repo scripts and helper entrypoints from `pnpm` to Bun-compatible commands.
3. Update CI, docs, and contributor guidance so every documented command uses Bun.
4. Run the full validation sweep, fix any compatibility gaps, and remove any leftover `pnpm`
   references.

## Stage 1: Establish the Bun baseline

- Status: Planned
- Goal: Make the migration worktree Bun-first at the repository root without changing app logic.
- Files:
  - `.worktrees/bun-monorepo-cutover/package.json`
  - `.worktrees/bun-monorepo-cutover/pnpm-workspace.yaml`
  - `.worktrees/bun-monorepo-cutover/bun.lockb` or Bun lockfile equivalent
  - `.worktrees/bun-monorepo-cutover/README.md`
- Changes:
  - Update the root package-manager metadata to Bun.
  - Replace the pnpm workspace definition with Bun-compatible workspace configuration.
  - Generate the Bun lockfile and remove pnpm lockfile ownership from the repo root.
  - Keep Turbo as the task runner; only the package-manager layer changes.
- Blockers:
  - None currently identified.
- Dependencies:
  - Depends on the migration worktree remaining the active editing location.
  - Depends on Bun workspace behavior matching the repo’s current workspace layout.
- Completion Criteria:
  - `bun install` succeeds from the migration worktree root.
  - Workspace package resolution works for `apps/*` and `packages/*`.
  - The root metadata no longer advertises `pnpm` as the package manager.
- Suggested Commit Message: `chore: establish bun workspace baseline`

## Stage 2: Convert scripts and helper entrypoints

- Status: Planned
- Goal: Remove direct `pnpm` usage from repo scripts and helper programs.
- Files:
  - `.worktrees/bun-monorepo-cutover/package.json`
  - `.worktrees/bun-monorepo-cutover/apps/web/playwright.config.ts`
  - `.worktrees/bun-monorepo-cutover/apps/native/package.json`
  - `.worktrees/bun-monorepo-cutover/packages/core-db/package.json`
  - `.worktrees/bun-monorepo-cutover/scripts/postinstall.mjs`
  - `.worktrees/bun-monorepo-cutover/packages/core-db/scripts/migrate-with-auto-name.js`
- Changes:
  - Replace recursive `pnpm` script calls with Bun equivalents.
  - Update `postinstall` and database helper scripts to invoke Bun-compatible commands.
  - Adjust Playwright server startup commands and any package-scoped scripts that assume pnpm.
- Blockers:
  - Bun must support the required script and filter behaviors used by Turbo and the workspace.
- Dependencies:
  - Depends on Stage 1 establishing Bun as the active package manager.
- Completion Criteria:
  - No repo-owned script entrypoint shells out to `pnpm`.
  - Root, app, and package scripts execute through Bun successfully.
  - `apps/web` Playwright startup and `packages/core-db` helper scripts still work.
- Suggested Commit Message: `chore: replace pnpm script runners with bun`

## Stage 3: Update CI and documentation

- Status: Planned
- Goal: Make the repository’s automation and docs describe Bun as the standard workflow.
- Files:
  - `.worktrees/bun-monorepo-cutover/.github/workflows/*.yml`
  - `.worktrees/bun-monorepo-cutover/README.md`
  - `.worktrees/bun-monorepo-cutover/AGENT.md`
  - `.worktrees/bun-monorepo-cutover/docs/dev-ops.md`
  - `.worktrees/bun-monorepo-cutover/.github/copilot-instructions.md`
  - `.worktrees/bun-monorepo-cutover/apps/*/README.md`
  - `.worktrees/bun-monorepo-cutover/packages/*/README.md`
- Changes:
  - Replace pnpm setup steps in CI with Bun install/setup steps.
  - Re-key caches and workflow triggers to the Bun lockfile.
  - Rewrite contributor commands, examples, and package-manager references to Bun.
  - Keep the existing architecture and guardrails language unchanged unless Bun requires a
    specific operational note.
- Blockers:
  - CI command parity must be confirmed after script conversion.
- Dependencies:
  - Depends on Stage 2 so the docs and workflows describe commands that actually exist.
- Completion Criteria:
  - All workflows run with Bun-based install and script commands.
  - No user-facing docs in the repo still instruct contributors to use pnpm for normal work.
  - CI references Bun lockfile artifacts instead of pnpm lockfile artifacts.
- Suggested Commit Message: `chore: update ci and docs for bun`

## Stage 4: Validate, fix, and clean up

- Status: Planned
- Goal: Prove the Bun migration works end-to-end and remove any leftover pnpm references.
- Files:
  - `.worktrees/bun-monorepo-cutover/**`
- Changes:
  - Run the full validation suite under Bun.
  - Fix any Bun-specific incompatibilities discovered in Expo, Next.js, Turbo, or NestJS.
  - Remove remaining pnpm mentions from comments, docs, and scripts that were missed earlier.
- Blockers:
  - Potential NestJS compatibility gaps may require targeted script changes if Bun behaves
    differently from pnpm for the API workflow.
- Dependencies:
  - Depends on Stages 1-3 being complete.
- Completion Criteria:
  - `bun run build` succeeds across the monorepo.
  - `bun run lint`, `bun run typecheck`, `bun run test`, and `bun run test:e2e` pass.
  - Expo/native, web/Next.js, API/NestJS, and core-db workflows all pass their targeted checks.
  - No meaningful `pnpm` references remain in repo-owned commands or docs.
- Suggested Commit Message: `chore: validate bun migration and remove leftovers`

# Final Verification

- Confirm a clean Bun install from the migration worktree root.
- Confirm all root validation commands pass under Bun.
- Confirm the app-specific smoke checks pass for web, native, API, and core-db.
- Confirm CI no longer depends on pnpm actions, pnpm lockfiles, or pnpm-specific caches.
- Confirm the migration worktree is ready for review or merge with no open Bun-related blockers.

# Plan Completion

- This plan can be marked `Completed` only when every stage status is completed, the final
  verification checks pass, and the Bun migration has no known open compatibility gaps.
- After completion, move this file to `.agents/plans/completed/` and keep the historical record
  there.
