# Metadata

- Date: 2026-06-26
- Status: In Progress
- Scope: Migrate the monorepo from pnpm to Bun + replace Prettier with oxfmt + minimize
  ESLint to oxlint (keep ESLint only for Next.js/Expo framework rules).
- Summary: Combined migration in a single worktree/PR. Both migrations touch the same
  files (catalog, scripts, turbo.json, CI) so doing them together avoids merge conflicts.
- Dependencies: Requires the existing monorepo layout and current CI workflows to stay
  otherwise unchanged.

# Progress

- Plan finalized and all decisions confirmed.
- Decisions confirmed:
  - Drop barrel/RTL/path rules (Oxlint can't replicate ESLint AST selectors)
  - `import/no-default-export` → keep only in remaining ESLint configs (web, native)
  - `no-console` → oxlint globally (3 files need inline disables)
  - `lint:fix` → dropped (oxlint has no --fix)
  - Combined single PR for both Bun and OXC migrations
- Immediate next step: create worktree and start implementation.

# Staging Strategy

Ordered by dependency: environment setup first (worktree, install, config), then
migration changes, then cleanup, then verification.

## Stage 1: Create worktree

- Status: Pending
- Goal: Working directory in a new git worktree for isolated changes.
- Files: Git worktree metadata only.
- Changes: `git worktree add ../.worktrees/feat-oxc-migration feat/oxc-migration`
- Blockers: Clean git state required.
- Dependencies: None.
- Completion Criteria: Worktree exists at `.worktrees/feat-oxc-migration` on branch.
- Suggested Commit Message: N/A (no commit — branch creation)

## Stage 2: Add oxfmt to catalog + finalize Bun setup

- Status: Pending
- Goal: oxfmt available in catalog; Bun workspace config finalized.
- Files: `package.json` (root), `pnpm-workspace.yaml`
- Changes:
  - Add `"oxfmt": "<latest>"` to workspaces.catalog
  - Remove `pnpm-workspace.yaml` if still present
  - Verify `packageManager`, `workspaces.packages`, `workspaces.catalog` are clean
  - Run `bun install`
- Blockers: Need to check current Bun version and oxfmt latest version.
- Dependencies: Stage 1.
- Completion Criteria: `bun install` succeeds; `oxfmt --version` works; no
  `pnpm-workspace.yaml` remains.
- Suggested Commit Message: `chore: add oxfmt to catalog and finalize bun workspace config`

## Stage 3: Configure oxfmt

- Status: Pending
- Goal: oxfmt formatting configs match current Prettier settings.
- Files: `.oxfmtrc.json` (root, new), `apps/api/.oxfmtrc.json` (new)
- Changes:
  - Root: `{ "printWidth": 100, "semi": true, "singleQuote": false, "trailingComma": "all", "ignorePatterns": [...] }`
  - API: `{ "singleQuote": true, "trailingComma": "all" }`
- Blockers: None.
- Dependencies: Stage 2.
- Completion Criteria: `oxfmt --check .` runs without errors on root; API local override is respected.
- Suggested Commit Message: `feat: add oxfmt formatting configs (root + api override)`

## Stage 4: Migrate root scripts (format → oxfmt)

- Status: Pending
- Goal: Root format scripts use oxfmt instead of prettier.
- Files: `package.json` (root)
- Changes:
  - `"format": "prettier -w ."` → `"format": "oxfmt ."`
  - `"format:check": "prettier -c ."` → `"format:check": "oxfmt --check ."`
  - Fix any remaining `pnpm` → `bun` in root scripts.
- Blockers: None.
- Dependencies: Stage 3.
- Completion Criteria: `bun run format` formats code; `bun run format:check` passes.
- Suggested Commit Message: `feat: migrate root format scripts to oxfmt`

## Stage 5: Migrate workspace scripts

- Status: Pending
- Goal: All workspace scripts use bun, oxfmt, and oxlint appropriately.
- Files: All workspace `package.json` files (apps/api, apps/web, apps/native,
  packages/core-contracts, packages/design-tokens, packages/core-i18n,
  packages/core-db, packages/util-ingest)
- Changes:
  - apps/api: format → `oxfmt src test`; lint → `oxlint .` (drop ` && eslint .`);
    delete lint:fix; remove prettier, eslint, typescript-eslint, globals, eslint-plugin-prettier,
    eslint-config-prettier, @eslint/eslintrc, @eslint/js from devDeps
  - All packages (5): lint → `oxlint .` (drop ` && eslint .`)
  - apps/web: lint stays `oxlint . && eslint .`
  - apps/native: lint stays `oxlint . && expo lint`
  - Convert any remaining `pnpm --filter` → `bun --filter` in all scripts
- Blockers: Need to verify `expo lint` still works after ESLint config simplification.
- Dependencies: Stage 4.
- Completion Criteria: All workspace `lint` and `format` scripts run correctly.
- Suggested Commit Message: `feat: migrate workspace scripts to bun, oxfmt, and oxlint`

## Stage 6: Consolidate oxlint rules

- Status: Pending
- Goal: `.oxlintrc.json` covers rules previously enforced by ESLint.
- Files: `.oxlintrc.json` (root)
- Changes:
  ```json
  {
    "plugins": ["import"],
    "rules": { "no-console": "error" },
    "ignorePatterns": [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.next/**",
      "**/.expo/**",
      "**/coverage/**",
      "**/generated/**"
    ]
  }
  ```
- Blockers: None.
- Dependencies: Stage 5.
- Completion Criteria: `oxlint .` passes with no unexpected violations.
- Suggested Commit Message: `feat: consolidate oxlint rules — no-console, import plugin`

## Stage 7: Delete root ESLint configs

- Status: Pending
- Goal: Remove shared ESLint config files (rules migrated to oxlint or dropped).
- Files: `eslint.config.base.mjs`, `eslint.config.packages.mjs`, `eslint.config.nest.mjs`
- Changes: Delete all three files.
- Blockers: None.
- Dependencies: Stage 6.
- Completion Criteria: No root `eslint.config.*.mjs` files exist.
- Suggested Commit Message: `refactor: delete root eslint base configs`

## Stage 8: Remove ESLint from packages + API

- Status: Pending
- Goal: Packages and API use oxlint as sole linter.
- Files (delete): `packages/core-contracts/eslint.config.mjs`,
  `packages/design-tokens/eslint.config.mjs`, `packages/core-i18n/eslint.config.mjs`,
  `packages/core-db/eslint.config.mjs`, `packages/util-ingest/eslint.config.mjs`,
  `apps/api/eslint.config.mjs`
- Changes: Delete all 6 config files. (Scripts already updated in Stage 5.)
- Blockers: None.
- Dependencies: Stage 7.
- Completion Criteria: No `eslint.config.*` files in packages or API.
- Suggested Commit Message: `refactor: remove eslint from packages and api`

## Stage 9: Simplify web + native ESLint configs

- Status: Pending
- Goal: Web ESLint handles only Next.js rules; native ESLint handles only Expo rules.
- Files: `apps/web/eslint.config.js`, `apps/native/eslint.config.js`
- Changes:
  - Web: `export default [...nextCoreWebVitals]` (no base/rules imports)
  - Native: `export default [...expo]` (no base/rules/RTL/path imports)
- Blockers: Need to verify framework configs are self-contained.
- Dependencies: Stage 7.
- Completion Criteria: `bun run --filter web lint` and `bun run --filter native lint` pass.
- Suggested Commit Message: `refactor: simplify web and native eslint to framework rules only`

## Stage 10: Clean up catalog + root devDeps

- Status: Pending
- Goal: Remove obsolete packages from catalog and root devDependencies.
- Files: `package.json` (root)
- Changes: Remove from catalog: `prettier`, `eslint-config-prettier`,
  `eslint-plugin-prettier`, `eslint-plugin-oxlint`, `eslint-plugin-import`, `globals`
  Remove from root devDependencies: `@typescript-eslint/eslint-plugin`,
  `@typescript-eslint/parser`, `eslint-plugin-oxlint`, `eslint-plugin-import`, `globals`
- Blockers: None.
- Dependencies: Stages 5, 8.
- Completion Criteria: Removed packages absent from lockfile after `bun install`.
- Suggested Commit Message: `chore: remove obsolete eslint ecosystem packages from catalog`

## Stage 11: Update turbo.json

- Status: Pending
- Goal: Turbo pipeline reflects new lint/format tools; old ESLint config refs gone.
- Files: `turbo.json`
- Changes: Remove deleted configs from `globalDependencies`; update `lint` task `inputs`;
  add `format` task if not present.
- Blockers: None.
- Dependencies: Stage 7.
- Completion Criteria: `turbo.json` valid; `turbo run lint` works.
- Suggested Commit Message: `chore: update turbo.json for oxlint-only lint and oxfmt format`

## Stage 12: Update lint-staged

- Status: Pending
- Goal: Pre-commit hook uses oxfmt instead of prettier.
- Files: `.lintstagedrc.cjs`
- Changes: `*.{js,jsx,ts,tsx}` → `["oxlint", "oxfmt"]`; `*.{json,md,yml,yaml}` → `["oxfmt"]`
- Blockers: None.
- Dependencies: Stage 3.
- Completion Criteria: `npx lint-staged --dry-run` confirms correct commands.
- Suggested Commit Message: `chore: update lint-staged to use oxfmt`

## Stage 13: Remove stale eslint-disable comments

- Status: Pending
- Goal: Clean up ~50 stale `eslint-disable` comments in packages and API.
- Scope: All files in `packages/*/` and `apps/api/`.
- Changes: Find and remove all `eslint-disable`, `eslint-disable-next-line`,
  `eslint-enable` comments in scope.
- Blockers: None.
- Dependencies: Stage 8.
- Completion Criteria: No `eslint-disable` comments in packages or API.
- Suggested Commit Message: `chore: remove stale eslint-disable comments from packages and api`

## Stage 14: Update CI + docs

- Status: Pending
- Goal: CI workflows and documentation reflect both migrations.
- Files: `.github/workflows/*`, `README.md`, `AGENT.md` (root + workspace locals),
  `docs/*`, `.github/copilot-instructions.md`
- Changes:
  - CI: `pnpm/action-setup` → `oven-sh/setup-bun@v2`; update cache keys; fix all
    `pnpm` → `bun` commands
  - Docs: Update references from `pnpm` to `bun`, from prettier to oxfmt, from eslint
    to oxlint
- Blockers: None.
- Dependencies: All implementation stages.
- Completion Criteria: CI workflows valid; docs consistent.
- Suggested Commit Message: `docs: update ci and documentation for bun + oxc toolchain`

## Stage 15: Final verification

- Status: Pending
- Goal: Full monorepo verification — all commands pass cleanly.
- Checks:
  1. `bun install` succeeds from clean checkout
  2. `bun run format:check` passes
  3. `bun run lint` passes (oxlint + ESLint for web/native)
  4. `bun run typecheck` passes
  5. `bun run test` passes
  6. `bun run build` succeeds
  7. No `.prettierrc` files remain
  8. No `pnpm` invocations remain in any script
  9. No `eslint-disable` comments in packages/API
  10. No obsolete ESLint packages in lockfile
- Suggested Commit Message: `chore: final verification — all commands pass`

# Final Verification

After the last implementation stage, run:

- `bun install`
- `bun run format:check`
- `bun run lint`
- `bun run typecheck`
- `bun run test`
- `bun run build`
- Manual confirmation of no `.prettierrc` files, no `pnpm` in scripts, no obsolete ESLint packages

# Plan Completion

- All 15 stages complete and committed.
- Final verification passes.
- Move plan to `.agents/plans/completed/`.
