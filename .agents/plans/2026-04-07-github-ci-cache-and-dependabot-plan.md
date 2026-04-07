# GitHub CI Cache And Dependabot Plan

## Goal

Create a durable plan for two related repository-maintenance improvements:

1. Make Playwright browser provisioning in GitHub Actions more reliable and less wasteful, so CI does not repeatedly redownload browsers when nothing relevant changed.
2. Add Dependabot to this monorepo with strict safeguards for Expo, React Native, Next.js, Turborepo, Prisma, and other coupled infrastructure so dependency PRs are reviewable and do not create unsafe churn.

This plan is intentionally implementation-free. It defines the rollout, decision points, and validation criteria.

## Current State

### CI workflow observations

Current file:

- [`.github/workflows/ci.yml`](C:/dev/salafi-audios/.github/workflows/ci.yml)

Relevant facts:

- CI sets `PLAYWRIGHT_BROWSERS_PATH` to `${{ github.workspace }}/.cache/ms-playwright`.
- The `e2e:web` job uses `actions/cache@v4` for that path.
- The cache key is `${{ runner.os }}-playwright-${{ hashFiles('pnpm-lock.yaml') }}` with a broad restore key fallback.
- Browsers are installed only on cache miss via `pnpm --filter web exec playwright install --with-deps`.
- The workflow does not currently capture cache diagnostics, browser version metadata, or install reason artifacts.
- The workflow also does not use a dedicated setup action that manages browser cache semantics directly.

Interpretation:

- The repo already has a first-pass browser cache, but it is keyed in a way that may be too coarse for cache reuse analysis and too opaque for troubleshooting.
- If cache misses are frequent, the likely causes are one or more of:
  - Playwright browser revision changes more often than expected.
  - the cache key is invalidated by unrelated lockfile churn.
  - the cache path contents differ across jobs or runners.
  - GitHub cache restore behavior is not transparent enough to debug from current logs.

### Dependency automation observations

Current state:

- [`.github/dependabot.yml`](C:/dev/salafi-audios/.github/dependabot.yml) does not exist.

Repo constraints that matter:

- This is a PNPM + Turborepo monorepo.
- It contains Expo/mobile, Next/web, Nest/api, Prisma, Playwright, and shared TypeScript packages.
- Several packages intentionally use source-entrypoint exports and platform-specific peer dependency patterns.
- Some upgrades must remain coordinated across the repo rather than treated as isolated package bumps.

Interpretation:

- A generic Dependabot config would be too risky.
- Expo and React Native related dependencies cannot be treated like ordinary npm patch/minor updates.
- Workspace-wide version coupling means grouping and ignore rules are part of correctness, not convenience.

## Problem Statement

We need CI behavior that is predictable locally and in PRs:

- If Playwright browsers are already available for the relevant revision, CI should reuse them instead of paying install cost repeatedly.
- If they are not reusable, CI should make the reason obvious from logs or artifacts.
- If Dependabot is enabled, it must create low-noise, high-signal PRs that align with monorepo boundaries and platform coupling rules.
- Expo- and React Native-managed updates must not bypass SDK alignment discipline.

## Desired End State

### Playwright caching

- Browser cache reuse is observable and measurable.
- Cache invalidation is tied to the browser revision actually needed by the repo, not arbitrary unrelated dependency churn where possible.
- Failing or cold-start installs leave enough evidence in workflow artifacts/logs to diagnose why reuse did not happen.
- CI setup remains simple enough for maintainers to understand.

### Dependabot

- Dependabot is enabled with conservative scope and clear ignore rules.
- Monorepo grouping avoids PR spam while preserving reviewable change sets.
- Expo/React Native/Next/Turbo/Prisma risk areas are explicitly protected.
- Dependency automation does not create “looks safe but actually coupled” PRs.
- The policy is documented so reviewers know what can be merged directly and what requires coordinated manual upgrade work.

## Workstreams

## Workstream 1: Playwright Browser Cache Investigation

### Objective

