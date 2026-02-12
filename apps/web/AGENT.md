# AGENT.md - apps/web (Public + Admin Client)

This Next.js app is a client of the backend API, not an authority.

## Core responsibilities

- Public discovery (SEO-friendly pages, deep links, shareable routes).
- Admin/editor workflows with efficient UI and safe UX.
- Strict adherence to backend contracts and permissions.

## Agent skills scope

- Project-local OpenCode skills live in `.opencode/skills/`.
- Keep Next.js and web-specific skills scoped to this app directory.

## Non-negotiables

- Never move business rules from API into web.
- Authorization is backend-only; UI gating is convenience only.
- Never bypass explicit API transition endpoints.

## Structure and dependency direction

- `app/` - routing/layout/composition only
- `features/` - domain-facing UI/hooks
- `core/` - platform concerns (API wiring, session, caching, error normalization)
- `shared/` - primitives/utilities with no inward deps

Direction:

- features -> core/shared
- core -> shared
- app composes features

## Data-fetching guidance

- Public pages: SSR/SSG as appropriate; respect publication status.
- Auth/admin flows: interactive client paths, backend-authorized.
- Keep client state derived from authoritative API responses.

## Commands (run from repo root)

- Dev: `pnpm dev:web`
- Build: `pnpm --filter web build`
- Lint: `pnpm --filter web lint`
- Typecheck: `pnpm --filter web typecheck`
- Unit/integration tests: `pnpm --filter web test`
- E2E (Playwright): `pnpm --filter web test:e2e`

## Single-test commands

- Jest file: `pnpm --filter web test -- src/path/to/file.test.tsx`
- Jest by name: `pnpm --filter web test -- -t "renders heading"`
- Playwright file: `pnpm --filter web test:e2e -- e2e/catalog.spec.ts`
- Playwright by title: `pnpm --filter web test:e2e -- --grep "catalog list"`
- Playwright project: `pnpm --filter web test:e2e -- --project chromium`

## API contract and codegen

- Do not hand-edit generated API client code.
- Regenerate client from source contracts (`pnpm contract`) when API changes.

## Quality expectations

- Preserve clear separation between UX logic and policy logic.
- Keep errors explicit and user-safe; do not swallow failures.
- Add tests for admin actions and permission-sensitive views.
