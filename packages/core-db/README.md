# @sd/core-db

> Prisma schema, migrations, and database client for the Salafi Durus platform

## Purpose

Owns the authoritative data model via Prisma schema and provides the generated `PrismaClient` to the API layer. All schema changes flow through this package's migration workflow to keep environments reproducible and review-friendly.

## Boundaries

- **Depends on:** `@prisma/client`, `@sd/core-env` (dev), `prisma` (dev)
- **Consumed by:** `apps/api`

## Structure

```
prisma/
├── schema.prisma       # Authoritative data model
├── migrations/         # Ordered migration files
└── prisma.config.ts    # Prisma configuration
src/
├── index.ts            # Re-exports PrismaClient
└── generated/prisma/   # Generated client (do NOT hand-edit)
scripts/
├── copy-generated-to-dist.js
└── migrate-with-auto-name.js
```

## Key Commands

- `pnpm --filter core-db build` — Generate client + build
- `pnpm --filter core-db typecheck` — Type check (auto-generates client first)
- `pnpm --filter core-db prisma:generate` — Regenerate Prisma client from schema
- `pnpm --filter core-db prisma:validate` — Validate schema syntax
- `pnpm --filter core-db prisma:format` — Format schema file
- `pnpm --filter core-db migrate:create-only` — Create a new migration
- `pnpm --filter core-db migrate:deploy` — Apply pending migrations
- `pnpm --filter core-db test` — Run tests (Jest)

## Constraints

- **Never hand-edit** `src/generated/` — always regenerate from `prisma/schema.prisma`.
- Store authoritative relational state only — no media blobs, analytics streams, or UI state.
- Do not embed environment values in source or migration files.
- Favor explicit foreign keys and normalized models; separate internal IDs from public slugs.
- **CI gotcha:** Remote cache restores `dist/` but not `src/generated/`. The build script handles this by copying generated output to `dist/generated/prisma/`.
- Path alias `@/` maps to `src/*`.
