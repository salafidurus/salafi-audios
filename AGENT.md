# AGENT.md - Salafi Durus Monorepo

This repository is one system. The monorepo is an enforcement tool, not a convenience.

## Repository agent file policy

This repository uses a single canonical instruction source per directory:

- `AGENT.md` is the only file that should be authored or edited by agents or humans.
- `AGENTS.md`, `CLAUDE.md`, and `GEMINI.md` are compatibility aliases only.
- Never manually create, edit, or delete `AGENTS.md`, `CLAUDE.md`, or `GEMINI.md` directly, except when restoring aliases through the repository normalization script.
- Any instruction change must be made in the sibling `AGENT.md` file only.
- If an alias file is missing or broken, recreate the symlink/junction; do not fork its contents.

### Skill location policy

- The canonical shared skills directory is `/.agents/skills/`.
- Add new shared skills only under `/.agents/skills/<skill-name>/`.
- Do not add shared skills under `/.opencode/skills/`, `/.claude/skills/`, or `/.gemini/skills/`; those paths are compatibility links only.
- If a tool-specific skills path exists, treat it as a mirror/alias of `/.agents/skills/`, not as an authoring location.

### Nested scope policy

- Directory-local `AGENT.md` files refine behavior for that subtree only.
- When working in a subdirectory, read in order: root `AGENT.md` -> nearest local `AGENT.md`.
- Never duplicate instructions across alias files; update the relevant `AGENT.md` instead.

### Change discipline

Before editing agent instructions or skills:

