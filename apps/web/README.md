# Web App (`apps/web`)

This is the Next.js client for public discovery and web-based editorial workflows.

- Public catalog browsing and SEO-friendly pages
- Authenticated admin/editor flows
- Strict consumer of backend API contracts

## Run

From monorepo root:

```bash
bun run dev:web
```

Or scoped directly:

```bash
bun run --filter web dev
```

## Common Commands

Run from repo root:

- Build: `bun run --filter web build`
- Lint: `bun run --filter web lint`
- Typecheck: `bun run --filter web typecheck`
- Unit/integration tests: `bun run --filter web test`
- E2E tests (Playwright): `bun run --filter web test:e2e`

Targeted testing examples:

- Jest by name: `bun run --filter web test -- -t "renders heading"`
- Playwright file: `bun run --filter web test:e2e -- e2e/catalog.spec.ts`
- Playwright grep: `bun run --filter web test:e2e -- --grep "catalog list"`

## Guardrails

- Never move business rules from backend into web.
- Authorization remains backend-only; UI checks are UX only.
- Use explicit backend transition endpoints (publish/archive/reorder/replace).
- Keep app structure aligned with `app/`, `features/`, `core/`, `shared/` boundaries.

See `apps/web/AGENT.md` and `docs/implementation-guide/09-web-application-structure.md` for architecture details.
