# AGENT.md — apps/api (Authoritative Backend)

This backend is the authoritative core of Salafi Durus.

## Core responsibility

- Enforce **business rules**, **data integrity**, **authorization**, and **state transitions**.
- Coordinate database, media, and analytics access.
- Provide a stable, explicit API contract for all clients (mobile + web).

## Layering (must remain clean)

Backend is layered:

1. Interface layer: request acceptance, shape validation, authentication, routing.
2. Application layer: use-case orchestration, authorization decisions, transactions.
3. Domain layer: entities, invariants, allowed transitions (framework-agnostic).
4. Infrastructure layer: DB/media/analytics adapters; no policy.

Rules:

- Interface layer contains **no business rules** and **no direct DB access**.
- Domain layer contains **no infrastructure concerns**.
- Infrastructure contains **no decision-making authority**.

## Authorization rules

- Authentication establishes identity.
- Authorization determines permission (role + scope), evaluated on every protected request.
- Reject before side effects; fail safely.
- UI restrictions are not security; never assume client intent is safe.

## API design discipline

- API is a contract: explicit meaning, stable semantics, backwards-compatible where possible.
- Prefer resource-oriented endpoints and **explicit intent-driven actions**:
  - publish / archive
  - reorder
  - replace media
- Validation at boundary; errors must be structured and consistent.

## Data and media rules

- Core DB stores authoritative state only.
- DB stores **references to media**, not media.
- Media uploads are backend-coordinated (presigned + time-limited perms).
- Media replacement is explicit, permissioned, auditable.

## Analytics isolation

- Analytics is non-authoritative and failure-tolerant.
- Analytics failures must not impact core operations.

## Commands

From repo root:

- Dev: `pnpm dev:api`
- Lint: `pnpm lint --filter=api`
- Typecheck: `pnpm typecheck --filter=api`
- Test: `pnpm test --filter=api`
- OpenAPI (root): `pnpm openapi`
- Codegen clients (root): `pnpm codegen`

## Testing expectations

- Add tests for domain invariants, auth boundaries, and state transitions.
- Treat “temporary shortcuts” and client-side rules as defects.
