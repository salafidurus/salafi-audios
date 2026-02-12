# Salafi Durus

Salafi Durus is a curated, offline-first lecture platform for preserving and delivering authentic Salafi knowledge with structure, trust, and long-term maintainability.

This monorepo contains the full system:

- `apps/mobile` - offline-first listener experience + focused admin actions
- `apps/web` - public discovery + primary editorial workflows
- `apps/api` - authoritative backend and API contract
- `packages/*` - shared libraries, schemas, config, and generated client
- `docs/` - architectural source of truth

## Start Here

- Read `docs/README.md` first, then `AGENT.md`, then the target workspace `AGENT.md`.
- Treat `docs/` as authoritative for product intent and implementation boundaries.
- Keep backend authority absolute: clients never own policy or authorization decisions.

## Quick Start

Prerequisites:

- Node.js 22.x
- `pnpm@10.x` (repo pins `pnpm@10.28.1`)

Install and run:

```bash
pnpm i
pnpm dev
```

Useful scoped dev commands:

```bash
pnpm dev:api
pnpm dev:web
pnpm dev:mobile
```

## Monorepo Commands

Run from repo root:

- Build: `pnpm build`
- Lint: `pnpm lint`
- Typecheck: `pnpm typecheck`
- Test: `pnpm test`
- E2E: `pnpm test:e2e`
- Pre-push suite: `pnpm test:prepush`
- Contract/codegen: `pnpm contract`

Scoped examples:

- API only: `pnpm --filter api <script>`
- Web only: `pnpm --filter web <script>`
- Mobile only: `pnpm --filter mobile <script>`

## Architecture Guardrails

- Backend is authoritative for business rules and state transitions.
- Authorization is backend-only; UI checks are UX only.
- Offline mode queues intent; it does not create authoritative state.
- Media are stored as references/metadata, never blobs in core relational tables.
- Dependency boundaries are strict:
  - apps -> packages allowed
  - packages -> packages allowed
  - app -> app forbidden
  - package -> app forbidden
  - no circular dependencies

## Documentation Map

Use `docs/README.md` as the primary index:

1. `docs/product-overview/` - what we are building and why
2. `docs/implementation-guide/` - how we are building it
3. `docs/timeline/` - in what order we are building it

If implementation and docs diverge, update docs intentionally or reconsider the change.

## Delivery Model

- `main` is protected and is the only long-lived branch.
- Changes enter through pull requests with required checks.
- Deployments are promotion/tag based (not branch-push based).
- Environment isolation is strict (`development`, `preview`, `production`).

See `docs/implementation-guide/10-environments-and-configuration.md` for deployment and environment policy.

## Contributing

Contributions must preserve documented architecture and guardrails.

- Do not bypass backend authorization in clients.
- Do not hand-edit generated API client output in `packages/api-client/generated/`.
- Do not commit generated DB artifacts from `packages/db/src/generated/`.
- Do not add app-to-app imports.
- Update docs when behavior or architectural intent changes.

Undocumented shortcuts are defects.

## License and Usage

This repository is currently private/internal.

- Redistribution, deployment, or reuse without permission is not allowed.
- Public licensing terms will be documented before release.
