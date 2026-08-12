---
name: project-guardrails
description: |
  NON-NEGOTIABLE architectural rules for Salafi Durus. LOAD THIS SKILL when: starting any
  implementation, modifying backend/API, changing data models, working with auth, handling
  offline/sync, working in a worktree, creating new files, or any code changes. Contains
  critical guardrails that must never be violated.
---

# Project Guardrails

These rules are NON-NEGOTIABLE. Violations will be rejected.

## Mandatory Pre-Work Checks

- **Before implementing ANY change**, read the **workspace-specific AGENT.md** file in the directory you're modifying (e.g., `apps/api/AGENT.md`, `apps/web/AGENT.md`, `apps/native/AGENT.md`, `packages/*/AGENT.md`). These contain critical workspace rules, quality expectations, and command references specific to that package.
- **Consult relevant documentation** from `docs/` as indicated in the table below before starting work on that topic.

## Documentation Quick Reference

| If working on...                                  | Read this file first   |
| ------------------------------------------------- | ---------------------- |
| Getting started / overall system                  | `docs/README.md`                                      |
| Product vision, philosophy, and guardrails        | `docs/product/requirements.md`                        |
| Monorepo layout, dependencies, package boundaries | `docs/architecture.md`                                |
| Backend architecture, API design, and auth        | `docs/backend/api.md` and `docs/security/authentication.md` |
| Database schemas, Prisma, and media management    | `docs/data/database.md`                               |
| Mobile app structure and offline synchronization  | `docs/clients/mobile.md`                              |
| Web app structure and SEO strategy                | `docs/clients/web.md`                                 |
| Admin roles and scoped grants                     | `docs/administration/access-management.md`            |
| Environments, configuration, and CI/CD            | `docs/policies/deployment.md`                         |
| Operational procedures                            | `docs/runbooks/README.md`                             |
| Current roadmap and phase progress                | `docs/AGENT.md`                                       |

## Referenced Rules

These `.agents/rules/` files contain always-on behavioral rules that complement these guardrails:

| Rule file            | What it covers                                                  |
| -------------------- | --------------------------------------------------------------- |
| `worktree-rules.md`  | Git worktree creation, env copy, pre-work verification, cleanup |
| `tdd-rules.md`       | Strict TDD workflow: red → green → commit                       |
| `rtk-rules.md`       | CLI token optimization via RTK                                  |
| `codegraph-rules.md` | Structural code search via CodeGraph                            |

## Git Discipline

- Never use `git --no-verify`. If a hook fails, fix the underlying problem — do not circumvent it.

## Backend Authority

- Backend (`apps/api`) is the SINGLE SOURCE OF TRUTH for all business rules.
- Authorization is enforced EXCLUSIVELY on the backend.
- UI/client restrictions are UX only, NEVER security.
- If business rules appear in mobile/web clients, the implementation is WRONG.

## Monorepo Boundaries (Feature-Sliced Architecture)

```
apps/      → deployable applications (api, web, mobile)
packages/  → shared libraries (shared, core, feature, contracts, db)
docs/      → authoritative documentation
```

### Package Map

- **`@sd/core-*`**: Foundational infrastructure (auth, api, config, styles, i18n, env, db, contracts).
- **`@sd/domain-content`**: Data hooks for listings, scholars, topics, feed, and library.
- **`@sd/domain-audio`**: Shared playback, track resolution, and progress behavior.
- **`@sd/domain-account`**: Data hooks for user profile and auth state.
- **`@sd/domain-search`**: Search and quick-browse hooks.
- **`@sd/design-tokens`**: Design tokens — authoritative source.
- **`@sd/utils-error`**: Shared error utilities.

**Dependency rules:**

- `apps/*` → `packages/*` ✓
- `packages/*` → `packages/*` ✓
- `apps/*` → `apps/*` ✗ FORBIDDEN
- `packages/*` → `apps/*` ✗ FORBIDDEN
- Circular dependencies ✗ FORBIDDEN

## App Structure

### Mobile (`apps/native/src/`)

- **`app/`**: Routing ONLY — Expo Router. Imports screen components from `../features` or `../shared`.
- **`features/<name>/`**: One folder per feature. Contains `components/`, `hooks/`, `screens/`, `utils/`.
- **`shared/`**: Primitives used across 2+ features within the mobile app.
- **`core/`**: Platform bootstrap (providers, config, auth).

### Web (`apps/web/src/`)

- **`app/`**: Routing, layouts, and server components ONLY — Next.js App Router.
- **`features/<name>/`**: One folder per feature.
- **`shared/`**: Primitives used across 2+ features within the web app.
- **`core/`**: Platform bootstrap (providers, env, auth, styles).

### Backend (`apps/api/src/`)

- **Interface**: Controllers, DTOs, Auth guards.
- **Application**: Use-case orchestration, transactions.
- **Domain**: Invariants, transition rules.
- **Infrastructure**: DB, media, adapters (no policy).

## Offline Rules (Mobile)

- Clients record INTENT, not authority.
- Offline writes use OUTBOX pattern.
- Backend resolves conflicts deterministically.
- Offline mode NEVER enables admin actions.

## Data & Media

- Primary DB stores authoritative relational state ONLY.
- Media = references/metadata, NEVER blobs in DB.
- All uploads use **Presigned URLs** coordinated by the backend.

## API Contract

- `@sd/core-contracts` is the source of truth for all API interactions.
- Update types manually in `packages/core-contracts/src/types/` when backend response shapes change.

## Design Token Usage

Use tokens by **semantic role** from `packages/design-tokens`. Full reference in `packages/design-tokens/AGENT.md`.

## TDD

Strict TDD is required. See `.agents/rules/tdd-rules.md` for the full workflow.

## Agent Worktree Enforcement

- All AI agents must work inside a git worktree. See `.agents/rules/worktree-rules.md`.
- Agents must either create a new worktree in the `.worktrees` folder, or ask the user if they should use one of the available worktrees or create a new one.

## Quick Commands

```bash
bun run dev              # All apps (api, web, native)
bun run dev:api          # Backend only
bun run dev:web          # Web only
bun run dev:native       # Native only
bun run build            # Build all
bun run lint             # Lint all
bun run typecheck        # Typecheck all
bun run test             # Test all
bun run format           # Format codebase
```
