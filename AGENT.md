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

## Content nomenclature

Canonical vocabulary for the content hierarchy (full detail: `docs/nomenclature.md`).
Content is described by two axes — **Format** (the DB primitive) and **Placement**
(top-level vs nested). Each cell has one name; do not overload "lecture"/"series":

| DB primitive | Condition              | Name           | Top-level? |
| :----------- | :--------------------- | :------------- | :--------- |
| `Collection` | always root            | **Collection** | yes        |
| `Series`     | `collectionId == null` | **Series**     | yes        |
| `Series`     | `collectionId != null` | **Module**     | no         |
| `Lecture`    | `seriesId == null`     | **Single**     | yes        |
| `Lecture`    | `seriesId != null`     | **Lesson**     | no         |

A **Listing** is any top-level unit (Collection / Series / Single);
`ListingFormat = "collection" | "series" | "single"`. Module and Lesson are never
Listings. Users browse Listings in the **Catalog** ("Library" is the separate
saved/in-progress surface). DB columns, the `title` field, and route paths keep
the primitive names.

## Image-to-code workflow

- For design image requests, use root skill `google-stitch` with a Stitch-first flow.
- Sequence is mandatory: image -> Stitch baseline -> repo adaptation.
- Adaptation must apply `docs/`, root/workspace `AGENT.md`, and `.github/copilot-instructions.md`.
- Place generated code only in the target workspace (`apps/web` or `apps/native`) and keep monorepo boundaries intact.

## Brand assets

- Web favicon/app icons: `apps/web/src/app/favicon.ico`, `apps/web/public/icons/*`
- Web logos: `apps/web/public/logo/*`
- Mobile app icon/splash: `apps/native/assets/images/icon.png`, `apps/native/assets/images/splash-icon.png`
- Mobile logos: `apps/native/assets/images/logo/*`
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
- `better-auth` and `@better-auth/expo` are pinned to the **exact same version** in the
  workspace catalog (no caret). They each pin `@better-fetch/fetch` exactly (e.g.
  `better-auth@1.6.18` → `1.3.0`, `1.6.19` → `1.3.1`); any version skew installs two
  `@better-fetch/fetch` copies whose `BetterFetch` types differ and breaks the native auth
  client plugin typecheck. Always bump the two together. Note Renovate ignores
  `better-auth`/`@better-auth/expo` for this reason — bump them manually, in lockstep.

## Repo layout

- `apps/api` - authoritative backend core
- `apps/web` - public/admin web client (Next.js, CSS-responsive — no React Native Web)
- `apps/native` - offline-first native client (iOS + Android — no Expo Web)
- `packages/*` - shared libraries: core infra, domain state, design tokens, cross-app utilities
- `docs/` - product + implementation authority

### App source structure

Both apps follow this layout:

```text
src/
  app/        ← routing ONLY — imports screen components from ../features or ../shared
  features/   ← one folder per feature; each owns components, hooks, screens, utils
  shared/     ← components and hooks used across 2+ features within this app
```

### Platform file extensions

Mobile (`apps/native`):

- `.tsx` — base native component (iOS + Android)
- `.ios.tsx` — iOS-only override (only when behavior truly diverges)
- `.android.tsx` — Android-only override (only when behavior truly diverges)

Web (`apps/web`):

- `.tsx` — base component, fully responsive via CSS (default)
- `.desktop.tsx` — desktop-only layout variant (only when truly needed)
- `.mobile.tsx` — mobile-web layout variant (only when truly needed)

### Package map

- `packages/core-db` - Database schema and client
- `packages/core-env` - Environment variable schemas
- `packages/core-i18n` - Internationalization config and keys
- `packages/core-contracts` - Shared TypeScript contracts (DTOs, types, query hooks)
- `packages/design-tokens` - Design tokens (colors, spacing, radius, typography) — authoritative source
- `packages/core-*` - Shared platform infrastructure (auth, API, config, styling)
- `packages/domain-content` - Lectures, scholars, series, feed, library data hooks
- `packages/domain-account` - User profile and auth state hooks
- `packages/domain-live` - Live session and channel hooks
- `packages/domain-playback` - Playback engine and player state
- `packages/domain-progress` - Progress tracking state
- `packages/domain-search` - Search and quick-browse hooks
- `packages/util-ingest` - Content ingestion

