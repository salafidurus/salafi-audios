# AGENT.md - packages/core-db

Owns Prisma schema, migrations, and DB client for the Salafi Durus platform.

## Boundaries

- **Depends on:** `@prisma/client`, `prisma` (dev)
- **Consumed by:** `apps/api`

## Key Commands

- `bun run --filter @sd/core-db build` — Generate client + build
- `bun run --filter @sd/core-db typecheck` — Type check (auto-generates client first)
- `bun run --filter @sd/core-db prisma:generate` — Regenerate Prisma client from schema
- `bun run --filter @sd/core-db prisma:validate` — Validate schema syntax
- `bun run --filter @sd/core-db prisma:format` — Format schema file
- `bun run --filter @sd/core-db migrate:create-only` — Create a new migration
- `bun run --filter @sd/core-db migrate:deploy` — Apply pending migrations
- `bun run --filter @sd/core-db grant:role <email> <role>` — Grant a role to a user
- `bun run --filter @sd/core-db test` — Run tests (bun:test)

## Structure

```text
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

## Constraints

- **Never hand-edit** `src/generated/` — always regenerate from `prisma/schema.prisma`.
- Store authoritative relational state only — no media blobs, analytics streams, or UI state.
- Do not embed environment values in source or migration files.
- Favor explicit foreign keys and normalized models; separate internal IDs from public slugs.
- **CI gotcha:** Remote cache restores `dist/` but not `src/generated/`. The build script handles this by copying generated output to `dist/generated/prisma/`.
- Path alias `@/` maps to `src/*`.
- Env file precedence: `.env` → `.env.local` → `.env.<NODE_ENV>` → `.env.<NODE_ENV>.local`
