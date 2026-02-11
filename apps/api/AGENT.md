# AGENT.md - apps/api (Authoritative Backend)

This service is the authority for business rules, permissions, and state transitions.

## Core responsibilities

- Enforce business invariants and authorization before side effects.
- Expose stable API contracts for web/mobile.
- Coordinate DB, media, and non-authoritative analytics safely.

## Layering rules

- Keep layering explicit:
  1. Interface (controllers/DTO validation/auth guards)
  2. Application (use-case orchestration, transactions)
  3. Domain (invariants and transition rules)
  4. Infrastructure (DB/media/adapters; no policy decisions)
- Do not leak persistence into controllers.
- Do not put business decisions in infrastructure adapters.

## Authorization and trust model

- Authentication identifies caller; authorization grants/denies action.
- Re-check authorization on each protected endpoint.
- UI-level restrictions are never security controls.
- Reject invalid/unauthorized requests before mutating state.

## API design rules

- Keep contracts explicit and stable.
- Prefer intent-driven actions for transitions (publish/archive/reorder/replace).
- Validate all boundary input with DTO/class-validator.
- Keep error responses structured and consistent.

## Commands (run from repo root)

- Dev: `pnpm dev:api`
- Build: `pnpm --filter api build`
- Lint: `pnpm --filter api lint`
- Typecheck: `pnpm --filter api typecheck`
- Test: `pnpm --filter api test`
- E2E: `pnpm --filter api test:e2e`
- OpenAPI: `pnpm openapi`

## Single-test commands

- One test file: `pnpm --filter api test -- src/modules/topics/topics.service.spec.ts`
- One test name: `pnpm --filter api test -- src/modules/topics/topics.service.spec.ts -t "returns topic by slug"`
- Watch one file: `pnpm --filter api test:watch -- src/modules/topics/topics.service.spec.ts`
- E2E file: `pnpm --filter api test:e2e -- test/health.e2e-spec.ts`

## Contract/codegen workflow

- Generate OpenAPI: `pnpm openapi`
- Regenerate client package: `pnpm codegen`
- If client types are wrong, fix API/OpenAPI source first.

## Data and media rules

- Persist only authoritative state in relational DB.
- Store media references/metadata, never blobs.
- Keep replacement/upload actions explicit and permissioned.

## Testing expectations

- Prioritize:
  - domain invariants
  - authorization boundaries
  - transition semantics (publish/archive/reorder/replace)
- Add regression tests for bug fixes.
- Update tests when contracts change.

## Common pitfalls to avoid

- Client-authoritative logic hidden in endpoints.
- Silent fallback for invalid config or invalid state.
- Unstructured errors or inconsistent status semantics.