Shared lint/TS config lives at the repo root (`tsconfig.base.json`, `tsconfig.packages.json`,
`tsconfig.nest.json`, `eslint.config.base.mjs`, `eslint.config.packages.mjs`,
`eslint.config.nest.mjs`). Apps extend/compose these; `next`/`expo` specifics are inlined
into `apps/web` and `apps/native`.

## Commands (root)

- Install: `bun install`
- Dev (all apps): `bun run dev`
- Dev backend: `bun run dev:api`
- Dev frontend: `bun run dev:web`, `bun run dev:native`
- Native build: `bun run dev:native:build:android` (no clean), `bun run dev:native:clean-build:android` (prebuild --clean first); `:ios` variants exist
- Build: `bun run build`
- Lint: `bun run lint`
- Typecheck: `bun run typecheck`
- Test: `bun run test`
- E2E: `bun run test:e2e`
- Prepush suite: `bun run test:prepush`
- Ingest content: `bun run ingest:content`
- Remove ingested: `bun run ingest:remove`
- Format: `bun run format`
- Format check: `bun run format:check`

## Scoped execution

- API: `bun run --filter api <script>`
- Web: `bun run --filter web <script>`
- Native: `bun run --filter native <script>`
- DB: `bun run --filter @sd/core-db <script>`
- Env: `bun run --filter @sd/core-env <script>`
- I18n: `bun run --filter @sd/core-i18n <script>`
- Contracts: `bun run --filter @sd/core-contracts <script>`
- Design tokens: `bun run --filter @sd/design-tokens <script>`
- Core packages: `bun run --filter @sd/core-* <script>`
- Domain packages: `bun run --filter @sd/domain-* <script>`
- Ingest: `bun run --filter @sd/util-ingest <script>`

## Single-test quick reference

- Jest file (API): `bun run --filter api test -- src/modules/topics/topics.service.spec.ts`
- Jest file (Native): `bun run --filter native test -- src/path/to/file.spec.tsx`
- Jest file (DB): `bun run --filter @sd/core-db test -- src/path/to/file.spec.ts`
- Vitest file (Web): `bun run --filter web test src/path/to/file.spec.tsx`
- Jest by name: `bun run --filter api test -- src/modules/topics/topics.service.spec.ts -t "returns topic by slug"`
- Jest watch file (API): `bun run --filter api test:watch -- src/modules/topics/topics.service.spec.ts`
- Playwright file: `bun run --filter web test:e2e -- e2e/catalog.spec.ts`
- Playwright by title: `bun run --filter web test:e2e -- --grep "catalog list"`

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
- `bun run --filter @sd/core-db build` copies Prisma client output into `packages/core-db/dist/generated/` so Turbo remote cache restores it in CI.
- Prisma commands (scoped to db):
  - `bun run --filter @sd/core-db prisma:generate`
  - `bun run --filter @sd/core-db prisma:validate`
  - `bun run --filter @sd/core-db prisma:format`
  - `bun run --filter @sd/core-db migrate:create-only`
  - `bun run --filter @sd/core-db migrate:deploy`

## CI troubleshooting

- If `apps/api` fails with `Cannot find module '@sd/core-db/client'` and follow-on PrismaService type errors (`$connect`, `$disconnect`, model delegates like `prisma.lecture`): it usually means Prisma Client artifacts were not present in the workspace when TypeScript compiled.
- Fix: build `@sd/core-db` so it runs `prisma generate` and produces `packages/core-db/dist/generated/prisma/*` (Turbo restores `dist/**` from cache, but does not restore `src/generated/**`).

- If `@sd/util-ingest` fails in `turbo typecheck` with `Cannot find module '@sd/core-db/client'`: `typecheck` does not run `@sd/core-db build`, so `dist/generated/**` may be missing.
- Fix: make `@sd/core-db prisma:generate` also copy generated Prisma client into `packages/core-db/dist/generated/` (so `@sd/core-db/client` resolves during typecheck).

