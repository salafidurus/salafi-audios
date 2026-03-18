# AGENT.md - Salafi Durus Monorepo

This repository is one system. The monorepo is an enforcement tool, not a convenience.

## Source of truth

- Architecture and intent live in `docs/` and are authoritative.
- Read in order: `docs/README.md` -> this file -> target workspace `AGENT.md` -> `.github/copilot-instructions.md`.
- If code and docs conflict, reconcile intentionally (do not silently drift).

## Image-to-code workflow

- For design image requests, use root skill `google-stitch` with a Stitch-first flow.
- Sequence is mandatory: image -> Stitch baseline -> repo adaptation.
- Adaptation must apply `docs/`, root/workspace `AGENT.md`, and `.github/copilot-instructions.md`.
- Place generated code only in the target workspace (`apps/web` or `apps/mobile`) and keep monorepo boundaries intact.

## Brand assets

- Web favicon/app icons: `apps/web/src/app/favicon.ico`, `apps/web/public/icons/*`
- Web logos: `apps/web/public/logo/*`
- Mobile app icon/splash: `apps/mobile/assets/images/icon.png`, `apps/mobile/assets/images/splash-icon.png`
- Mobile logos: `apps/mobile/assets/images/logo/*`
- When implementing UI, use these assets (avoid starter/template logos).

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
- `packages/contracts` - Shared TypeScript contracts (DTOs, types, query hooks)
- `packages/design-tokens` - Design tokens (colors, spacing, radius, typography) — authoritative source
- `packages/ui-mobile` - Cross-platform UI components and feature library (used by mobile via react-native, web via react-native-web transpilation)
- `packages/config` - Shared lint/build config
- `packages/ingest` - Content ingestion

**Note:** `packages/ui-mobile` requires `transpilePackages: ["@sd/ui-mobile"]` in `next.config.ts` for web integration.

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
- DB: `pnpm --filter db <script>`
- Env: `pnpm --filter env <script>`
- I18n: `pnpm --filter i18n <script>`
- Auth shared: `pnpm --filter auth-shared <script>`
- Contracts: `pnpm --filter contracts <script>`
- Design tokens: `pnpm --filter design-tokens <script>`
- UI Mobile: `pnpm --filter ui-mobile <script>`
- Config: `pnpm --filter config <script>`
- Ingest: `pnpm --filter ingest <script>`

Turbo grouped scripts:

- `pnpm lint:api+web`, `pnpm lint:api+mobile`
- `pnpm typecheck:api+web`, `pnpm typecheck:api+mobile`
- `pnpm test:api+web`, `pnpm test:api+mobile`

## Single-test quick reference

- Jest file (API): `pnpm --filter api test -- src/modules/topics/topics.service.spec.ts`
- Jest file (Web): `pnpm --filter web test -- src/path/to/file.test.tsx`
- Jest file (Mobile): `pnpm --filter mobile test -- src/path/to/file.test.tsx`
- Jest file (DB): `pnpm --filter db test -- src/path/to/file.spec.ts`
- Jest by name: `pnpm --filter api test -- src/modules/topics/topics.service.spec.ts -t "returns topic by slug"`
- Jest watch file (API): `pnpm --filter api test:watch -- src/modules/topics/topics.service.spec.ts`
- Playwright file: `pnpm --filter web test:e2e -- e2e/catalog.spec.ts`
- Playwright by title: `pnpm --filter web test:e2e -- --grep "catalog list"`

## Contract and data discipline

- API is a stable contract with explicit intent-driven actions (publish/archive/reorder/replace).
- Shared types are defined in `packages/contracts` - hand-written and stable.
- All apps (api, web, mobile) import shared types from `@sd/contracts`.
- When API response shapes change, update `packages/contracts/src/types/` manually.
- Never hand-edit generated code; this package eliminates codegen friction.

## DB and migration discipline

- Primary DB stores authoritative relational state.
- Keep media as references only.
- Keep analytics/events out of authoritative core tables.
- Treat migrations as first-class and reviewable.
- Treat `packages/db/src/generated/` as derived output; keep it untracked and regenerate locally when needed.
- `pnpm --filter db build` copies Prisma client output into `packages/db/dist/generated/` so Turbo remote cache restores it in CI.
- Prisma commands (scoped to db):
  - `pnpm --filter db prisma:generate`
  - `pnpm --filter db prisma:validate`
  - `pnpm --filter db prisma:format`
  - `pnpm --filter db migrate:create-only`
  - `pnpm --filter db migrate:deploy`

## CI troubleshooting

- If `apps/api` fails with `Cannot find module '@sd/db/client'` and follow-on PrismaService type errors (`$connect`, `$disconnect`, model delegates like `prisma.lecture`): it usually means Prisma Client artifacts were not present in the workspace when TypeScript compiled.
- Fix: build `@sd/db` so it runs `prisma generate` and produces `packages/db/dist/generated/prisma/*` (Turbo restores `dist/**` from cache, but does not restore `src/generated/**`).

- If `@sd/ingest` fails in `turbo typecheck` with `Cannot find module '@sd/db/client'`: `typecheck` does not run `@sd/db build`, so `dist/generated/**` may be missing.
- Fix: make `@sd/db prisma:generate` also copy generated Prisma client into `packages/db/dist/generated/` (so `@sd/db/client` resolves during typecheck).

- If `apps/web` or `apps/api` fails with `Cannot find module '@sd/contracts'`: it means `@sd/contracts` hasn't been built yet.
- Fix: ensure `@sd/contracts` is built before dependent packages (check `prebuild`, `pretypecheck`, `pretest` scripts).

- If `pnpm typecheck` fails with missing exports from `@sd/contracts`: the contracts package typecheck/build hasn't run.
- Fix: run `pnpm --filter contracts build` first, or check that turbo pipeline builds contracts before typechecking dependent apps.

- If `apps/web` fails during `next build` with `Invalid WEB PUBLIC environment variables: NEXT_PUBLIC_API_URL Required`: the web app validated env at module import during prerender.
- Fix: make env parsing lazy (don’t parse at module top-level) and make pages tolerate missing API env during CI builds by catching fetch errors and returning empty view models.

- If a package build emits `@/` path aliases in `dist` output: add `tsc-alias` to that package and run it after `tsc` (example: `tsc -p tsconfig.build.json && tsc-alias -p tsconfig.build.json`).

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

## MCP usage policy

- Use Playwright MCP only for web UI verification.
- For mobile app work, use Playwright MCP only for responsive/mobile web-view checks in `apps/web`.
- Do not use Playwright MCP to validate native mobile views in `apps/mobile`; use Expo/native tooling for that.