Identify why cache reuse is poor before changing cache strategy.

### Tasks

1. Inspect the exact Playwright version and browser revision currently resolved by the web workspace.
2. Compare that revision to the current cache key inputs.
3. Confirm whether `pnpm-lock.yaml` churn is causing avoidable cache invalidation.
4. Verify whether `playwright install --with-deps` writes only under `PLAYWRIGHT_BROWSERS_PATH` or also depends on other runner state.
5. Review GitHub Actions logs across several recent runs to see whether misses correlate with dependency changes, runner changes, or workflow changes.

### Deliverable

A short findings note explaining why cache misses are happening in practice.

## Workstream 2: Playwright Cache Strategy Redesign

### Objective

Redesign caching so it is keyed by what actually matters and is debuggable.

### Candidate strategies to evaluate

1. Keep `actions/cache`, but key it from Playwright package version or browser revision metadata rather than the full lockfile.
2. Use a composite step that computes a cache key from `apps/web/package.json`, root lockfile, and resolved Playwright version.
3. Store browser metadata as an artifact on each run for debugging while continuing to use cache for reuse.
4. Consider whether GitHub-hosted Linux runners already have partial dependencies and whether `--with-deps` is necessary every time for this repo.

### Guardrails

- Do not assume “cache exists” means “browser revision matches.”
- Do not make cache keys so broad that stale browsers can be silently reused.
- Do not optimize installation cost at the expense of determinism.

### Preferred direction

The likely best direction is:

- keep browser binaries in cache,
- derive the key from the resolved Playwright browser revision or package version,
- add one lightweight diagnostics step that emits the key inputs and whether restore was exact, partial, or cold.

## Workstream 3: CI Diagnostics For Browser Setup

### Objective

Make future cache misses explain themselves.

### Planned diagnostics

1. Log the computed Playwright cache key and restore key family.
2. Log whether the restore was exact or fallback.
3. Capture `playwright --version` and the browser install target path.
4. Upload a small diagnostics artifact on failure or cache miss containing:
   - Playwright version
   - cache key inputs
   - resolved browser path
   - install step outcome

### Success criteria

- A maintainer can look at one failed or slow CI run and tell why browsers were reinstalled.

## Workstream 4: Dependabot Risk Segmentation

### Objective

Define dependency classes before enabling automation.

### Dependency classes

1. Safe-to-automate low-risk ecosystem
   - markdown tooling
   - lint-only tooling
   - small standalone dev tools
   - many GitHub Actions updates

2. Moderate-risk ecosystem
   - testing tools
   - Playwright
   - Jest
   - ESLint core stack
   - TypeScript tooling

3. High-coupling ecosystem
   - Expo
   - `expo-*`
   - `@expo/*`
   - React
   - React DOM
   - React Native
   - `react-native-*`
   - `@react-native/*`
   - Expo-adjacent testing packages
   - navigation packages tied to React Native runtime

4. Infrastructure-coupled ecosystem
   - Next.js
   - Prisma
   - Turborepo
   - NestJS core stack
   - `@tanstack/react-query`
   - packages that affect source-entrypoint build semantics or workspace resolution

### Policy outcome

- Safe and moderate-risk groups can be partially automated.
- High-coupling and infrastructure-coupled groups should default to ignore or tightly constrained review rules until a repo-specific upgrade process exists for each.

## Workstream 5: Dependabot Configuration Design

### Objective

Draft a conservative `dependabot.yml` suited to this monorepo.

### Design principles

1. Start with one root `npm` ecosystem entry for the monorepo, because the repo is workspace-managed.
2. Group low-risk patch/minor updates to reduce PR spam.
3. Keep majors ungrouped and individually reviewable.
4. Explicitly ignore Expo/React Native SDK-managed dependencies.
5. Add comments in the config explaining why those ignores exist.
6. Add a separate `github-actions` ecosystem entry with a much lower PR limit.
7. Keep `open-pull-requests-limit` conservative at first.

### Additional monorepo-specific rules to consider

