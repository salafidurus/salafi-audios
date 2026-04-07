# Repo Documentation And Comment Policy Plan

## Goal

Create a repo-wide plan to improve:

1. inline code comments where they materially reduce ambiguity,
2. file-level documentation where a file’s purpose is not obvious from structure alone,
3. `README.md` coverage for workspaces or subtrees that need operating context,
4. documentation expectations in `AGENT.md` files where policy should be explicit.

This is a planning document only. It does not prescribe immediate code edits.

## Current State

### README coverage

Current `README.md` files found:

- [`README.md`](C:/dev/salafi-audios/README.md)
- [`docs/README.md`](C:/dev/salafi-audios/docs/README.md)
- [`apps/api/README.md`](C:/dev/salafi-audios/apps/api/README.md)
- [`apps/mobile/README.md`](C:/dev/salafi-audios/apps/mobile/README.md)
- [`apps/web/README.md`](C:/dev/salafi-audios/apps/web/README.md)
- [`packages/util-ingest/README.md`](C:/dev/salafi-audios/packages/util-ingest/README.md)
- [`packages/util-ingest/content/audio/README.md`](C:/dev/salafi-audios/packages/util-ingest/content/audio/README.md)

Observed gap:

- Most `packages/*` workspaces do not have `README.md` files.
- `apps/livestreams` does not currently appear to have a `README.md`.
- Repo structure is broad enough that relying only on root docs and scattered `AGENT.md` files creates onboarding and maintenance gaps.

### Policy coverage

Current root guidance in [`AGENT.md`](C:/dev/salafi-audios/AGENT.md):

- strongly covers architecture, testing, CI, generated code, alias file policy, and safety rules,
- does not currently define a clear documentation policy for:
  - when to add inline comments,
  - when a workspace should have a `README.md`,
  - when a file deserves a file-header or module overview,
  - when docs must be updated as part of implementation work beyond broad architecture changes.

Interpretation:

- The repo has operating rules, but not enough documentation authoring rules.
- That leads to uneven commenting and uneven local documentation.

## Problem Statement

The repo is large enough that “self-documenting code only” is not a sufficient default.

Current risks:

1. new contributors cannot quickly infer workspace responsibilities,
2. package entrypoints and cross-platform structure are understandable only after reading multiple files,
3. critical implementation context can remain implicit in complex modules,
4. docs drift is easy because there is no clear standard for what must be documented and where.

We need a durable documentation policy that improves maintainability without turning the repo into comment noise.

## Desired End State

### Inline comments

- Comments exist where code intent, invariants, or non-obvious tradeoffs are not obvious from the code alone.
- Comments do not restate syntax or trivial operations.
- Complex business rules, CI workarounds, cache keys, platform splits, and generated-code boundaries are documented close to the code.

### File-level documentation

- Files with non-obvious ownership, side effects, or architecture role contain a short top-level explanation when useful.
- This is especially relevant for:
  - CI workflows
  - scripts
  - config files
  - generated-code boundary files
  - cross-platform entrypoints

### README coverage

- Every app and every materially independent package either:
  - has a small local `README.md`, or
  - is explicitly covered by a higher-level README with no ambiguity.

### AGENT.md policy

- Root and workspace `AGENT.md` files define documentation expectations clearly enough that future changes preserve the standard.

## Documentation Principles

### Principle 1: Comments explain intent, not mechanics

Good comment targets:

- why a workaround exists,
- why a build setting differs from normal expectation,
- why a package exports from `src` instead of `dist`,
- why a hook must remain client-only,
- why a cache key uses a specific input,
- why a boundary exists between packages/apps.

Bad comment targets:

- describing obvious JSX structure,
- repeating variable names in prose,
- narrating trivial assignment or control flow.

### Principle 2: READMEs explain operational context

A local `README.md` should answer:

1. what this workspace owns,
2. what it depends on conceptually,
3. what the main commands are,
4. what the risky or non-obvious constraints are,
5. where authoritative deeper docs live.

### Principle 3: AGENT.md sets policy, README.md explains usage

- `AGENT.md` should define contributor and agent behavior rules.
- `README.md` should explain structure, purpose, and operational guidance for humans.
- These should not duplicate each other verbatim.

## Workstreams

## Workstream 1: Repo-Wide Documentation Inventory

### Objective

Identify which parts of the repo lack enough local guidance.

### Tasks

1. Inventory every app and package workspace.
2. Mark whether each has:
   - `README.md`
   - `AGENT.md`
   - obvious entrypoints
   - non-obvious config or architecture
3. Score each workspace for documentation risk:
   - low
   - moderate
   - high

### Likely high-priority candidates

- `apps/livestreams`
- `packages/core-*`
- `packages/domain-*`
- `packages/feature-*`
- `packages/shared`
- `packages/util-config`

### Deliverable

A matrix of workspaces and missing documentation surfaces.

## Workstream 2: README Coverage Policy

### Objective

Define where a `README.md` is required.

### Proposed rule

A workspace-level `README.md` is required when any of the following is true:

1. the workspace is directly executable or deployable,
2. the workspace has its own build/test/runtime expectations,
3. the workspace exposes a public internal API used by multiple other workspaces,
4. the workspace has platform-specific entrypoints,
5. the workspace contains non-obvious codegen, caching, CI, or build constraints.

### Minimum README template

Each required workspace README should include:

