# AGENTS.md - Agent Execution Guide

This guide is for coding agents operating in this monorepo.

## Read order (required)

1. `docs/README.md`
2. `AGENT.md` (repo root)
3. Target workspace `AGENT.md` (for example `apps/api/AGENT.md`)
4. `.github/copilot-instructions.md`
   If code and docs conflict, treat docs as authoritative and reconcile intentionally.

## Core system rules

- Backend is authoritative.
- Authorization is backend-only (UI checks are UX only).
- Offline means intent queueing, not authoritative state changes.
- Media are references/metadata, not DB blobs.
- Monorepo boundaries:
  - apps -> packages allowed
  - packages -> packages allowed
  - app -> app forbidden
  - package -> app forbidden
  - no circular dependencies

## Repo map

- Package manager: pnpm (`pnpm@10.x`)
- Task runner: Turbo
- Apps: `apps/api`, `apps/web`, `apps/mobile`
- Packages: `packages/db`, `packages/env`, `packages/i18n`, `packages/auth-shared`, `packages/api-client`, `packages/config`

## Root commands

- Install: `pnpm i`
- Dev all: `pnpm dev`
- Dev single app: `pnpm dev:api`, `pnpm dev:web`, `pnpm dev:mobile`
- Build: `pnpm build`
- Lint: `pnpm lint`
- Typecheck: `pnpm typecheck`
- Test: `pnpm test`
- E2E: `pnpm test:e2e`
- Prepush suite: `pnpm test:prepush`
- Format: `pnpm format`
- Format check: `pnpm format:check`

## Scoped commands

Use pnpm filters:

- API: `pnpm --filter api <script>`
- Web: `pnpm --filter web <script>`
- Mobile: `pnpm --filter mobile <script>`
- DB: `pnpm --filter @sd/db <script>`
- Env: `pnpm --filter @sd/env <script>`
- I18n: `pnpm --filter @sd/i18n <script>`
- Auth shared: `pnpm --filter @sd/auth-shared <script>`
- API client: `pnpm --filter @sd/api-client <script>`
  Turbo convenience scripts:
- `pnpm lint:api+web`, `pnpm lint:api+mobile`
- `pnpm typecheck:api+web`, `pnpm typecheck:api+mobile`
- `pnpm test:api+web`, `pnpm test:api+mobile`

## Single-test quick reference

Jest one file:

- `pnpm --filter api test -- src/modules/topics/topics.service.spec.ts`
- `pnpm --filter web test -- src/path/to/file.test.tsx`
- `pnpm --filter mobile test -- src/path/to/file.test.tsx`
- `pnpm --filter @sd/db test -- src/path/to/file.spec.ts`
  Jest one test name:
- `pnpm --filter api test -- src/modules/topics/topics.service.spec.ts -t "returns topic by slug"`
- `pnpm --filter web test -- -t "renders heading"`
  Jest watch targeted:
- `pnpm --filter api test:watch -- src/modules/topics/topics.service.spec.ts`
  Playwright (web E2E):
- One file: `pnpm --filter web test:e2e -- e2e/catalog.spec.ts`
- By title: `pnpm --filter web test:e2e -- --grep "catalog list"`
- One project: `pnpm --filter web test:e2e -- --project chromium`

## Contract, codegen, and DB

- OpenAPI from API: `pnpm openapi`
- Generate API client: `pnpm codegen`
- Combined: `pnpm contract`
- Never hand-edit `packages/api-client/generated/`
- If generated types are wrong, fix API/OpenAPI source first, then regenerate.
  Prisma (`packages/db`):
- `pnpm --filter @sd/db prisma:generate`
- `pnpm --filter @sd/db prisma:validate`
- `pnpm --filter @sd/db prisma:format`
- `pnpm --filter @sd/db migrate:create-only`
- `pnpm --filter @sd/db migrate:deploy`

## Code style and quality

Formatting:

- Prettier is mandatory.
- Root `.prettierrc`: double quotes, semicolons, trailing commas, width 100.
- API override `apps/api/.prettierrc`: `singleQuote: true`.
  Linting:
- ESLint flat config from `@sd/config/eslint/*`.
- `no-console` is an error by default; exceptions are explicit.
- Ignore generated/build artifacts (`dist`, `build`, `.next`, `.expo`, `coverage`, `generated`).
  Types and boundaries:
- TypeScript strict mode is enabled (`strict: true`, `noEmit: true`).
- Prefer explicit return types for exported services/repos.
- Prefer `unknown` over `any`, then narrow.
- Validate boundaries (`zod`, class-validator DTOs).
- Keep monorepo and feature-layer dependency rules strict.
  Naming and errors:
- File names use kebab-case.
- DTO classes use `PascalCase` + `Dto`.
- Keep API errors structured and consistent.
- Fail safely and explicitly; avoid silent failures.

## Hooks and commit rules

- Conventional Commits are enforced by commitlint.
- Pre-commit: `pnpm lint:staged`.
- Pre-push: `pnpm test:prepush`.

## Cursor and Copilot rules

- No `.cursorrules` found.
- No `.cursor/rules/` directory found.
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
- Do not commit secrets/env values.
- Do not hand-edit generated client output.
- Update docs when architecture intent/guarantees change.
