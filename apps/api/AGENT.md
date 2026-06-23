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
- Import shared response types from `@sd/core-contracts`.
- If a DTO is used by web or mobile, define it in `@sd/core-contracts` and import it here.
- If a DTO is API-only, keep it local to this app.
- Keep API-only request DTOs local (for validation decorators).

## Contract workflow

- Shared types are defined in `@sd/core-contracts` - import from there.
- When API response shapes change, update `packages/core-contracts/src/types/` manually.
- Run `pnpm --filter core-contracts build` after updating contracts.

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
