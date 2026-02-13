# AGENT.md - Salafi Durus Monorepo

This repository is one system. The monorepo is an enforcement tool, not a convenience.

## Source of truth

- Architecture and intent live in `docs/` and are authoritative.
- Read in order: `docs/README.md` -> this file -> target workspace `AGENT.md` -> `.github/copilot-instructions.md`.
- If code and docs conflict, reconcile intentionally (do not silently drift).

## Non-negotiable guardrails

- Backend authority is absolute; clients are consumers.
- Authorization is backend-only; UI checks are UX, not security.
- Offline means queued intent, never authoritative state transitions.
- Media are references/metadata; do not store blobs in primary DB.
- Monorepo boundaries are strict:
  - apps -> packages allowed
  - packages -> packages allowed
  - app -> app forbidden
  - package -> app forbidden
  - no circular dependencies
- Misconfiguration must fail fast.
- Non-authoritative analytics failures must never break core workflows.

## Repo layout

- `apps/api` - authoritative backend core
- `apps/web` - public/admin web client
- `apps/mobile` - offline-first mobile client
- `packages/*` - shared libraries and configs
- `docs/` - product + implementation authority

### Package Map

- `packages/db` - Database schema and client
- `packages/env` - Environment variable schemas
- `packages/i18n` - Internationalization config and keys
- `packages/auth-shared` - Shared auth types
- `packages/api-client` - Generated API client
- `packages/config` - Shared lint/build config
- `packages/ingest` - Content ingestion

## Commands (root)

- Install: `pnpm i`
- Dev: `pnpm dev`
- Dev one app: `pnpm dev:api`, `pnpm dev:web`, `pnpm dev:mobile`
- Build: `pnpm build`
- Lint: `pnpm lint`
- Typecheck: `pnpm typecheck`
- Test: `pnpm test`
- E2E: `pnpm test:e2e`
- Prepush suite: `pnpm test:prepush`
- Ingest content: `pnpm ingest:content`
- Remove ingested: `pnpm ingest:remove`
- Format: `pnpm format`
- Format check: `pnpm format:check`

## Scoped execution

- API: `pnpm --filter api <script>`
- Web: `pnpm --filter web <script>`
- Mobile: `pnpm --filter mobile <script>`
- DB: `pnpm --filter @sd/db <script>`
- Env: `pnpm --filter @sd/env <script>`
- I18n: `pnpm --filter @sd/i18n <script>`
- Auth shared: `pnpm --filter @sd/auth-shared <script>`
- API client: `pnpm --filter @sd/api-client <script>`
- Ingest: `pnpm --filter @sd/ingest <script>`

Turbo grouped scripts:

- `pnpm lint:api+web`, `pnpm lint:api+mobile`
- `pnpm typecheck:api+web`, `pnpm typecheck:api+mobile`
- `pnpm test:api+web`, `pnpm test:api+mobile`

## Single-test quick reference

- Jest file (API): `pnpm --filter api test -- src/modules/topics/topics.service.spec.ts`
- Jest file (Web): `pnpm --filter web test -- src/path/to/file.test.tsx`
- Jest file (Mobile): `pnpm --filter mobile test -- src/path/to/file.test.tsx`
- Jest file (DB): `pnpm --filter @sd/db test -- src/path/to/file.spec.ts`
- Jest by name: `pnpm --filter api test -- src/modules/topics/topics.service.spec.ts -t "returns topic by slug"`
- Jest watch file (API): `pnpm --filter api test:watch -- src/modules/topics/topics.service.spec.ts`
- Playwright file: `pnpm --filter web test:e2e -- e2e/catalog.spec.ts`
- Playwright by title: `pnpm --filter web test:e2e -- --grep "catalog list"`

## Contract and data discipline

- API is a stable contract with explicit intent-driven actions (publish/archive/reorder/replace).
- OpenAPI + client generation flow:
  - `pnpm openapi`
  - `pnpm codegen`
  - `pnpm contract` (both)
- Never hand-edit `packages/api-client/generated/`.
- If generated types are wrong, fix API/OpenAPI source first, then regenerate.

## DB and migration discipline

- Primary DB stores authoritative relational state.
- Keep media as references only.
- Keep analytics/events out of authoritative core tables.
- Treat migrations as first-class and reviewable.
- Treat `packages/db/src/generated/` as derived output; keep it untracked and regenerate locally when needed.
- Prisma commands (scoped to `@sd/db`):
  - `pnpm --filter @sd/db prisma:generate`
  - `pnpm --filter @sd/db prisma:validate`
  - `pnpm --filter @sd/db prisma:format`
  - `pnpm --filter @sd/db migrate:create-only`
  - `pnpm --filter @sd/db migrate:deploy`

## Quality and style

- Prettier is mandatory; root `.prettierrc` is authoritative.
- API has a local Prettier override (`apps/api/.prettierrc`: single quotes).
- ESLint flat configs come from `@sd/config/eslint/*`.
- `no-console` is an error unless explicitly allowed.
- TypeScript strict mode is required (`strict: true`, `noEmit: true`).
- Prefer explicit return types for exported services/repos.
- Prefer `unknown` over `any`, then narrow.
- File naming uses kebab-case.
- DTO naming uses `PascalCase` + `Dto`.
- Keep API errors structured and consistent.

## Commits and hooks

- Conventional Commits are enforced (`commitlint`).
- Pre-commit runs `pnpm lint:staged`.
- Pre-push runs `pnpm test:prepush`.

## Copilot/Cursor notes

- Cursor rules files are not present (`.cursorrules`, `.cursor/rules/`).
- Follow `.github/copilot-instructions.md`:
  - backend authority
  - backend-only authorization
  - offline intent queueing
  - media as references
  - strict monorepo boundaries
  - generated client is derived

## Safety checklist

- Do not bypass backend authorization with client logic.
- Do not introduce app-to-app imports.
- Do not commit secrets or env values.
- Do not hand-edit generated API client output.
- Update docs when architecture intent or guarantees change.
