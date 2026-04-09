# Repo Documentation and Comment Policy Plan

# Metadata

- **Date:** 2026-04-07
- **Status:** In Progress
- **Scope:** Improve README coverage across all packages, define and enforce an inline comment
  policy, and extend `AGENT.md` files with explicit documentation expectations.
- **Summary:** Some package READMEs exist (core-api, core-contracts, core-db, design-tokens,
  domain-playback, domain-progress, domain-search, util-ingest). Several packages still lack
  READMEs (core-i18n, domain-account, domain-content, domain-live, util-config). Comment
  policy and AGENT.md documentation guidance are not yet defined.
- **Dependencies:** None external.

---

# Progress

## Done

- READMEs exist for: `packages/core-api`, `packages/core-contracts`, `packages/core-db`,
  `packages/design-tokens`, `packages/domain-playback`, `packages/domain-progress`,
  `packages/domain-search`, `packages/util-ingest`.
- App-level READMEs exist for: `apps/api`, `apps/mobile`, `apps/web`.
- Root `README.md` and `docs/README.md` exist.

## Blocked

- None currently identified.

## Immediate Next Step

- Stage 1: add missing README files to `packages/core-i18n`, `packages/domain-account`,
  `packages/domain-content`, `packages/domain-live`, and `packages/util-config`.

---

# Staging Strategy

1. Stage 1: Add README files to packages that are missing them.
2. Stage 2: Document comment and documentation policy in AGENT.md files.
3. Stage 3: Verify and update inline comment coverage in complex modules.

---

## Stage 1: Add README to Packages Missing Them

- **Status:** Pending

- **Goal:** Create a minimal, useful `README.md` for each package that currently lacks one.
  Each README must answer: what the workspace owns, what it depends on conceptually, key
  commands, and known constraints or non-obvious rules.

- **Files:**
  - `packages/core-i18n/README.md` — create
  - `packages/domain-account/README.md` — create
  - `packages/domain-content/README.md` — create
  - `packages/domain-live/README.md` — create
  - `packages/util-config/README.md` — create

- **Changes:**

  Each README must include these sections at minimum:
  1. **Purpose** — what this workspace owns and why it exists.
  2. **Ownership / Boundaries** — what it does and does not contain; which other workspaces
     consume it.
  3. **Entrypoints or Major Folders** — the main export or folder structure.
  4. **Key Commands** — typecheck, test, build (where applicable).
  5. **Known Constraints** — non-obvious rules, platform limits, or architectural invariants.
  6. **Related Docs** — links to authoritative deeper docs in `docs/`.

  Specific notes per package:
  - `core-i18n`: document i18n keys structure, locale coverage, and how apps import
    translations.
  - `domain-account`: document user profile and auth state hooks, Zustand store shape, and
    which apps consume this package.
  - `domain-content`: document lectures, scholars, series, feed, and library data hooks;
    Zustand store or React Query usage; which apps consume this.
  - `domain-live`: document live session and channel hooks; note this package was created
    as part of the monorepo restructure.
  - `util-config`: document the shared lint/build config role — ESLint configs, TypeScript
    base configs, and any other shared tooling configs housed here.

- **Blockers:** None currently identified.

- **Dependencies:** None.

- **Completion Criteria:**
  - `packages/core-i18n/README.md` exists and covers all six required sections.
  - `packages/domain-account/README.md` exists and covers all six required sections.
  - `packages/domain-content/README.md` exists and covers all six required sections.
  - `packages/domain-live/README.md` exists and covers all six required sections.
  - `packages/util-config/README.md` exists and covers all six required sections.

- **Suggested Commit Message:**

  ```
  docs(packages): add README files to core-i18n, domain-account, domain-content,
  domain-live, and util-config

  Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
  ```

---

## Stage 2: Document Policy in AGENT.md Files

- **Status:** Pending

- **Goal:** Add a clear documentation policy section to the root `AGENT.md` so that future
  contributors and agents know when to add README files, when to add inline comments, and
  when to add file-level documentation.

- **Files:**
  - `AGENT.md` (root) — add documentation policy section
  - Workspace `AGENT.md` files where workspace-specific nuance requires it (API, web, mobile)

