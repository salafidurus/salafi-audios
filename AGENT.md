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
  pnpm-workspace catalog (no caret). They each pin `@better-fetch/fetch` exactly (e.g.
  `better-auth@1.6.18` → `1.3.0`, `1.6.19` → `1.3.1`); any version skew installs two
  `@better-fetch/fetch` copies whose `BetterFetch` types differ and breaks the native auth
  client plugin typecheck. Always bump the two together. Note Dependabot ignores
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
- `packages/util-config` - Shared lint/build config
- `packages/util-ingest` - Content ingestion

## Commands (root)

- Install: `pnpm i`
- Dev: `pnpm dev`
- Dev one app: `pnpm dev:api`, `pnpm dev:web`, `pnpm dev:native`
- Native build: `pnpm dev:native:build` (no clean), `pnpm dev:native:clean-build` (prebuild --clean first); `:android`/`:ios` variants exist
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
- Native scaffold: `pnpm --filter native <script>`
- DB: `pnpm --filter core-db <script>`
- Env: `pnpm --filter core-env <script>`
- I18n: `pnpm --filter core-i18n <script>`
- Contracts: `pnpm --filter core-contracts <script>`
- Design tokens: `pnpm --filter design-tokens <script>`
- Shared UI: `pnpm --filter @sd/shared <script>`
- Core packages: `pnpm --filter @sd/core-* <script>`
- Domain packages: `pnpm --filter @sd/domain-* <script>`
- Config: `pnpm --filter util-config <script>`
- Ingest: `pnpm --filter util-ingest <script>`

Turbo grouped scripts:

- `pnpm lint:api+web`, `pnpm lint:api+mobile`
- `pnpm lint:api+native`
- `pnpm typecheck:api+web`, `pnpm typecheck:api+mobile`
- `pnpm typecheck:api+native`
- `pnpm test:api+web`, `pnpm test:api+mobile`
- `pnpm test:api+native`

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

This repo follows strict Test-Driven Development. **No exceptions.**

### The workflow (non-negotiable)

1. Write the failing test — describe the behavior, not the implementation.
2. Run it: confirm it fails with the expected error, not a setup error.
3. Write the minimal code to make it pass.
4. Run it again: confirm it passes.
5. Run all tests: confirm nothing else broke.
6. Commit: test and implementation in the same commit.

### What to test

Test everything: screens, components, hooks, utils, stores, guards, services.
The only exceptions are:

- Framework-provided behavior (NestJS DI wiring, Expo Router navigation internals).
- Third-party library internals.
- Generated code artifacts.

Testing everything prevents duplication — you will not write the same test twice if
everything is already covered.

### Test placement

| Location                                   | Test file                     |
| ------------------------------------------ | ----------------------------- |
| `apps/native/src/features/<f>/screens/`    | co-located `.spec.tsx`        |
| `apps/native/src/features/<f>/components/` | co-located `.spec.tsx`        |
| `apps/native/src/features/<f>/hooks/`      | co-located `.spec.ts`         |
| `apps/web/src/features/<f>/screens/`       | co-located `.spec.tsx`        |
| `apps/web/src/features/<f>/components/`    | co-located `.spec.tsx`        |
| `apps/web/src/features/<f>/hooks/`         | co-located `.spec.ts`         |
| `apps/native/src/shared/`                  | co-located `.spec.tsx`        |
| `apps/web/src/shared/`                     | co-located `.spec.tsx`        |
| `packages/domain-*/src/`                   | co-located `.spec.ts`         |
| `apps/api/src/modules/<m>/`                | co-located `.service.spec.ts` |

### Running tests

- All: `pnpm test`
- Mobile only: `pnpm --filter mobile test`
- Web only: `pnpm --filter web test`
- API only: `pnpm --filter api test`
- Single file: `pnpm --filter mobile test -- src/features/feed/screens/feed.screen.spec.tsx`
- Watch: `pnpm --filter api test:watch -- src/modules/scholars/scholars.service.spec.ts`
- E2E: `pnpm test:e2e`

### What NOT to test

- Presentational React/RN components with no logic.
- Trivial getters, setters, or passthrough methods.
- Framework-provided behavior (NestJS DI wiring, Expo Router navigation).
- Third-party library internals.

### Coverage targets (minimum)

| Area                       | Target                                                |
| -------------------------- | ----------------------------------------------------- |
| API service methods        | All public methods tested                             |
| Auth/permission boundaries | Every endpoint category (public, auth, admin) covered |
| Domain store actions       | All actions in `domain-*/src/store/*.store.ts`        |
| Route constants            | `routes.spec.ts` smoke test exists                    |

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

## Documentation standards

### When to add workspace README.md

A workspace-level `README.md` is required when:

- The workspace is directly executable or deployable.
- The workspace has its own build, test, or runtime expectations.
- The workspace exposes a public internal API used by multiple other workspaces.
- The workspace has platform-specific entrypoints.
- The workspace contains non-obvious codegen, caching, CI, or build constraints.

### When inline comments are expected

Add comments to files containing:

- CI cache logic or workflow conditionals.
- Unusual TypeScript or build configuration.
- Source-vs-dist export map decisions.
- Platform-specific entrypoint indirection.
- Generated-code constraints.
- Backend authority or security invariants.
- Offline/outbox semantics.
- Non-obvious query or cache invalidation behavior.

### When inline comments should NOT be added

Do not add comments to:

- Straightforward presentational components.
- Simple DTO or type definitions.
- Obvious utility functions.
- Boilerplate config that mirrors defaults.

### When file-level documentation is expected

Add a file-level comment block to:

- CI workflow files that contain non-obvious job dependencies or cache strategy.
- Root scripts whose purpose is not clear from the file name alone.
- Complex `tsconfig` files that deviate from the base in non-trivial ways.
- Package entrypoints that perform platform selection (e.g., `.web.ts` vs `.native.ts`
  dispatch logic that is not self-evident).

### When docs updates are mandatory

Update `docs/` when making any of the following changes:

- Architectural boundary change (new package, new app, changed dependency direction).
- API surface change that affects the shared contract in `packages/core-contracts`.
- Mobile offline or outbox pattern change.
- Web app structure change (new routing pattern, new shared primitive layer).

Docs and code must not drift. If a change makes `docs/` inaccurate, update `docs/` in the
same commit.

### AGENT.md vs README.md

- `AGENT.md` defines contributor and AI agent behavior rules.
- `README.md` explains structure, purpose, and operational guidance for humans.
- These must not duplicate each other.

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
