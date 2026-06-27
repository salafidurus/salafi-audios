# Salafi Durus

Salafi Durus is a curated, offline-first lecture platform for preserving and delivering authentic Salafi knowledge with structure, trust, and long-term maintainability.

This monorepo contains the full system:

- `apps/native` - offline-first listener experience + focused admin actions
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

- Node.js 24.x
- Bun 1.3.x (repo pins `bun@1.3.14`)

Install and run:

```bash
bun install
bun run dev
```

Useful scoped dev commands:

```bash
bun run dev:api
bun run dev:web
bun run dev:native
bun run dev:native:build:android   # native build without cleaning (expo run:android)
bun run dev:native:clean-build:android  # prebuild --clean + native build
```

## Monorepo Commands

Run from repo root:

- Build: `bun run build`
- Lint: `bun run lint`
- Typecheck: `bun run typecheck`
- Test: `bun run test`
- E2E: `bun run test:e2e`
- Pre-push suite: `bun run test:prepush`
- API OpenAPI generation: `bun run --filter api openapi`

Scoped examples:

- API only: `bun run --filter api <script>`
- Web only: `bun run --filter web <script>`
- Mobile only: `bun run --filter mobile <script>`
- Native only: `bun run --filter native <script>`

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

## Tooling & MCP Configuration

This project uses **OpenCode** with various MCP servers (GitHub, Playwright, Tailwind, etc.). To maintain security:

- **Sensitive Configs**: All API keys and Personal Access Tokens (PATs) are stored in your **Global OpenCode Config** (`~/.config/opencode/opencode.json`).
- **Project Config**: The `opencode.json` in this repo root is committed but contains **no secrets**. It only toggles features `on` or `off`.
- **Setup Requirement**: To use the GitHub MCP features, you must manually add the `server-github` headers to your global config file. Do not attempt to add them to the project-level file.

## Delivery Model

- Protected branches map to environments: `main` -> development, `preview` -> preview, `production` -> production.
- Changes enter protected branches through pull requests with required checks.
- Deployments are branch-based from protected branch updates.
- Environment isolation is strict (`development`, `preview`, `production`).

See `docs/implementation-guide/10-environments-and-configuration.md` for deployment and environment policy.

## Contributing

Contributions must preserve documented architecture and guardrails.

- Do not bypass backend authorization in clients.
- Do not hand-edit generated API client output in `packages/api-client/generated/`.
- Do not commit generated DB artifacts from `packages/core-db/src/generated/`.
- Do not add app-to-app imports.
- Update docs when behavior or architectural intent changes.

Undocumented shortcuts are defects.

## License and Usage

This repository is currently private/internal.

- Redistribution, deployment, or reuse without permission is not allowed.
- Public licensing terms will be documented before release.
