# AGENT.md — packages/db

Database schema, migrations, and DB utilities.

## Core rules (authoritative data)

- Core relational DB stores authoritative platform state.
- Never store:
  - raw media files
  - analytics/event streams
  - derived/cached values (unless explicitly justified)
  - client UI state
  - secrets/credentials

## Modeling principles

- Explicit relationships (FKs), normalized by default.
- State is explicit (publication lifecycle is not inferred).
- Identifiers are stable and opaque; public slugs are separate.
- Avoid destructive schema changes without a migration path.

## Media references

- Store media references only (keys/ids/metadata), not media binaries.
- Replacement is explicit and permissioned (editorial action).

## Analytics isolation

- Analytics/event data does not belong in core DB.

## Commands

From repo root:

- Lint: `pnpm lint --filter=db`
- Typecheck: `pnpm typecheck --filter=db`
- Test: `pnpm test --filter=db`

## Operational discipline

- Treat migrations as first-class artifacts.
- Keep migrations reproducible and reviewable.
