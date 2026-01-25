# AGENT.md — apps/web (Public + Admin Client)

Next.js web app for:

1. Public discovery / SEO-friendly pages
2. Administrative/editorial power tools (bulk workflows)

## Core responsibility

- Remain a pure client of the backend API.
- Provide SEO, deep linking, sharing previews.
- Provide admin/editor workflows without bypassing backend authority.

## Non-negotiables

- Web app is never authoritative.
- **Authorization is enforced on the backend** (UI gating is not security).
- No duplication of backend business rules.

## Structure (enforced)

- `app/` routing/layout/SEO composition (no domain logic)
- `core/` web infrastructure (auth/session, api wiring, caching, error normalization)
- `features/` domain-oriented UI and hooks
- `shared/` primitives (domain-agnostic)

Dependency direction:

- features -> core/shared
- core -> shared
- app composes features
- shared is pure (no feature/core imports)

## Data fetching rules

- Public pages: SSR/SSG when beneficial; cacheable; published-only.
- Authenticated/admin: client-side interactive flows; always backend-authorized.

## Admin/editor actions

- Express state transitions explicitly via backend endpoints (publish/archive/reorder/replace).
- Never implement “hidden rules” client-side.

## Commands

From repo root:

- Dev: `pnpm dev:web`
- Lint: `pnpm lint --filter=web`
- Typecheck: `pnpm typecheck --filter=web`
- Test: `pnpm test --filter=web`
- E2E: `pnpm test:e2e`