1. Check whether you are touching an alias path (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.opencode/skills`, `.claude/skills`, `.gemini/skills`).
2. If yes, stop and redirect the change to the canonical path:
   - instructions -> `AGENT.md`
   - skills -> `/.agents/skills/`
3. Prefer fixing links over editing alias content.

### Alias repair

- If an alias file or tool-specific skills folder is missing, broken, or replaced with a real file/folder, repair it by rerunning the repository normalization script from the repo root.
- Preferred repair command: `./sync-agents.ps1`
- Do not manually rewrite alias files to match `AGENT.md`; restore the link instead.
- Do not create new canonical skill locations outside `/.agents/skills/`.

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

- `packages/core-db` - Database schema and client
- `packages/core-env` - Environment variable schemas
- `packages/core-i18n` - Internationalization config and keys
- `packages/core-contracts` - Shared TypeScript contracts (DTOs, types, query hooks)
- `packages/design-tokens` - Design tokens (colors, spacing, radius, typography) — authoritative source
- `packages/shared` - Shared UI primitives, hooks, and generic utilities
- `packages/core-*` - Shared platform infrastructure (auth, API, config, styling)
- `packages/feature-*` - Domain feature packages with platform-specific UI and data wiring
- `packages/util-config` - Shared lint/build config
- `packages/util-ingest` - Content ingestion

**Note:** `apps/web` transpiles the new `@sd/shared`, `@sd/core-*`, and `@sd/feature-*` packages directly in `next.config.ts`.

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
- DB: `pnpm --filter core-db <script>`
- Env: `pnpm --filter core-env <script>`
- I18n: `pnpm --filter core-i18n <script>`
- Contracts: `pnpm --filter core-contracts <script>`
- Design tokens: `pnpm --filter design-tokens <script>`
- Shared UI: `pnpm --filter @sd/shared <script>`
- Core packages: `pnpm --filter @sd/core-* <script>`
- Feature packages: `pnpm --filter @sd/feature-* <script>`
- Config: `pnpm --filter util-config <script>`
- Ingest: `pnpm --filter util-ingest <script>`

Turbo grouped scripts:

- `pnpm lint:api+web`, `pnpm lint:api+mobile`
- `pnpm typecheck:api+web`, `pnpm typecheck:api+mobile`
- `pnpm test:api+web`, `pnpm test:api+mobile`

## Single-test quick reference

- Jest file (API): `pnpm --filter api test -- src/modules/topics/topics.service.spec.ts`
- Jest file (Web): `pnpm --filter web test -- src/path/to/file.test.tsx`
- Jest file (Mobile): `pnpm --filter mobile test -- src/path/to/file.test.tsx`
- Jest file (DB): `pnpm --filter core-db test -- src/path/to/file.spec.ts`
- Jest by name: `pnpm --filter api test -- src/modules/topics/topics.service.spec.ts -t "returns topic by slug"`
- Jest watch file (API): `pnpm --filter api test:watch -- src/modules/topics/topics.service.spec.ts`
- Playwright file: `pnpm --filter web test:e2e -- e2e/catalog.spec.ts`
- Playwright by title: `pnpm --filter web test:e2e -- --grep "catalog list"`

## Contract and data discipline

- API is a stable contract with explicit intent-driven actions (publish/archive/reorder/replace).
- Shared types are defined in `packages/core-contracts` - hand-written and stable.
- All apps (api, web, mobile) import shared types from `@sd/core-contracts`.
- When API response shapes change, update `packages/core-contracts/src/types/` manually.
- Never hand-edit generated code; this package eliminates codegen friction.

## DB and migration discipline

- Primary DB stores authoritative relational state.
- Keep media as references only.
- Keep analytics/events out of authoritative core tables.
- Treat migrations as first-class and reviewable.
- Treat `packages/core-db/src/generated/` as derived output; keep it untracked and regenerate locally when needed.
- `pnpm --filter core-db build` copies Prisma client output into `packages/core-db/dist/generated/` so Turbo remote cache restores it in CI.
- Prisma commands (scoped to db):
  - `pnpm --filter core-db prisma:generate`
  - `pnpm --filter core-db prisma:validate`
  - `pnpm --filter core-db prisma:format`
  - `pnpm --filter core-db migrate:create-only`
  - `pnpm --filter core-db migrate:deploy`

## CI troubleshooting

- If `apps/api` fails with `Cannot find module '@sd/core-db/client'` and follow-on PrismaService type errors (`$connect`, `$disconnect`, model delegates like `prisma.lecture`): it usually means Prisma Client artifacts were not present in the workspace when TypeScript compiled.
- Fix: build `@sd/core-db` so it runs `prisma generate` and produces `packages/core-db/dist/generated/prisma/*` (Turbo restores `dist/**` from cache, but does not restore `src/generated/**`).

- If `@sd/util-ingest` fails in `turbo typecheck` with `Cannot find module '@sd/core-db/client'`: `typecheck` does not run `@sd/core-db build`, so `dist/generated/**` may be missing.
- Fix: make `@sd/core-db prisma:generate` also copy generated Prisma client into `packages/core-db/dist/generated/` (so `@sd/core-db/client` resolves during typecheck).

- If `apps/web` or `apps/api` fails with `Cannot find module '@sd/core-contracts'`: it means `@sd/core-contracts` hasn't been built yet.
- Fix: ensure `@sd/core-contracts` is built before dependent packages (check `prebuild`, `pretypecheck`, `pretest` scripts).

- If `pnpm typecheck` fails with missing exports from `@sd/core-contracts`: the contracts package typecheck/build hasn't run.
- Fix: run `pnpm --filter core-contracts build` first, or check that turbo pipeline builds contracts before typechecking dependent apps.

- If `apps/web` fails during `next build` with `Invalid WEB PUBLIC environment variables: NEXT_PUBLIC_API_URL Required`: the web app validated env at module import during prerender.
- Fix: make env parsing lazy (don’t parse at module top-level) and make pages tolerate missing API env during CI builds by catching fetch errors and returning empty view models.

- If a package build emits `@/` path aliases in `dist` output: add `tsc-alias` to that package and run it after `tsc` (example: `tsc -p tsconfig.build.json && tsc-alias -p tsconfig.build.json`).

## Markdown authoring rules

All AGENT.md and documentation files are linted with markdownlint. Two rules are commonly violated:

- **MD040** — Every fenced code block must declare a language. Use ` ```typescript `, ` ```bash `, ` ```text `, ` ```file `, etc. A bare ` ``` ` will fail the commit hook.
- **MD032** — Bullet lists must have a blank line before and after them. A heading or paragraph directly followed by `- item` with no blank line will fail.

## TDD policy

This repo follows Test-Driven Development. The rule is non-negotiable:

**Write a failing test before writing implementation.** No exceptions for new service methods, store actions, utility functions, or auth boundaries.

### What to test

| Layer                                                                          | Test type                        | Where                                                    |
| ------------------------------------------------------------------------------ | -------------------------------- | -------------------------------------------------------- |
| API service methods (domain invariants, NotFoundException, status transitions) | Unit — mock the repo             | `apps/api/src/modules/<module>/<module>.service.spec.ts` |
| Auth guard and permission checks                                               | Unit + Integration               | `apps/api/src/modules/auth/`                             |
| Domain store actions (Zustand)                                                 | Unit — reset store between tests | `packages/domain-*/src/**/*.spec.ts`                     |
| Pure utility / helper functions                                                | Unit                             | co-located `.spec.ts` next to the source file            |
| Route/contract smoke tests                                                     | Unit                             | `packages/core-contracts/src/routes.spec.ts`             |
| Critical user flows (auth redirect, public page load)                          | E2E — Playwright                 | `apps/web/e2e/`                                          |

### What NOT to test

- Presentational React/RN components with no logic.
- Trivial getters, setters, or passthrough methods.
- Framework-provided behavior (NestJS DI wiring, Expo Router navigation).
- Third-party library internals.

### TDD workflow

```text
Red → Green → Commit (test + impl together)
```

1. Write the failing test — describe the behavior, not the implementation.
2. Run it: confirm it fails with the expected error, not a setup error.
3. Write the minimal code to make it pass.
4. Run again: confirm it passes.
5. Commit: test and implementation in the same commit.

**Bug fixes always start with a failing test** that reproduces the bug. The test is the regression guard.

### Test file placement

- API: `apps/api/src/modules/<module>/<module>.service.spec.ts` (co-located)
- Web E2E: `apps/web/e2e/<flow>.spec.ts`
- Packages: co-located `.spec.ts` next to the source file being tested
- Integration tests: `apps/api/src/modules/<module>/<module>.integration.spec.ts`

### Coverage targets (minimum)

| Area                       | Target                                                |
| -------------------------- | ----------------------------------------------------- |
| API service methods        | All public methods tested                             |
| Auth/permission boundaries | Every endpoint category (public, auth, admin) covered |
| Domain store actions       | All actions in `domain-*/src/store/*.store.ts`        |
| Route constants            | `routes.spec.ts` smoke test exists                    |

### Running tests

- All: `pnpm test`
- API only: `pnpm --filter api test`
- Single file: `pnpm --filter api test -- src/modules/scholars/scholars.service.spec.ts`
- Watch: `pnpm --filter api test:watch -- src/modules/scholars/scholars.service.spec.ts`
- E2E: `pnpm test:e2e`

## Quality and style

- Prettier is mandatory; root `.prettierrc` is authoritative.
- API has a local Prettier override (`apps/api/.prettierrc`: single quotes).
- ESLint flat configs come from `@sd/util-config/eslint/*`.
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