1. Separate groups for:
   - dev tooling
   - test tooling
   - CI tooling
   - backend/server libs
2. Avoid grouping cross-stack upgrades that can break web and mobile simultaneously.
3. Treat `next`, `expo`, `react`, `react-native`, `prisma`, and `turbo` as manually managed dependencies unless a specific upgrade playbook exists.

## Workstream 6: Review And Merge Policy

### Objective

Prevent unsafe auto-generated dependency PRs from being merged casually.

### Policy to define

1. Which labels Dependabot PRs receive.
2. Which PRs are safe for direct maintainer merge after green CI.
3. Which PRs require manual local verification on:
   - web build
   - mobile typecheck or Expo install alignment
   - API tests
4. Which PRs must never be merged without an explicit coordinated upgrade branch.

### Special caution list

These should likely remain ignored initially:

- `expo`
- `expo-*`
- `@expo/*`
- `eslint-config-expo`
- `jest-expo`
- `react`
- `react-dom`
- `@types/react`
- `@types/react-dom`
- `react-native`
- `react-native-*`
- `@react-native/*`
- `@react-navigation/*`
- `@testing-library/react-native`

This list should be reviewed against actual repo usage before implementation.

## Workstream 7: Documentation And Operating Procedure

### Objective

Make the policy discoverable for future maintainers.

### Documentation additions to plan

1. Add a short Dependabot policy section to `docs/dev-ops.md`.
2. Document:
   - why Expo and React Native are ignored,
   - how to handle SDK-aligned updates,
   - what validation commands are required for dependency PRs,
   - how Playwright browser caching is expected to behave in CI.

## Recommended Rollout Order

1. Measure current Playwright cache misses and identify actual invalidation causes.
2. Add Playwright cache diagnostics before or together with any key redesign.
3. Redesign Playwright cache keying and validate over several PR runs.
4. Draft Dependabot config in a branch without enabling automerge or aggressive grouping.
5. Start with:
   - GitHub Actions updates
   - low-risk npm dev dependency updates
6. Observe PR volume and CI signal quality.
7. Expand only if the first wave is manageable.

## Explicit Non-Goals For The First Iteration

- Do not enable broad dependency auto-merge.
- Do not allow Dependabot to manage Expo SDK upgrades.
- Do not allow Dependabot to manage React Native version upgrades.
- Do not combine dependency automation rollout with TypeScript modernization work.
- Do not introduce multiple independent dependency bots or overlapping automation systems.

## Validation Criteria

### For Playwright caching

- At least several consecutive PR runs show expected cache reuse when browser revision inputs have not changed.
- Cold installs are explainable from logs/artifacts.
- E2E duration becomes more stable.

### For Dependabot

- Initial config produces a manageable PR volume.
- No PRs are opened for ignored Expo/React Native SDK-managed dependencies.
- Grouping keeps PRs understandable.
- Reviewers can tell from docs/config comments which PRs require manual platform validation.

## Proposed Deliverables

1. Updated CI workflow plan for Playwright browser cache behavior.
2. Cache diagnostics approach for GitHub Actions.
3. Initial conservative `.github/dependabot.yml` design.
4. Reviewer policy documentation for dependency PRs.

## Risks

1. Over-optimizing the Playwright cache key may reuse stale browser artifacts.
2. Overly broad Dependabot grouping may hide risky coupled upgrades.
3. Overly narrow grouping may create unmanageable PR noise in a monorepo.
4. Expo/React Native dependency automation can drift away from SDK-supported combinations if ignore rules are incomplete.
5. Turborepo, Next, Prisma, and TypeScript ecosystem updates can look “minor” while still affecting build/runtime invariants.

## Decision Log To Capture During Implementation

When this plan is implemented, record:

1. the final Playwright cache key inputs,
2. whether diagnostics are stored as logs, artifacts, or both,
3. the exact ignored dependency families in Dependabot,
4. which dependency groups are enabled in phase one,
5. what manual verification checklist is required for dependency PRs.
