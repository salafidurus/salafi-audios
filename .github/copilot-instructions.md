# Copilot instructions — Salafi Durus (monorepo)

Purpose: give an AI coding agent just-enough context to be immediately productive and safe in this repository.

## Quick orientation ✅

- Monorepo layout: `apps/` (api/web/mobile) + `packages/` (shared libraries) + `docs/` (source of truth).
- Canonical docs: `docs/implementation-guide/*` and the `AGENT.md` files at repo root and in each package/app (e.g. `apps/api/AGENT.md`). Read them first.

## Non-negotiable guardrails 🛡️

- **Backend is authoritative.** Business rules, auth, and state transitions live in `apps/api`.
- **Authorization only on backend.** UI checks are UX-only, never security.
- **Offline = intent only.** Mobile records user intent in an outbox; backend authoritatively resolves state.
- **Media are references, not blobs.** Use presigned uploads; DB stores media keys/metadata (`packages/db/prisma`).
- **Monorepo boundaries:** apps → packages only. No app-to-app imports; avoid circular deps.

## Backend layering & examples 🔁

- Follow Interface → Application → Domain → Infrastructure (see `apps/api/AGENT.md` and `apps/api/src`).
- OpenAPI & clients: `apps/api/openapi.*`, `apps/api/openapi.json`, `packages/api-client/orval.config.cjs`.
- DB & migrations: `packages/db/prisma/schema.prisma`, migrations in `packages/db/prisma/migrations/`.
- Client structure: `apps/web/AGENT.md` (app/core/features/shared) and `apps/mobile/AGENT.md` (outbox/sync patterns).

## Developer workflows — exact commands ▶️

- Install: `pnpm i`
- Run all in dev: `pnpm dev`
- Run single app: `pnpm dev:api`, `pnpm dev:web`, `pnpm dev:mobile`
- Build / Test / Lint / Typecheck: `pnpm build`, `pnpm test`, `pnpm lint`, `pnpm typecheck` (use Turbo filters to scope)
- API-only tests: `pnpm --filter api test`
- E2E (Playwright): `pnpm test:e2e`
- OpenAPI + client generation: `pnpm openapi` then `pnpm codegen` (or `pnpm contract`)

## Codegen & generated artifacts ⚠️

- Never modify generated clients by hand. If types are wrong, fix the OpenAPI source in `apps/api` and regenerate (`pnpm openapi && pnpm codegen`).
- Orval config lives at `packages/api-client/orval.config.cjs` and targets `../../apps/api/openapi.json`.
- Generated client output: `packages/api-client/generated/` (treat as derived).
- Generated DB output: `packages/db/src/generated/` (derived, ignored, and never committed).

## Testing guidance 🔍

- Priorities: domain invariants, authorization boundaries, and state transitions (publish/archive/replace/reorder).
- Unit & domain tests: `apps/api/test` (jest). Integration/E2E: `apps/web/e2e` (Playwright).
- If OpenAPI changes, update server OpenAPI, run `pnpm openapi && pnpm codegen`, and adjust client tests accordingly.

## Repo & CI conventions 🔁

- Commits: Conventional Commits enforced via commitlint + Husky.
- Branches/Deploys: protected branches map to deployment environments (`main` -> development, `preview` -> preview, `production` -> production); deployments are branch-based via PR merges (see `README.md` and `docs/implementation-guide/10-environments-and-configuration.md`).

## Safety & non-goals ⚠️

- Never introduce server-side behavior into clients that bypass backend checks.
- Don’t commit secrets or credentials; environment config is isolated per environment.
- Avoid refactors that cross the monorepo layering rules without an explicit design change in `docs/`.

## Common change workflow (example) 💡

Add `POST /lectures/:id/publish` →

1. Implement domain + application logic in `apps/api/src` and add domain tests (`apps/api/test`).
2. Add/update API interface and OpenAPI (`apps/api/openapi.*`).
3. Run `pnpm openapi && pnpm codegen` to update clients.
4. Add integration/e2e tests as needed and run `pnpm test`.

---

**Where to look for examples** 📁

- Backend layering & rules: `apps/api/AGENT.md`, `apps/api/src`
- Mobile offline/outbox: `apps/mobile/AGENT.md`, `apps/mobile/src/core/sync`
- Web structure: `apps/web/AGENT.md` (`app/`, `core/`, `features/`, `shared/`)
- DB modeling & migrations: `packages/db/AGENT.md`, `packages/db/prisma`

If anything here is unclear or you want a short, focused expansion (tests, migrations, OpenAPI, or CI), tell me which section to expand and I’ll iterate. ✅
