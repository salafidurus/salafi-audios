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

| If working on...                                   | Read this file first                                               |
| -------------------------------------------------- | ------------------------------------------------------------------ |
| Getting started / overall system                   | `docs/README.md`                                                   |
| Product purpose, audience, vision                  | `docs/product-overview/01-vision-and-purpose.md`                   |
| Monorepo layout, dependencies, package boundaries  | `docs/implementation-guide/01-monorepo-structure.md`               |
| Backend coding, layers, modules, authorization     | `docs/implementation-guide/02-backend-architecture.md`             |
| Database schemas, Prisma, data modeling            | `docs/implementation-guide/03-database-and-data-modeling.md`       |
| API endpoints, contracts, OpenAPI                  | `docs/implementation-guide/04-api-design.md`                       |
| Authentication, permissions, roles                 | `docs/implementation-guide/05-authentication-and-authorization.md` |
| File uploads, media storage, CDN/presigned         | `docs/implementation-guide/06-media-upload-and-delivery.md`        |
| Mobile app structure, offline-first design         | `docs/implementation-guide/07-mobile-application-structure.md`     |
| Offline sync, outbox patterns, conflict resolution | `docs/implementation-guide/08-offline-sync-mechanics.md`           |
| Web app (Next.js) structure, feature folders       | `docs/implementation-guide/09-web-application-structure.md`        |
| Environment variables, config validation           | `docs/implementation-guide/10-environments-and-configuration.md`   |
| Scope control, timeline phases, non-goals          | `docs/implementation-guide/11-guardrails-and-non-goals.md`         |
| Execution phases, what's in/out per phase          | `docs/timeline/*.md`                                               |

## Backend Authority

- Backend (`apps/api`) is the SINGLE SOURCE OF TRUTH for all business rules
- Authorization is enforced EXCLUSIVELY on the backend
- UI/client restrictions are UX only, NEVER security
- If business rules appear in mobile/web clients, the implementation is WRONG

## Monorepo Boundaries

```
apps/      → applications (api, web, mobile)
packages/  → shared libraries
docs/      → authoritative documentation
```

**Dependency rules:**

- `apps/*` → `packages/*` ✓
- `packages/*` → `packages/*` ✓
- `apps/*` → `apps/*` ✗ FORBIDDEN
- `packages/*` → `apps/*` ✗ FORBIDDEN
- Circular dependencies ✗ FORBIDDEN

## App Structure

### Mobile (`apps/mobile/src/`)

```
app/      → routing/composition ONLY
features/ → domain UI/hooks
core/     → API/auth/playback/sync
shared/   → pure primitives
```

- Business logic MUST NOT live in `app/`
- Direction: features → core → shared

### Web (`apps/web/src/`)

```
app/      → routing/layout/metadata
features/ → domain UI logic
core/     → API client, auth state, caching
shared/   → reusable primitives
```

- Web is a CLIENT of backend, not a backend itself
- `app/api/` restricted to thin proxies/webhooks only
- Never duplicate backend business logic

### Backend (`apps/api/src/`)

```
Interface     → controllers, DTOs, auth guards
Application   → use-case orchestration, transactions
Domain        → invariants, transition rules
Infrastructure → DB, media, adapters (no policy)
```

- Never leak persistence into controllers
- Never put business decisions in infrastructure

## Offline Rules (Mobile)

- Clients record INTENT, not authority
- Offline writes use OUTBOX pattern
- Backend resolves conflicts deterministically
- Offline mode NEVER enables admin actions
- No alternative sync mechanisms

## Data & Media

- Primary DB stores authoritative relational state ONLY
- Media = references/metadata, NEVER blobs in DB
- Analytics/events OUT of authoritative core tables

## API Contract

- `packages/api-client/generated/` is DERIVED - never hand-edit
- Fix source in `apps/api` OpenAPI, then regenerate: `pnpm contract`

## Scope Control

- Check CURRENT Timeline phase before implementing
- Features outside current phase must WAIT
- Scope creep = defect, not productivity

## What Gets Rejected

- "Temporary" architectural shortcuts
- Client-side business rule enforcement
- Logic duplication across platforms
- Undocumented behavior
- Over-engineering without justification

## Quick Commands

```bash
pnpm dev              # All apps
pnpm dev:api          # Backend only
pnpm dev:web          # Web only
pnpm dev:mobile       # Mobile only
pnpm build            # Build all
pnpm lint             # Lint all
pnpm typecheck        # Typecheck all
pnpm test             # Test all
pnpm contract         # Regenerate API client
```
