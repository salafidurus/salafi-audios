# API (`apps/api`)

This app is the authoritative backend for Salafi Durus.

- Enforces business rules and state transitions
- Enforces authentication and authorization
- Owns the API contract consumed by web/mobile
- Coordinates data persistence, media metadata, and integrations

## Run

From the monorepo root:

```bash
pnpm dev:api
```

Or scoped directly:

```bash
pnpm --filter api dev
```

## Common Commands

Run from repo root:

- Build: `pnpm --filter api build`
- Lint: `pnpm --filter api lint`
- Typecheck: `pnpm --filter api typecheck`
- Unit tests: `pnpm --filter api test`
- E2E tests: `pnpm --filter api test:e2e`

Single-test examples:

- One file: `pnpm --filter api test -- src/modules/topics/topics.service.spec.ts`
- By name: `pnpm --filter api test -- src/modules/topics/topics.service.spec.ts -t "returns topic by slug"`

## OpenAPI and Client Contract

When backend contract changes:

```bash
pnpm openapi
pnpm codegen
```

Or run both:

```bash
pnpm contract
```

Never hand-edit generated files in `packages/api-client/generated/`.

## Content Ingestion (Phase 02)

Content ingestion is implemented in `packages/ingest`.

Run from repo root:

```bash
pnpm ingest:content
```

Or scoped directly:

```bash
pnpm --filter @sd/ingest ingest:content
```

For audio assets stored as relative object keys, set `ASSET_CDN_BASE_URL` in API env so
responses expose stable CDN URLs without storing CDN hostnames in DB.

## Guardrails

- Backend is authoritative; clients are consumers.
- Authorization is backend-only.
- Reject unauthorized/invalid requests before any side effects.
- Media in DB is references/metadata, not blobs.
- Keep layering explicit: interface -> application -> domain -> infrastructure.

See `apps/api/AGENT.md` and `docs/implementation-guide/02-backend-architecture.md` for implementation constraints.