- **Changes:**

  Root `AGENT.md` additions:
  1. **When to add or update a workspace README.md** — required when the workspace is
     executable/deployable, has its own build/test/runtime expectations, exposes a public
     internal API used by multiple workspaces, has platform-specific entrypoints, or contains
     non-obvious codegen, caching, CI, or build constraints.
  2. **When inline comments are expected** — CI cache logic, unusual TypeScript/build
     configuration, source-vs-dist export map decisions, platform-specific entrypoint
     indirection, generated-code constraints, backend authority/security invariants,
     offline/outbox semantics, non-obvious query/cache invalidation behavior, migration shims.
  3. **When inline comments are discouraged** — straightforward presentational components,
     simple DTO/type definitions, obvious utility functions, boilerplate config that mirrors
     defaults with no repo-specific reasoning.
  4. **When file-level documentation is expected** — CI workflows, scripts, complex tsconfigs,
     package root entrypoints with platform selection logic.
  5. **When docs updates are mandatory** — any architectural boundary change, API surface
     change, mobile offline pattern change, or web structure change.
  6. **AGENT.md vs README.md distinction** — `AGENT.md` defines contributor and agent behavior
     rules; `README.md` explains structure, purpose, and operational guidance for humans.

  Workspace `AGENT.md` additions (only where workspace-specific nuance matters):
  - API: note service/controller separation documentation expectations.
  - Web/Mobile: note route shell documentation expectations.

- **Blockers:** None currently identified.

- **Dependencies:** Stage 1 should be complete so the policy is grounded in the actual README
  coverage that exists.

- **Completion Criteria:**
  - Root `AGENT.md` contains a documentation policy section covering all six points above.
  - Policy clearly distinguishes AGENT.md from README.md purpose.
  - No duplication of architectural docs from `docs/` into workspace READMEs.

- **Suggested Commit Message:**

  ```
  docs(agent): add documentation policy section — when to add READMEs and comments

  Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
  ```

---

## Stage 3: Verify and Update Inline Comment Coverage in Complex Modules

- **Status:** Pending

- **Goal:** Run a focused review pass on high-risk files and add inline comments only where
  intent is currently implicit. Prefer fewer, sharper comments over dense annotation.

- **Files:**
  - `.github/workflows/ci.yml`
  - `turbo.json`
  - Root `scripts/*`
  - `packages/util-config/tsconfig/*.json` (complex configs)
  - Package root entrypoints where platform selection is subtle
  - Complex data-fetching or synchronization modules in domain packages
  - `apps/api/src/` modules with non-obvious authority or security invariants

- **Changes:**

  For each high-risk file:
  1. Review for implicit intent, non-obvious tradeoffs, or undocumented invariants.
  2. Add short comments explaining _why_ — not _what_.
  3. Do not add comments that restate syntax or trivial operations.
  4. Do not add header comments to every file — only where purpose is genuinely non-obvious
     from the file name and structure.

  Required comment zones (per policy defined in Stage 2):
  - CI cache key inputs and invalidation logic.
  - Unusual TypeScript or build configuration flags.
  - Source-vs-dist export map decisions.
  - Platform-specific entrypoint indirection.
  - Generated-code constraint boundaries.
  - Backend authority and security invariants.
  - Offline/outbox state transition semantics.
  - Non-obvious query or cache invalidation behavior.

- **Blockers:** None currently identified.

- **Dependencies:** Stage 2 must be complete so the comment policy is codified before the
  review pass begins.

- **Completion Criteria:**
  - Every targeted file either has appropriate intent comments or has been reviewed and
    confirmed to need none.
  - `pnpm lint` passes with no new violations.
  - No comment-only changes break `pnpm typecheck` or `pnpm build`.

- **Suggested Commit Message:**

  ```
  docs(inline): add intent comments to CI, tsconfig, and complex domain modules

  Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
  ```

---

# Final Verification

- All five missing package READMEs exist and cover the six required sections.
- Root `AGENT.md` contains a clear documentation policy section.
- `pnpm lint` passes with no new violations.
- No README files duplicate content that belongs in `docs/`.
- No inline comments restate syntax or trivial operations.
- Contributors can determine from `AGENT.md` when to add policy docs vs. operational docs.

---

# Plan Completion

- All three stages are complete.
- Final verification passes.
- Plan status updated to `Completed`.
- Plan archived to `.agents/plans/completed/`.

---

## Background Context

### Documentation Principles

**Comments explain intent, not mechanics.** Good targets: why a workaround exists, why a
build setting differs from normal expectation, why a package exports from `src` instead of
`dist`, why a cache key uses a specific input, why a boundary exists between packages/apps.

**READMEs explain operational context.** A local README should answer: what this workspace
owns, what it depends on, main commands, risky constraints, and where deeper docs live.

**AGENT.md sets policy; README.md explains usage.** These must not duplicate each other
verbatim.

### Current README Coverage

Has README:

- `packages/core-api`
- `packages/core-contracts`
- `packages/core-db`
- `packages/design-tokens`
- `packages/domain-playback`
- `packages/domain-progress`
- `packages/domain-search`
- `packages/util-ingest`

Missing README (to be addressed in Stage 1):

- `packages/core-i18n`
- `packages/domain-account`
- `packages/domain-content`
- `packages/domain-live`
- `packages/util-config`

### Explicit Non-Goals

- Do not require header comments on every source file.
- Do not require README files for every folder in the repo.
- Do not treat comment count as a quality metric.
- Do not duplicate architectural docs from `docs/` into every workspace README.
