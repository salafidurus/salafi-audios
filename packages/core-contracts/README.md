# @sd/core-contracts

> Shared API contracts, query infrastructure, and TypeScript types for the Salafi Durus platform

## Purpose

Defines the hand-written TypeScript DTOs, route constants, and TanStack Query hooks that keep web, mobile, and API boundaries type-safe. This is the single source of truth for shared response shapes — if backend output changes, update types here first, then propagate to consumers.

## Boundaries

- **Depends on:** `@tanstack/react-query`
- **Consumed by:** `apps/api`, `apps/web`, `apps/mobile`, `@sd/core-api`, `@sd/shared`, all `feature-*` / `domain-*` packages

## Structure

```
src/
├── types/          # DTO definitions per domain (scholar, lecture, topic, etc.)
├── query/          # TanStack Query client, keys, and hooks
│   └── hooks/      # useApiQuery, initApiClient
├── endpoints.ts    # API endpoint path builders
├── routes.ts       # Route constants
└── http.ts         # HTTP client configuration
```

## Exports

| Subpath           | What it provides                        |
| ----------------- | --------------------------------------- |
| `@sd/core-contracts`         | All types, routes, endpoints            |
| `@sd/core-contracts/query`   | Query client, query keys                |
| `@sd/core-contracts/query/hooks` | `useApiQuery`, `initApiClient`      |
| `@sd/core-contracts/http`    | HTTP client config                      |

## Key Commands

- `pnpm --filter core-contracts build` — Build the package
- `pnpm --filter core-contracts typecheck` — Type check
- `pnpm --filter core-contracts lint` — Lint
- `pnpm --filter core-contracts test` — Run tests

## Constraints

- **Hand-written, not generated.** Contract changes require explicit review — no auto-generation from backend.
- Types must stay minimal at API boundaries — avoid leaking domain internals.
- Prefer `readonly` and branded types; add JSDoc to non-obvious fields.
- Path alias `@/` maps to `src/*`.
