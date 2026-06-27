# @sd/domain-account

> User profile and auth state hooks for the Salafi Durus platform

## Purpose

Owns the React Query hooks that fetch and expose user account data — profile details and
auth state — to consuming apps. Centralises account data access so `apps/web` and
`apps/native` share the same query keys, caching behaviour, and API contract.

## Boundaries

- **Depends on:** `@sd/core-contracts`
- **Consumed by:** `apps/web`, `apps/native`

This package provides **data hooks only** — no UI components, no Zustand stores, and no
business logic. Auth enforcement lives exclusively in `apps/api`; client-side auth state
here is for UX purposes only and must never be treated as a security boundary.

## Entrypoints

```text
src/
├── account.api.ts     # useAccountProfile — raw React Query hook for profile data
├── use-account.ts     # useAccountScreen — screen-level composition hook
└── index.ts           # Single public entrypoint
```

**Exported hooks:**

- `useAccountProfile` — fetches the authenticated user's profile from the API
- `useAccountScreen` — composes `useAccountProfile` into a screen-ready view model

## Key Commands

- `bun run --filter @sd/domain-account typecheck` — Type check
- `bun run --filter @sd/domain-account test` — Run tests

## Known Constraints

- **Auth is backend-authoritative.** The profile data returned here reflects what the
  backend permits. Do not derive permissions or role checks from the client-side profile
  object.
- **No build step.** This package exports directly from `src/` (TypeScript source). Apps
  consume it via workspace resolution; no `dist/` is produced.
- **React Query version must align** with the version used in consuming apps. Both apps
  share the same peer dependency on `@tanstack/react-query`.

## Related Docs

- `docs/api.md` — backend auth architecture and endpoint contract
- `docs/architecture.md` — monorepo package boundaries
