# AGENT.md — Salafi Durus Monorepo

This repository is a single system. The monorepo is an enforcement mechanism.

## Source of truth

- Architecture + intent live in `docs/` and are authoritative.
- If code conflicts with docs, either the code is wrong or docs must be updated.

## Non-negotiable guardrails

- **Backend authority is absolute.** Clients record intent, never authority.
- **Authorization is enforced only on the backend.** UI gating is not security.
- **Offline does not grant authority.** No admin/editorial actions offline.
- **Monorepo boundaries are strict.**
  - Apps may depend on packages
  - Packages may depend on packages
  - Apps must not depend on other apps
  - Packages must not import from apps
  - No circular dependencies
- **Configuration isolation.**
  - Secrets live only on the backend
  - Shared packages contain schemas, not secret values
  - Misconfiguration must fail fast
- **Analytics is non-authoritative.** Failure must not break core workflows.

## Repo layout

- `apps/api` — authoritative backend core (rules + state transitions)
- `apps/web` — public discovery + admin/editor UI (client only)
- `apps/mobile` — offline-first listening + quick admin actions when online/authorized
- `packages/*` — shared libraries/config (platform-agnostic)
- `docs/` — architectural intent + implementation guide

## Development commands (pnpm + turbo)

- Install: `pnpm i`
- Dev: `pnpm dev`
- Dev (api): `pnpm dev:api`
- Dev (web): `pnpm dev:web`
- Dev (mobile): `pnpm dev:mobile`
- Build: `pnpm build`
- Lint: `pnpm lint`
- Typecheck: `pnpm typecheck`
- Test: `pnpm test`
- E2E: `pnpm test:e2e`
- OpenAPI: `pnpm openapi`
- Codegen: `pnpm codegen` (runs OpenAPI then client generation)

## API contract discipline

- API is a long-lived contract: explicit meaning, stable semantics.
- Versioning is explicit (URL versioning). Avoid silent behavior changes.
- Use **intent-driven actions** for state transitions (publish/archive/replace/reorder).

## Data model discipline

- Primary relational DB stores authoritative state only.
- DB stores **media references**, never raw media.
- Analytics/events are append-only and stored separately; never in core DB.
- Clients may cache and persist locally for offline usability, but never as authority.

## Deployment + environments

- Environments: `development`, `preview`, `production` (consistent across platforms).
- Deployments are **promotion-based** (tag-driven), not push-based:
  - `main` is protected; PRs only
  - Preview/production are promoted via tags (release tags immutable; env tags may move)
- No local-machine deployment commits.

## How to make changes safely

Before implementing:

1. Identify relevant docs section(s) and current timeline phase.
2. Confirm the change does not violate guardrails/non-goals.
3. Implement with explicit error handling + tests for sensitive rules.
4. Update docs if intent/guarantees change.

## Commits

Use Conventional Commits.
