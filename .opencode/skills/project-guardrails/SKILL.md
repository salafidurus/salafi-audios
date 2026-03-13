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

## Design Token Usage Guide: `spacing`, `radius`, and `typography`

Use tokens by **semantic role**, not by guessing what looks nice.

Prefer:

- consistent rhythm
- reuse of existing semantic tokens
- predictable hierarchy
- fewer arbitrary one-off values

### 1. `spacing` tokens

Core rule:

- `spacing.layout.*` = page and section-level spacing
- `spacing.component.*` = component padding and common UI gaps
- `spacing.scale.*` = low-level spacing steps for fine control

Prefer `layout` and `component` first. Use `scale` when no semantic token fits.

#### Spacing decision rules

- page padding X -> `spacing.layout.pageX`
- page padding Y -> `spacing.layout.pageY`
- section gap -> `spacing.layout.sectionY`
- card padding -> `spacing.component.cardPadding`
- panel padding -> `spacing.component.panelPadding`
- chip padding -> `spacing.component.chipX` + `spacing.component.chipY`
- standard gap -> `spacing.component.gapMd`

#### Spacing anti-patterns

- do not use arbitrary values when a token exists
- do not use `layout.*` inside small components
- do not use component padding as section spacing

### 2. `radius` tokens

Core rule:

- `radius.component.*` = preferred radius for named UI patterns
- `radius.scale.*` = low-level radius steps
- `radius.scale.full` = fully rounded / pill / circular edges

Prefer `component` first. Use `scale` when no component token fits.

#### Radius decision rules

- chip/tag/badge -> `radius.component.chip`
- standard card -> `radius.component.card`
- small panel/popover -> `radius.component.panelSm`
- large panel/modal/drawer -> `radius.component.panel`

#### Radius anti-patterns

- do not mix many radii in one component family
- do not use `full` unless shape should read as pill/circle
- do not invent custom radius values outside tokens

### 3. `typography` tokens

Core rule:

- display = hero, prominent headline text
- title = section and card headings
- body = readable content text
- label = compact UI labels and controls
- caption = supporting metadata
- xs = very small supporting text only

Use typography by purpose, not by size.

#### Typography rules

- prefer full variant tokens over manual font property composition
- do not use display styles for ordinary UI
- do not use xs for standard readable text

### Practical defaults

- page shell padding -> `spacing.layout.pageX` + `spacing.layout.pageY`
- section gap -> `spacing.layout.sectionY`
- card -> padding `spacing.component.cardPadding`, radius `radius.component.card`, title `typography.titleMd`, body `typography.bodyMd`, metadata `typography.caption`
- panel -> padding `spacing.component.panelPadding`, radius `radius.component.panel`, title `typography.titleLg`
- chip -> padding `spacing.component.chipX` + `chipY`, radius `radius.component.chip`, text `typography.labelMd`

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
