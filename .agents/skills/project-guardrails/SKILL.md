---
name: project-guardrails
description: |
  NON-NEGOTIABLE architectural rules for Salafi Durus. LOAD THIS SKILL when: starting any
  implementation, modifying backend/API, changing data models, working with auth, handling
  offline/sync, creating new files, or any code changes. Contains critical guardrails that
  must never be violated.
---

# Project Guardrails

These rules are NON-NEGOTIABLE. Violations will be rejected.

## Mandatory Pre-Work Checks

- **Before implementing ANY change**, read the **workspace-specific AGENT.md** file in the directory you're modifying (e.g., `apps/api/AGENT.md`, `apps/web/AGENT.md`, `apps/mobile/AGENT.md`, `packages/*/AGENT.md`). These contain critical workspace rules, quality expectations, and command references specific to that package.
- **Consult relevant documentation** from `docs/` as indicated in the table below before starting work on that topic.

## Documentation Quick Reference

| If working on...                                  | Read this file first   |
| ------------------------------------------------- | ---------------------- |
| Getting started / overall system                  | `docs/README.md`       |
| Product vision, philosophy, and guardrails        | `docs/prd.md`          |
| Monorepo layout, dependencies, package boundaries | `docs/architecture.md` |
| Backend architecture, API design, and auth        | `docs/api.md`          |
| Database schemas, Prisma, and media management    | `docs/database.md`     |
| Mobile app structure and offline synchronization  | `docs/mobile.md`       |
| Web app structure and SEO strategy                | `docs/web.md`          |
| Environments, configuration, and CI/CD            | `docs/dev-ops.md`      |
| Current roadmap and phase progress                | `docs/AGENT.md`        |

## Backend Authority

- Backend (`apps/api`) is the SINGLE SOURCE OF TRUTH for all business rules.
- Authorization is enforced EXCLUSIVELY on the backend.
- UI/client restrictions are UX only, NEVER security.
- If business rules appear in mobile/web clients, the implementation is WRONG.

## Monorepo Boundaries (Feature-Sliced Architecture)

```
apps/      → deployable applications (api, web, mobile)
packages/  → shared libraries (shared, core, feature, contracts, db)
docs/      → authoritative documentation
```

### Package Map

- **`@sd/shared`**: Cross-app utilities only (no platform-specific UI). Platform primitives live in each app's `src/shared/`.
- **`@sd/core-*`**: Foundational infrastructure (auth, api, config, styles, i18n, env, db, contracts).
- **`@sd/domain-content`**: Data hooks for lectures, scholars, series, feed, library.
- **`@sd/domain-account`**: Data hooks for user profile and auth state.
- **`@sd/domain-live`**: Data hooks for live sessions and channels.
- **`@sd/domain-playback`**: Playback engine and player state (Zustand + hooks).
- **`@sd/domain-progress`**: Progress tracking state (Zustand + hooks).
- **`@sd/domain-search`**: Search and quick-browse hooks.
- **`@sd/design-tokens`**: Design tokens — authoritative source.
- **`@sd/util-config`**: Shared lint/build config.
- **`@sd/util-ingest`**: Content ingestion tooling.

**Dependency rules:**

- `apps/*` → `packages/*` ✓
- `packages/*` → `packages/*` ✓
- `apps/*` → `apps/*` ✗ FORBIDDEN
- `packages/*` → `apps/*` ✗ FORBIDDEN
- Circular dependencies ✗ FORBIDDEN

## App Structure

### Mobile (`apps/mobile/src/`)

- **`app/`**: Routing ONLY — Expo Router. Imports screen components from `../features` or `../shared`.
- **`features/<name>/`**: One folder per feature. Contains `components/`, `hooks/`, `screens/`, `utils/`.
- **`shared/`**: Primitives used across 2+ features within the mobile app.

Platform extension rules:

- `.tsx` — base native (iOS + Android)
- `.ios.tsx` — iOS-only (only when behavior truly diverges)
- `.android.tsx` — Android-only (only when behavior truly diverges)

### Web (`apps/web/src/`)

- **`app/`**: Routing, layouts, and server components ONLY — Next.js App Router. Imports from `../features` or `../shared`.
- **`features/<name>/`**: One folder per feature. Contains `components/`, `hooks/`, `screens/`, `utils/`.
- **`shared/`**: Primitives used across 2+ features within the web app.
- Web is Next.js only — no React Native Web, no Expo Web.

Platform extension rules:

- `.tsx` — base, fully CSS-responsive (default — use this unless layout truly diverges)
- `.desktop.tsx` — desktop-only layout variant
- `.mobile.tsx` — mobile-web layout variant

### Backend (`apps/api/src/`)

- **Interface**: Controllers, DTOs, Auth guards.
- **Application**: Use-case orchestration, transactions.
- **Domain**: Invariants, transition rules.
- **Infrastructure**: DB, media, adapters (no policy).

## Offline Rules (Mobile)

- Clients record INTENT, not authority.
- Offline writes use OUTBOX pattern.
- Backend resolves conflicts deterministically.
- Offline mode NEVER enables admin actions.

## Data & Media

- Primary DB stores authoritative relational state ONLY.
- Media = references/metadata, NEVER blobs in DB.
- All uploads use **Presigned URLs** coordinated by the backend.

## API Contract

- `@sd/contracts` is the source of truth for all API interactions.
- Update types manually in `packages/contracts/src/types/` when backend response shapes change.

## Design Token Usage Guide: `spacing`, `radius`, and `typography`

Use tokens by **semantic role** from `packages/design-tokens`.

- **Spacing**: Use `layout` for pages/sections, `component` for padding/gaps, `scale` as a fallback.
- **Radius**: Use `component` first (card, chip, panel), `scale` as a fallback.
- **Typography**: Use by purpose (display, title, body, label, caption), not by size.

## TDD — Non-Negotiable Workflow

Every code change follows this exact sequence. No exceptions.

1. **Write the failing test** — describe behavior, not implementation.
2. **Run it** — confirm it fails with the expected error (not a setup error).
3. **Write minimal implementation** to make it pass.
4. **Run it again** — confirm it passes.
5. **Run all tests** — confirm nothing else broke (`pnpm test`).
6. **Commit** — test and implementation in the same commit.

Test everything: screens, components, hooks, utils, stores, services, guards.
The only exceptions: framework DI wiring, third-party library internals, generated artifacts.

Co-locate test files next to the source file:

- `SomeComponent.tsx` → `SomeComponent.spec.tsx`
- `use-some-hook.ts` → `use-some-hook.spec.ts`
- `some.screen.tsx` → `some.screen.spec.tsx`

## Quick Commands

```bash
pnpm dev              # All apps (api, web, native)
pnpm dev:api          # Backend only
pnpm dev:web          # Web only
pnpm dev:native       # Native only
pnpm build            # Build all
pnpm lint             # Lint all
pnpm typecheck        # Typecheck all
pnpm test             # Test all
pnpm format           # Format codebase
```
