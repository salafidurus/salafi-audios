# @sd/core-env

> Runtime environment schema validation for all apps in the monorepo

## Purpose

Defines Zod schemas that parse and validate environment variables at startup for each deployment target (API, web, mobile, database). Ensures every app fails fast on misconfiguration rather than silently using wrong values.

## Boundaries

- **Depends on:** `zod`
- **Consumed by:** `@sd/core-config`, `@sd/core-db`, `apps/api`, `apps/web`, `apps/mobile`

## Structure

```
src/
├── api.ts      # ApiEnvSchema — PORT, DATABASE_URL, auth secrets, etc.
├── web.ts      # WebPublicEnvSchema — NEXT_PUBLIC_API_URL, etc.
├── mobile.ts   # Mobile build-time and runtime env parsing
├── db.ts       # Database-specific env (DATABASE_URL)
└── index.ts    # Re-exports all env getters
```

## Exports

| Subpath              | What it provides               |
| -------------------- | ------------------------------ |
| `@sd/core-env`       | All env getters (re-exports)   |
| `@sd/core-env/api`   | `getApiEnv()`                  |
| `@sd/core-env/web`   | `getWebPublicEnv()`            |
| `@sd/core-env/mobile`| `getMobileBuildEnv()`, `parseMobileRuntimeExtra()` |
| `@sd/core-env/db`    | `getDbEnv()`                   |

## Key Commands

- `pnpm --filter core-env build` — Build with tsup (ESM + CJS + DTS)
- `pnpm --filter core-env typecheck` — Type check
- `pnpm --filter core-env lint` — Lint
- `pnpm --filter core-env test` — Run tests (Jest)

## Constraints

- **Never commit secrets or concrete env values** — schemas define shape and validation only.
- Fail fast on invalid config; no silent fallbacks for required variables.
- Keep portable across API/web/mobile — avoid app-specific dependencies.
- Path alias `@/` maps to `src/*`.
