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

| If working on...                                   | Read this file first     |
| -------------------------------------------------- | ------------------------ |
| Getting started / overall system                   | `docs/README.md`         |
| Product vision, philosophy, and guardrails         | `docs/prd.md`            |
| Monorepo layout, dependencies, package boundaries  | `docs/architecture.md`   |
| Backend architecture, API design, and auth         | `docs/api.md`            |
| Database schemas, Prisma, and media management     | `docs/database.md`       |
| Mobile app structure and offline synchronization   | `docs/mobile.md`         |
| Web app structure and SEO strategy                 | `docs/web.md`            |
| Environments, configuration, and CI/CD             | `docs/dev-ops.md`        |
| Current roadmap and phase progress                 | `docs/AGENT.md`          |

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
- **`@sd/shared`**: Reusable UI primitives and generic utilities.
- **`@sd/core-*`**: Foundational infrastructure (auth, api, config, styles).
- **`@sd/feature-*`**: Domain-specific packages (e.g., `feature-auth`, `feature-search`). Features are "smart", handling their own data fetching and UI variants across platforms.
- **`@sd/contracts`**: Shared TypeScript contracts (DTOs, types) - the API boundary.
- **`@sd/db`**: Database schema and client.
- **`@sd/env`**: Environment variable validation.

**Dependency rules:**
- `apps/*` → `packages/*` ✓
- `packages/*` → `packages/*` ✓
- `apps/*` → `apps/*` ✗ FORBIDDEN
- `packages/*` → `apps/*` ✗ FORBIDDEN
- Circular dependencies ✗ FORBIDDEN

## App Structure

### Mobile (`apps/mobile/src/`)
- **`app/`**: Routing and high-level composition ONLY (Expo Router).
- Logic and UI variants are consumed from `@sd/feature-*`, `@sd/core-*`, and `@sd/shared`.

### Web (`apps/web/src/`)
- **`app/`**: Routing, layouts, and server components ONLY (Next.js App Router).
- Logic and UI variants are consumed from `@sd/feature-*`, `@sd/core-*`, and `@sd/shared`.

### Backend (`apps/api/src/`)
- **Interface**: Controllers, DTOs, Auth guards.
- **Application**: Use-case orchestration, transactions.
- **Domain**: Invariants, transition rules.
- **Infrastructure**: DB, media, adapters (no policy).

## Platform-Specific Extensions
Use extensions to colocate logic for a single feature:
- `.desktop.web.tsx`: Next.js (Desktop Web)
- `.mobile.web.tsx`: Expo Web (Mobile Web)
- `.native.tsx`: Expo Native (iOS/Android)
- `.web.tsx`: Generic web implementation
- `.tsx`: Generic base implementation

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

## Quick Commands
```bash
pnpm dev              # All apps (api, web, mobile)
pnpm dev:api          # Backend only
pnpm dev:web          # Web only
pnpm dev:mobile       # Mobile only
pnpm build            # Build all
pnpm lint             # Lint all
pnpm typecheck        # Typecheck all
pnpm test             # Test all
pnpm format           # Format codebase
```
