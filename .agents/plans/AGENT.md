# AGENT.md — `.agents/plans/`

## Purpose

This folder stores working implementation plans for the Salafi Durus monorepo. Plans are
operational documents for agents and humans before direct code changes are made. They capture
scope, staging, blockers, and completion criteria so work can be executed incrementally and
reviewed independently.

## File Naming

- Every plan file must begin with the current date in `YYYY-MM-DD` format.
- After the date, add a short hyphenated description of the task.
- Use lowercase words consistently; keep the filename short and readable.
- Example: `2026-04-08-monorepo-restructure-plan.md`

## Required Plan Structure

Each plan must contain these sections in this order:

### 1. `# Metadata`

Include:

- `Date`
- `Status`: `Planned`, `In Progress`, `Blocked`, `Superseded`, `Cancelled`, or `Completed`
- `Scope`
- `Summary`
- `Dependencies` — if the plan relies on another plan, an architectural decision, or an
  external blocker

### 2. `# Progress`

- Record what has already been done.
- Record what is currently blocked, uncertain, or still under review.
- Record the immediate next step.

### 3. `# Staging Strategy`

- Break implementation into explicit stages.
- Stages must be ordered and written so the work can be executed incrementally.
- Prefer dependency order: foundational changes first, downstream alignment second, consistency and verification pass last.
- Each stage should be small enough to complete, review, and commit independently.

### 4. Stage sections

Each stage must have its own heading, for example:

- `## Stage 1: Add Zod env validation to API`
- `## Stage 2: Update domain package exports`

Each stage must contain all of the following:

- `Status`
- `Goal`
- `Files`
- `Changes`
- `Blockers`
- `Dependencies`
- `Completion Criteria`
- `Suggested Commit Message`

Rules:

- `Blockers` must be explicit. If there are no known blockers, write `None currently identified.`
- `Dependencies` must state whether the stage depends on earlier decisions or completed stages.
- `Completion Criteria` must be testable and specific — state which commands must pass.
- `Suggested Commit Message` must be a real commit message usable if the stage is committed separately. Follow Conventional Commits; lines must not exceed 100 characters.

### 5. `# Final Verification`

Define the checks that must happen after the last implementation stage. Examples:

- `pnpm typecheck` passes across all workspaces
- `pnpm test` passes with no regressions
- `pnpm lint` passes with no new violations
- `pnpm build` succeeds for all affected apps and packages
- Manual smoke test of affected UI flows (if applicable)
- No `@sd/<dissolved-package>` imports remaining in source

### 6. `# Plan Completion`

- Define what must be true before the entire plan can be marked `Completed`.
- State the final archival action for the plan.

## Stage Design Rules

- Stages must identify blockers clearly.
- If a blocker prevents execution, update the plan and stop that stage instead of silently working around it.
- If a later stage depends on an unresolved architectural decision, state that dependency explicitly.
- If a stage must be split into smaller stages during execution, update the plan before continuing.
- Prefer one logical commit per completed stage unless the work is too small to justify it.

## Update Rules

- Update the plan whenever material progress is made.
- Do not leave plans as one-time notes; they should reflect the current state of the work.
- If scope changes, update both the metadata summary and the affected plan sections.
- If a plan is superseded, mark it clearly in the metadata instead of silently abandoning it.
- When a stage is completed, update:
  - the stage `Status`,
  - the `# Progress` section,
  - any downstream `Blockers` or `Dependencies` affected by that completion.
- When a stage is committed, record the actual commit hash if available, or note that the
  commit is pending.
- Before committing any completed implementation stage, run the validation required by that
  stage's `Completion Criteria`.
- For stages that affect shared packages or cross-app contracts, prefer running
  `pnpm typecheck` and `pnpm test` across the full monorepo before committing.

## Monorepo-Specific Guidance

### Architectural guardrails (non-negotiable)

- Read `AGENT.md` in each workspace you are modifying before making changes.
- Read the relevant `docs/*.md` file for the area of work (see the quick-reference table in
  the root `AGENT.md`).
- Backend (`apps/api`) is the single source of truth for all business rules and auth.
- No `apps/*` → `apps/*` imports. No `packages/*` → `apps/*` imports.
- No circular dependencies between packages.

### TDD rule (applies to every implementation stage)

Every implementation stage that adds or changes behaviour must follow Red → Green → Commit:

1. Write the failing test first.
2. Run it — confirm it fails with the expected error, not a setup error.
3. Write the minimal implementation to make it pass.
4. Run it again — confirm it passes.
5. Run all tests in the workspace — confirm nothing else broke.
6. Commit test and implementation together.

The only exceptions: presentational-only components with no logic, framework DI wiring,
generated artifacts, and third-party library internals.

### Validation commands

```bash
pnpm typecheck                          # full monorepo typecheck
pnpm --filter <workspace> typecheck     # single workspace
pnpm test                               # all tests
pnpm --filter <workspace> test          # single workspace
pnpm lint                               # all linting
pnpm build                              # full build
pnpm test:e2e                           # Playwright E2E (web only)
```

### Commit message rules

- Follow Conventional Commits: `type(scope): description`
- Lines must not exceed 100 characters
- Always include `Co-authored-by` trailers for every agent/model that made a material
  contribution to the task.
- Multiple co-authors are allowed and expected when multiple agents/models contributed;
  add one trailer line per contributor.
- If Copilot contributed, include:
  `Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>`

### Package boundary conventions

- `apps/web/src/core/` — web bootstrap (providers, styles, config, auth)
- `apps/mobile/src/core/` — mobile bootstrap (providers, styles, config, auth)
- `apps/web/src/features/<name>/` — web feature UI (components, hooks, screens, utils)
- `apps/mobile/src/features/<name>/` — mobile feature UI
- `apps/web/src/shared/` — primitives used across 2+ web features
- `apps/mobile/src/shared/` — primitives used across 2+ mobile features
- `packages/domain-*` — shared reactive state and data hooks (no UI)
- `packages/core-*` — truly shared infrastructure only (core-db, core-api, core-contracts,
  core-i18n)

### When to update docs alongside code

- If an architectural boundary changes → update `docs/architecture.md`
- If the API surface changes → update `docs/api.md` and `packages/core-contracts`
- If the mobile offline pattern changes → update `docs/mobile.md`
- If the web structure changes → update `docs/web.md`
- Always update the relevant `AGENT.md` file in the workspace being modified

## Editing Discipline

- Use plans in this folder before making substantial structural changes to the codebase.
- Keep plans concise but specific enough that another agent can execute them without re-discovering the scope.
- Do not store scratch notes, raw logs, or large code dumps here unless directly needed for execution.
- Plan files must follow markdownlint-style Markdown: consistent heading structure, blank lines around lists and headings, no malformed nested lists.

## Completion And Archival

- A plan is `Completed` only when every stage is done and the final verification and plan completion criteria are satisfied.
- Once a plan is fully completed, move it to `.agents/plans/completed/`.
- Before moving it, update the metadata status to `Completed`.
- Do not permanently delete completed plans unless explicitly instructed.
- If work stops before completion, mark the plan as `Blocked`, `Superseded`, or `Cancelled` and explain why in the metadata or progress section.
