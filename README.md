# Salafi Durus

Salafi Durus is an offline-first lecture platform for preserving and
delivering structured Islamic knowledge.

This monorepo contains:

- `apps/api` — authoritative NestJS backend
- `apps/web` — Next.js web application
- `apps/native` — Expo/React Native mobile application
- `packages/` — shared contracts, database access, localization, and utilities
- `docs/` — product, architecture, development, and operations documentation

## Start here

1. Read [`docs/README.md`](docs/README.md).
2. Read the relevant workspace `AGENT.md`.
3. Follow the domain documentation before changing architecture or behavior.

The backend owns authorization, business rules, and durable state. Clients are
responsible for presentation, interaction, and local/offline behavior; they do
not make authoritative policy decisions.

## Development

Requirements: Node.js 22.x and Bun 1.4.x (`bun@1.4.0`).

```bash
bun install
bun run dev
```

Useful commands:

```bash
bun run dev:api
bun run dev:web
bun run dev:native
bun run build
bun run lint
bun run typecheck
bun run test

# Full repository checks
bun run build:all
bun run lint:all
bun run typecheck:all
bun run test:all
bun run test:e2e:all
```

The default build, lint, typecheck, and test commands use Turbo's affected
graph for fast local feedback. Run scoped scripts with
`bun run --filter <workspace> <script>`.

## Architecture rules

- Backend authority is absolute.
- Authorization is enforced by the backend; client checks are presentation only.
- Offline clients queue intent and synchronize with the API.
- Media files live in object storage; relational tables store metadata and references.
- Apps may depend on packages. Apps must not depend on other apps.
- Do not hand-edit generated API client or database output.

Read [`docs/architecture.md`](docs/architecture.md) for the platform map and
[`docs/policies/deployment.md`](docs/policies/deployment.md) for delivery rules.

## Contribution

Use pull requests and required checks for protected branches. Update the
relevant documentation when changing behavior or architectural boundaries.

This repository is private/internal. Redistribution or reuse requires
permission.
