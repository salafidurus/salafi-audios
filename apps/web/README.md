# Web App (`apps/web`)

This is the Next.js client for public discovery and web-based editorial workflows.

- Public catalog browsing and SEO-friendly pages
- Authenticated admin/editor flows
- Strict consumer of backend API contracts

## Run

From monorepo root:

```bash
pnpm dev:web
```

Or scoped directly:

```bash
pnpm --filter web dev
```

## Common Commands

Run from repo root:

- Build: `pnpm --filter web build`
- Lint: `pnpm --filter web lint`
- Typecheck: `pnpm --filter web typecheck`
- Unit/integration tests: `pnpm --filter web test`
- E2E tests (Playwright): `pnpm --filter web test:e2e`

Targeted testing examples:

- Jest by name: `pnpm --filter web test -- -t "renders heading"`
- Playwright file: `pnpm --filter web test:e2e -- e2e/catalog.spec.ts`
- Playwright grep: `pnpm --filter web test:e2e -- --grep "catalog list"`

## Guardrails

- Never move business rules from backend into web.
- Authorization remains backend-only; UI checks are UX only.
- Use explicit backend transition endpoints (publish/archive/reorder/replace).
- Keep app structure aligned with `app/`, `features/`, `core/`, `shared/` boundaries.

See `apps/web/AGENT.md` and `docs/implementation-guide/09-web-application-structure.md` for architecture details.
