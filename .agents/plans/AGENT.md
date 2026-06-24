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

## Monorepo Rules

See root `AGENT.md` for architectural guardrails, TDD policy, commit format, and package boundaries.

## Editing Discipline

Keep plans concise but execution-specific. No scratch notes or raw logs. Follow markdownlint Markdown style.

## Completion And Archival

- A plan is `Completed` only when every stage is done and the final verification and plan completion criteria are satisfied.
- Once a plan is fully completed, move it to `.agents/plans/completed/`.
- Before moving it, update the metadata status to `Completed`.
- Do not permanently delete completed plans unless explicitly instructed.
- If work stops before completion, mark the plan as `Blocked`, `Superseded`, or `Cancelled` and explain why in the metadata or progress section.