- If `apps/web` or `apps/api` fails with `Cannot find module '@sd/core-contracts'`: it means `@sd/core-contracts` hasn't been built yet.
- Fix: ensure `@sd/core-contracts` is built before dependent packages (check `prebuild`, `pretypecheck`, `pretest` scripts).

- If `bun run typecheck` fails with missing exports from `@sd/core-contracts`: the contracts package typecheck/build hasn't run.
- Fix: run `bun run --filter @sd/core-contracts build` first, or check that turbo pipeline builds contracts before typechecking dependent apps.

- If `apps/web` fails during `next build` with `Invalid WEB PUBLIC environment variables: NEXT_PUBLIC_API_URL Required`: the web app validated env at module import during prerender.
- Fix: make env parsing lazy (don’t parse at module top-level) and make pages tolerate missing API env during CI builds by catching fetch errors and returning empty view models.

- If a package build emits `@/` path aliases in `dist` output: add `tsc-alias` to that package and run it after `tsc` (example: `tsc -p tsconfig.build.json && tsc-alias -p tsconfig.build.json`).

## Markdown authoring rules

All AGENT.md and documentation files are linted with markdownlint. Two rules are commonly violated:

- **MD040** — Every fenced code block must declare a language. Use ` ```typescript `, ` ```bash `, ` ```text `, ` ```file `, etc. A bare ` ``` ` will fail the commit hook.
- **MD032** — Bullet lists must have a blank line before and after them. A heading or paragraph directly followed by `- item` with no blank line will fail.

## TDD policy

Strict TDD. No exceptions. Red → Green → Commit.

1. Write the failing test. Confirm it fails with the expected error (not a setup error).
2. Write minimal code to pass. Confirm pass. Run all tests in the workspace — confirm no regressions.
3. Commit test and implementation together.

Test everything: screens, components, hooks, utils, stores, services. Exceptions: framework DI wiring (NestJS, Expo Router), third-party internals, generated artifacts, presentational-only components with no logic.

Tests co-locate with source (`.spec.ts` / `.spec.tsx`). All public API service methods, auth/permission boundaries, and domain store actions must be covered.

## Quality and style

- Prettier is mandatory; root `.prettierrc` is authoritative.
- API has a local Prettier override (`apps/api/.prettierrc`: single quotes).
- ESLint flat configs come from the root `eslint.config.{base,packages,nest}.mjs` presets
  (apps/web and apps/native inline their next/expo specifics).
- `no-console` is an error unless explicitly allowed.
- TypeScript strict mode is required (`strict: true`, `noEmit: true`).
- Prefer explicit return types for exported services/repos.
- Prefer `unknown` over `any`, then narrow.
- File naming uses kebab-case.
- DTO naming uses `PascalCase` + `Dto`.
- Keep API errors structured and consistent.

## Commits and hooks

- Conventional Commits are enforced (`commitlint`).
- Pre-commit runs `bun run lint:staged`.
- Pre-push runs `bun run test:prepush`.

## Documentation standards

- `AGENT.md` = behavior rules for contributors and agents. `README.md` = structure/purpose for humans. Do not duplicate between them.
- Add inline comments only for non-obvious constraints: CI cache logic, auth invariants, offline/outbox semantics, generated-code behavior, platform-entrypoint dispatch.
- Update `docs/` when architectural boundaries, API contracts (`packages/core-contracts`), or offline patterns change. Docs and code must not drift — update in the same commit.

## Safety checklist

- Do not bypass backend authorization with client logic.
- Do not introduce app-to-app imports.
- Do not commit secrets or env values.
- Do not hand-edit generated API client output.
- Update docs when architecture intent or guarantees change.

## Agent worktree policy

- All AI agents must work inside a git worktree.
- Agents must either create a new worktree in the `.worktrees` (or `.worktree`) folder, or ask the user if they should use one of the available worktrees or create a new one.

## MCP usage policy

- Use Playwright MCP only for web UI verification.
- For mobile app work, use Playwright MCP only for responsive/mobile web-view checks in `apps/web`.
- Do not use Playwright MCP to validate native mobile views in `apps/native`; use Expo/native tooling for that.
