# Copilot instructions — Salafi Durus (monorepo)

Purpose: give an AI coding agent just-enough context to be immediately productive and safe in this repository.

## Quick orientation ✅

- Monorepo layout: `apps/` (api/web/mobile) + `packages/` (shared libraries) + `docs/` (source of truth).
- Canonical docs: the standard top-level docs in `docs/*.md` and the `AGENT.md` files at repo root and in each package/app (e.g. `apps/api/AGENT.md`). Start with `docs/README.md`.

## Non-negotiable guardrails 🛡️

- **Backend is authoritative.** Business rules, auth, and state transitions live in `apps/api`.
- **Authorization only on backend.** UI checks are UX-only, never security.
- **Offline = intent only.** Mobile records user intent in an outbox; backend authoritatively resolves state.
- **Media are references, not blobs.** Use presigned uploads; DB stores media keys/metadata (`packages/db/prisma`).
- **Monorepo boundaries:** apps → packages only. No app-to-app imports; avoid circular deps.

## Backend layering & examples 🔁

- Follow Interface → Application → Domain → Infrastructure (see `apps/api/AGENT.md` and `apps/api/src`).
- Shared contracts: `packages/contracts/src/types/*` and query helpers in `packages/contracts/src/query/`.
- DB & migrations: `packages/db/prisma/schema.prisma`, migrations in `packages/db/prisma/migrations/`.
- Client structure: `apps/web/AGENT.md` (app/core/features/shared) and `apps/mobile/AGENT.md` (outbox/sync patterns).

## Developer workflows — exact commands ▶️

- Install: `pnpm i`
- Run all in dev: `pnpm dev`
- Run single app: `pnpm dev:api`, `pnpm dev:web`, `pnpm dev:mobile`
- Build / Test / Lint / Typecheck: `pnpm build`, `pnpm test`, `pnpm lint`, `pnpm typecheck` (use Turbo filters to scope)
- API-only tests: `pnpm --filter api test`
- E2E (Playwright): `pnpm test:e2e`
- Shared contract updates: edit `packages/contracts` manually when backend response shapes change, then build/typecheck the package.

## Codegen & generated artifacts ⚠️

- Never hand-edit generated Prisma client output in `packages/db/src/generated/`; regenerate it from the Prisma schema.
- Shared API types are hand-written in `packages/contracts`; if types are wrong, fix them there and update backend usage to match.

## Testing guidance 🔍

- Priorities: domain invariants, authorization boundaries, and state transitions (publish/archive/replace/reorder).
- Unit & domain tests: `apps/api/test` (jest). Integration/E2E: `apps/web/e2e` (Playwright).
- If backend response shapes change, update `packages/contracts` and adjust client tests accordingly.

## Repo & CI conventions 🔁

- Commits: Conventional Commits enforced via commitlint + Husky.
- Branches/Deploys: protected branches map to deployment environments (`main` -> development, `preview` -> preview, `production` -> production); deployments are branch-based via PR merges (see `README.md` and `docs/dev-ops.md`).

## Safety & non-goals ⚠️

- Never introduce server-side behavior into clients that bypass backend checks.
- Don’t commit secrets or credentials; environment config is isolated per environment.
- Avoid refactors that cross the monorepo layering rules without an explicit design change in `docs/`.

## Common change workflow (example) 💡

Add `POST /lectures/:id/publish` →

1. Implement domain + application logic in `apps/api/src` and add domain tests (`apps/api/test`).
2. Add or update the API interface in `apps/api/src` and keep request/response DTOs explicit.
3. Update `packages/contracts` to keep shared response types in sync.
4. Add integration/e2e tests as needed and run `pnpm test`.

---

**Where to look for examples** 📁

- Backend layering & rules: `apps/api/AGENT.md`, `apps/api/src`
- Mobile offline/outbox: `apps/mobile/AGENT.md`, `docs/mobile.md`
- Web structure: `apps/web/AGENT.md` (`app/`, `core/`, `features/`, `shared/`)
- DB modeling & migrations: `packages/db/AGENT.md`, `packages/db/prisma`

If anything here is unclear or you want a short, focused expansion (tests, migrations, contracts, or CI), tell me which section to expand and I’ll iterate. ✅
