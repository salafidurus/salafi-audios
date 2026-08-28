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
- Bun.WebView journeys: `bun run test:e2e:bun` (Turbo builds `web` first)
- Bun.WebView configuration: `BUN_E2E_PORT`, `BUN_E2E_API_ORIGIN`, and `BUN_E2E_READY_TIMEOUT_MS`
- Bun.WebView failure artifacts: `apps/web/test-results/bun-webview/<test-name>/`

Targeted testing examples:

- Jest by name: `bun run --filter web test -- -t "renders heading"`
- Playwright file: `bun run --filter web test:e2e -- e2e/catalog.spec.ts`
- Playwright grep: `bun run --filter web test:e2e -- --grep "catalog list"`

The Bun.WebView journeys require a locally installed Google Chrome. They run the
production-built Next.js app through an isolated browser profile per journey,
use explicit application-condition waits, and write failure diagnostics before
closing the browser. Authentication/account and navigation/library intents remain
with their follow-up migration tickets until those tickets are complete.

## Guardrails

- Never move business rules from backend into web.
- Authorization remains backend-only; UI checks are UX only.
- Use explicit backend transition endpoints (publish/archive/reorder/replace).
- Keep app structure aligned with `app/`, `features/`, `core/`, `shared/` boundaries.

See `apps/web/AGENT.md`, `docs/clients/web.md`, and `docs/runbooks/deployment/vercel.md` for architecture and deployment details.
