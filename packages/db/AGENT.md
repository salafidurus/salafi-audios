# AGENT.md - packages/db

This package owns Prisma schema, migrations, and DB client utilities.

## Core data rules

- Store authoritative relational state only.
- Do not store media blobs, analytics/event streams, UI state, or secrets.
- Keep state transitions explicit (do not infer lifecycle implicitly).

## Modeling discipline

- Favor explicit foreign keys and normalized models.
- Separate opaque internal IDs from public slugs.
- Avoid destructive changes without migration strategy.
- Keep migrations reproducible and review-friendly.

## Prisma workflow (root commands)

- Generate client: `pnpm --filter @sd/db prisma:generate`
- Validate schema: `pnpm --filter @sd/db prisma:validate`
- Format schema: `pnpm --filter @sd/db prisma:format`
- Create migration: `pnpm --filter @sd/db migrate:create-only`
- Deploy migrations: `pnpm --filter @sd/db migrate:deploy`

## Build/lint/test commands

- Build: `pnpm --filter @sd/db build`
- Lint: `pnpm --filter @sd/db lint`
- Typecheck: `pnpm --filter @sd/db typecheck`
- Test: `pnpm --filter @sd/db test`

## Single-test commands

- Jest file: `pnpm --filter @sd/db test -- src/path/to/file.spec.ts`
- Jest by name: `pnpm --filter @sd/db test -- src/path/to/file.spec.ts -t "creates record"`

## Safety notes

- Do not embed environment values in source or migrations.
- Keep generated output derived from schema, not hand-edited.
- Never commit generated DB artifacts under `packages/db/src/generated/`.
