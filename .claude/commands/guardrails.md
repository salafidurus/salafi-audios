# Project Guardrails

These rules are NON-NEGOTIABLE. Violations will be rejected.

## Pre-Work Requirements

Before implementing ANY change:

1. Read the workspace-specific `AGENT.md` file in the directory you're modifying
2. Consult relevant documentation from `docs/` (see table below)

## Documentation Quick Reference

| Working on...                         | Read first                                                         |
| ------------------------------------- | ------------------------------------------------------------------ |
| Overall system                        | `docs/README.md`                                                   |
| Product purpose, vision               | `docs/product-overview/01-vision-and-purpose.md`                   |
| Monorepo layout, dependencies         | `docs/implementation-guide/01-monorepo-structure.md`               |
| Backend coding, layers, authorization | `docs/implementation-guide/02-backend-architecture.md`             |
| Database schemas, Prisma              | `docs/implementation-guide/03-database-and-data-modeling.md`       |
| API endpoints, contracts              | `docs/implementation-guide/04-api-design.md`                       |
| Authentication, permissions           | `docs/implementation-guide/05-authentication-and-authorization.md` |
| File uploads, media storage           | `docs/implementation-guide/06-media-upload-and-delivery.md`        |
| Mobile app structure                  | `docs/implementation-guide/07-mobile-application-structure.md`     |
| Offline sync, outbox patterns         | `docs/implementation-guide/08-offline-sync-mechanics.md`           |
| Web app (Next.js) structure           | `docs/implementation-guide/09-web-application-structure.md`        |
| Environment variables                 | `docs/implementation-guide/10-environments-and-configuration.md`   |
| Scope control, timeline               | `docs/implementation-guide/11-guardrails-and-non-goals.md`         |
| Execution phases                      | `docs/timeline/*.md`                                               |

## Core Rules

### Backend Authority

- Backend (`apps/api`) is the SINGLE SOURCE OF TRUTH
- Authorization is enforced EXCLUSIVELY on the backend
- UI restrictions are UX only, NEVER security
- Business rules in clients = WRONG implementation

### Monorepo Boundaries

- `apps/*` → `packages/*` allowed
- `packages/*` → `packages/*` allowed
- `apps/*` → `apps/*` FORBIDDEN
- `packages/*` → `apps/*` FORBIDDEN
- Circular dependencies FORBIDDEN

### App Structure

**Mobile** (`apps/mobile/src/`):

- `app/` → routing/composition ONLY
- `features/` → domain UI/hooks
- `core/` → API/auth/playback/sync
- `shared/` → pure primitives

**Web** (`apps/web/src/`):

- `app/` → routing/layout/metadata
- `features/` → domain UI logic
- `core/` → API client, auth state
- `shared/` → reusable primitives

**Backend** (`apps/api/src/`):

- Interface → controllers, DTOs, guards
- Application → use-case orchestration
- Domain → invariants, transitions
- Infrastructure → DB, adapters (no policy)

### Offline Rules (Mobile)

- Clients record INTENT, not authority
- Offline writes use OUTBOX pattern
- Backend resolves conflicts
- Offline mode NEVER enables admin actions

### Data & Media

- Media = references/metadata, NEVER blobs in DB
- Analytics OUT of authoritative core tables

### Design Tokens

Use tokens by semantic role:

- `spacing.layout.*` for page/section spacing
- `spacing.component.*` for component padding/gaps
- `radius.component.*` for UI element radii
- Typography by purpose (display, title, body, label, caption)

## What Gets Rejected

- "Temporary" architectural shortcuts
- Client-side business rule enforcement
- Logic duplication across platforms
- Undocumented behavior
- Features outside current Timeline phase
