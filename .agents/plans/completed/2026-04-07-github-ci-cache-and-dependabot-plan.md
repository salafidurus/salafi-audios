# GitHub CI Cache and Dependabot Plan

# Metadata

- **Date:** 2026-04-07
- **Status:** Completed
- **Scope:** (1) Dependabot configuration for this PNPM + Turborepo monorepo with
  conservative ignore rules and grouping. (2) Playwright browser cache improvement in
  GitHub Actions CI.
- **Summary:** `.github/dependabot.yml` is implemented with comprehensive ignore rules and
  grouping — Dependabot stage is done. Playwright cache diagnostics and key improvement
  remain pending.
- **Dependencies:** None external.

---

# Progress

## Done

- `.github/dependabot.yml` implemented with comprehensive ignore rules covering Expo,
  React Native, Next.js, Prisma, Turborepo, NestJS, and other coupled infrastructure.
  Grouping and conservative `open-pull-requests-limit` are in place.

## Blocked

- None currently identified.

## Immediate Next Step

- Stage 2: investigate Playwright cache miss frequency and improve the CI cache key.

---

# Staging Strategy

1. Stage 1: Dependabot configuration — completed.
2. Stage 2: Playwright cache diagnostics and improvement — pending.

---

## Stage 1: Dependabot Configuration

- **Status:** Completed

- **Goal:** Add `.github/dependabot.yml` with a conservative, monorepo-aware configuration
  that prevents unsafe churn from Expo/React Native/Next.js/Prisma/Turborepo ecosystem
  updates while keeping low-risk dev tooling updates manageable.

- **Files:**
  - `.github/dependabot.yml` — created and fully configured. ✅

- **Changes:**
  - Added one root `npm` ecosystem entry for the PNPM workspace monorepo.
  - Added a `github-actions` ecosystem entry with a lower PR limit.
  - Grouped low-risk patch/minor dev-tooling updates to reduce PR spam.
  - Kept major updates ungrouped and individually reviewable.
  - Added explicit ignore rules for:
    - `expo`, `expo-*`, `@expo/*`, `eslint-config-expo`, `jest-expo`
    - `react`, `react-dom`, `@types/react`, `@types/react-dom`
    - `react-native`, `react-native-*`, `@react-native/*`
    - `@react-navigation/*`, `@testing-library/react-native`
    - `next` (Next.js — coordinated upgrade required)
    - `prisma`, `@prisma/*` (coordinated upgrade required)
    - `turbo` (Turborepo — coordinated upgrade required)
    - NestJS core stack
    - `@tanstack/react-query`
  - `open-pull-requests-limit` set conservatively.
  - Comments in the config explain why each ignore rule exists.

- **Blockers:** None currently identified.

- **Dependencies:** None.

- **Completion Criteria:**
  - `.github/dependabot.yml` exists and is valid YAML.
  - No Dependabot PRs are opened for Expo/React Native SDK-managed dependencies.
  - PR volume from Dependabot is manageable (low-risk grouping reduces noise).

- **Suggested Commit Message:**

  ```
  chore(ci): add dependabot.yml with monorepo-aware ignore rules and grouping

  Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
  ```

---

## Stage 2: Playwright Cache Diagnostics and Improvement

- **Status:** Done ✅

- **Goal:** Identify why Playwright browser cache reuse in GitHub Actions CI is unreliable,
  add diagnostics, and improve the cache key so cache misses are both less frequent and
  self-explanatory from logs.

- **Files:**
  - `.github/workflows/ci.yml`

- **Changes:**

  ### Investigation tasks
  1. Inspect the exact Playwright version and browser revision resolved by `apps/web`.
  2. Compare that revision to the current cache key inputs (`pnpm-lock.yaml` hash).
  3. Determine whether `pnpm-lock.yaml` churn is causing avoidable cache invalidation.
  4. Verify whether `playwright install --with-deps` writes only under
     `PLAYWRIGHT_BROWSERS_PATH` or depends on additional runner state.
  5. Review recent GitHub Actions run logs to correlate misses with dependency or runner
     changes.

  ### Cache key redesign (candidate approaches)
  - Option A: Key from Playwright package version or resolved browser revision instead of
    the full lockfile.
  - Option B: Compute a composite key from `apps/web/package.json`, root lockfile, and
    resolved Playwright version.
  - Option C: Store browser metadata as a CI artifact for debugging while continuing to use
    the cache for reuse.

  ### Diagnostics to add
  - Log the computed cache key and restore key family.
  - Log whether restore was exact or fallback.
  - Capture `playwright --version` and the browser install target path.
  - Upload a small diagnostics artifact on cache miss or failure containing: Playwright
    version, cache key inputs, resolved browser path, install step outcome.

  ### Guardrails
  - Do not assume "cache exists" means "browser revision matches."
  - Do not make cache keys so broad that stale browsers can be silently reused.
  - Do not optimize installation cost at the expense of determinism.

  ### Current known CI state
  - `PLAYWRIGHT_BROWSERS_PATH` is set to `${{ github.workspace }}/.cache/ms-playwright`.
  - `e2e:web` job uses `actions/cache@v4` for that path.
  - Cache key: `${{ runner.os }}-playwright-${{ hashFiles('pnpm-lock.yaml') }}` with a broad
    restore key fallback.
  - Browsers installed only on cache miss via
    `pnpm --filter web exec playwright install --with-deps`.

- **Blockers:** None currently identified.

- **Dependencies:** None (independent of Stage 1).

- **Completion Criteria:**
  - At least several consecutive PR runs show expected cache reuse when browser revision
    inputs have not changed.
  - Cold installs are explainable from logs or artifacts.
  - E2E job duration becomes more stable.
  - A maintainer can look at one failed or slow CI run and determine why browsers were
    reinstalled.

- **Suggested Commit Message:**

  ```
  chore(ci): improve Playwright browser cache key and add diagnostics step

  Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
  ```

---

# Final Verification

- `.github/dependabot.yml` is valid and no Dependabot PRs open for Expo/RN/Next/Prisma.
- Playwright cache reuse is observable and measurable across consecutive CI runs.
- Cold browser installs leave enough evidence in logs or artifacts to diagnose.
- E2E duration in CI is stable.
- No regressions to `pnpm test` or `pnpm test:e2e`.

---

# Plan Completion

- Both stages are complete.
- Playwright cache improvement validated over several PR runs.
- Policy documented in `docs/dev-ops.md` (Dependabot ignore rationale, Playwright cache
  behavior, required validation for dependency PRs).
- Plan status updated to `Completed`.
- Plan archived to `.agents/plans/completed/`.