1. Purpose
2. Ownership / boundaries
3. Entrypoints or major folders
4. Key commands
5. Known constraints
6. Related docs

### Non-goal

Do not create README files for tiny leaf directories unless they truly carry independent operational meaning.

## Workstream 3: Inline Comment Policy

### Objective

Define consistent standards for when code comments are expected.

### Proposed required-comment zones

Comments should be expected in files that contain:

1. CI cache logic or workflow conditionals
2. unusual TypeScript/build configuration
3. source-vs-dist export map decisions
4. platform-specific entrypoint indirection
5. generated-code constraints
6. backend authority/security invariants
7. offline/outbox semantics
8. non-obvious query/cache invalidation behavior
9. migration or compatibility shims

### Proposed discouraged-comment zones

Comments should usually not be added to:

1. straightforward presentational components
2. simple DTO/type definitions
3. obvious utility functions
4. boilerplate config that mirrors defaults with no repo-specific reasoning

## Workstream 4: File-Level Documentation Policy

### Objective

Define when a file should carry a short module overview at the top.

### Candidate file types

1. `.github/workflows/*.yml`
2. `scripts/*`
3. `turbo.json`
4. root `package.json` if script behavior is non-obvious
5. complex `tsconfig.*`
6. package root entrypoints where platform selection is subtle
7. files that intentionally encode repo-wide conventions

### Format guidance

- Keep file-level notes short.
- Prefer 1-4 lines near the top.
- Explain purpose and constraint, not history or changelog.

## Workstream 5: AGENT.md Documentation Policy

### Objective

Extend `AGENT.md` instructions so documentation upkeep becomes part of normal development discipline.

### Root `AGENT.md` additions to plan

Add a section that covers:

1. when to add or update workspace `README.md`,
2. when inline comments are expected,
3. when file-level documentation is expected,
4. when docs updates are mandatory for code/config changes,
5. the distinction between `AGENT.md` policy docs and `README.md` usage docs.

### Workspace `AGENT.md` additions to plan

Only add local documentation-policy notes where workspace-specific nuance matters, for example:

- API modules with strict service/controller separation
- web/mobile workspaces with route shell expectations
- packages with source-entrypoint exports and platform splits

Guardrail:

- Keep policy central at the root unless a subtree truly needs a refinement.

## Workstream 6: Prioritized README Rollout

### Objective

Roll out README improvements in a useful order.

### Phase 1 candidates

- `apps/livestreams`
- `packages/core-contracts`
- `packages/core-env`
- `packages/core-db`
- `packages/shared`
- `packages/feature-search`
- `packages/feature-navigation`

Reason:

- These workspaces either define shared contracts, infrastructure, or common cross-platform behavior that many future contributors need to understand quickly.

### Phase 2 candidates

- remaining `core-*`
- `domain-*`
- remaining `feature-*`
- `util-config`

### Phase 3 candidates

- select nested directories that carry standalone operational meaning, if any are identified by inventory.

## Workstream 7: Comment And Documentation Review Pass

### Objective

Run a repo-wide improvement pass without adding low-value noise.

### Strategy

1. Review high-risk files first.
2. Add comments only where intent is currently implicit.
3. Prefer fewer, sharper comments over dense annotation.
4. Validate that comments do not simply duplicate code.
5. Update READMEs and AGENT policies in the same wave where practical.

### Review targets

- CI workflows
- root scripts
- root config files
- package export maps
- build and cache scripts
- complex data-fetching or synchronization modules

## Workstream 8: Documentation Quality Checks

### Objective

Decide whether lightweight enforcement should exist.

### Options to evaluate

1. Keep enforcement manual and policy-based only.
2. Add a low-friction docs audit checklist to PR review guidance.
3. Add a script that reports missing workspace `README.md` files for required workspaces.

### Recommendation

Start with policy and inventory first.

Do not add aggressive linting for comment density or blanket README requirements until the desired standard is clearer.

## Recommended Rollout Order

1. Inventory workspaces and classify documentation risk.
2. Define root documentation policy in `AGENT.md`.
3. Establish README coverage rules and minimum template.
4. Add or improve README files in highest-value workspaces first.
5. Run a focused inline-comment pass on high-risk config and infrastructure files.
6. Reassess whether any lightweight documentation audit tooling is worth adding.

## Success Criteria

1. Every major app and shared package has discoverable local context.
2. Complex build, CI, caching, export, and platform-boundary files are no longer relying on tribal knowledge.
3. Root `AGENT.md` clearly states documentation expectations.
4. Contributors can tell where to put policy docs versus operational docs.
5. The repo gains clarity without accumulating comment spam.

## Risks

1. Over-documenting can create noise and maintenance burden.
2. Duplicating README, docs, and AGENT content can create drift.
3. Blanket requirements may force low-value files into existence.
4. Commenting too late in the process can turn into a mechanical sweep rather than targeted clarity improvements.

## Explicit Non-Goals

- Do not require header comments on every source file.
- Do not require README files for every folder in the repo.
- Do not treat comment count as a quality metric.
- Do not duplicate architectural docs from `docs/` into every workspace README.

## Deliverables

1. Repo documentation inventory
2. Root documentation policy update plan for `AGENT.md`
3. Workspace README coverage plan
4. Targeted inline-comment improvement plan for high-risk files
5. Optional lightweight documentation audit approach, if justified after inventory
