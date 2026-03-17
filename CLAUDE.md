# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Salafi Durus is an offline-first Islamic lecture platform. This is an architectural monorepo with strict boundaries.

## Commands

```bash
# Install
pnpm i

# Development
pnpm dev              # All apps
pnpm dev:api          # API only (NestJS)
pnpm dev:web          # Web only (Next.js)
pnpm dev:mobile       # Mobile only (Expo)

# Quality
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e         # Playwright (web)
pnpm test:prepush     # Pre-push gate

# Scoped execution
pnpm --filter api <script>
pnpm --filter web <script>
pnpm --filter mobile <script>
pnpm --filter @sd/db <script>

# Single test
pnpm --filter api test -- src/modules/topics/topics.service.spec.ts
pnpm --filter api test -- src/modules/topics/topics.service.spec.ts -t "test name"
pnpm --filter web test:e2e -- e2e/catalog.spec.ts
pnpm --filter web test:e2e -- --grep "test title"

# Database (scoped to @sd/db)
pnpm --filter @sd/db prisma:generate
pnpm --filter @sd/db migrate:create-only
pnpm --filter @sd/db migrate:deploy
```

## Architecture

### Monorepo Structure

- `apps/api` - NestJS backend (authoritative for all business logic)
- `apps/web` - Next.js client (public discovery + admin workflows)
- `apps/mobile` - Expo/React Native (offline-first listener experience)
- `packages/db` - Prisma schema and client
- `packages/contracts` - Shared TypeScript types and React Query hooks
- `packages/env` - Zod-validated environment config
- `packages/config` - Shared ESLint/TypeScript configs
- `packages/design-tokens` - Design system tokens
- `packages/ui-mobile` - Cross-platform UI primitives
- `docs/` - Authoritative documentation

### Dependency Rules (Strictly Enforced)

```
apps → packages        ✅ allowed
packages → packages    ✅ allowed
app → app              ❌ forbidden
package → app          ❌ forbidden
circular deps          ❌ forbidden
```

### Backend Authority

The backend is the single source of truth:

- All business rules, state transitions, and authorization live in `apps/api`
- Clients (web, mobile) are consumers only
- UI restrictions are UX convenience, not security
- Offline mode records intent only; backend authoritatively resolves state

### Backend Layering

`apps/api/src/` follows strict layers:

1. **Interface** - controllers, DTOs, guards
2. **Application** - use-case orchestration, transactions
3. **Domain** - invariants, transition rules
4. **Infrastructure** - DB, media, external adapters (no policy)

### Client Structure (web/mobile)

```
src/
├── app/       # Routing and composition only
├── features/  # Domain-facing UI, hooks, state
├── core/      # API client, auth, session
└── shared/    # Reusable primitives (no domain knowledge)
```

## Key Patterns

### Contracts Package

`@sd/contracts` contains hand-written, stable TypeScript types:

- When API response shapes change, manually update `packages/contracts/src/types/`
- All apps import shared types from `@sd/contracts`
- Exports: default (types), `./query` (React Query hooks), `./http` (HTTP client)

### Media Handling

- Store references/metadata only, never blobs in relational tables
- Use presigned uploads for media

### Offline Sync (Mobile)

- Outbox pattern for queued intent
- Backend reconciles on sync
- Offline never enables administrative actions

## Documentation Hierarchy

Read in order:

1. `docs/README.md` - Documentation index
2. `AGENT.md` (root) - Monorepo orientation
3. Target workspace `AGENT.md` (e.g., `apps/api/AGENT.md`)
4. `.github/copilot-instructions.md` - Quick reference

If code and docs conflict, reconcile intentionally.

## CI Notes

- Prisma Client must be generated before dependent packages can typecheck
- `@sd/contracts` must be built before apps that depend on it
- Turbo caches `dist/**` but not `src/generated/**`
- If `Cannot find module '@sd/db/client'`: run `pnpm --filter @sd/db build`
- If `Cannot find module '@sd/contracts'`: run `pnpm --filter @sd/contracts build`

## Quality Standards

- TypeScript strict mode required
- Prettier formatting mandatory (root `.prettierrc`; API uses single quotes)
- ESLint flat configs from `@sd/config/eslint/*`
- Conventional Commits enforced (commitlint)
- File naming: kebab-case
- Prefer `unknown` over `any`

## Custom Commands

**Project-specific:**

- `/guardrails` - Architectural rules and documentation reference
- `/stitch` - Image-to-code workflow with repo adaptation
- `/ease-migrate` - Migrate Reanimated animations to EaseView
- `/turbo` - Turborepo monorepo guidance

**Framework guides (with context7 doc lookup):**

- `/nestjs` - NestJS backend patterns and testing
- `/nextjs` - Next.js App Router and data fetching
- `/expo` - Expo Router, offline sync, animations
- `/prisma` - Schema, migrations, queries

## MCP Servers

- `context7` - Documentation lookup for any library
- `next-devtools` - Next.js dev server integration (errors, metadata, logs)
- `prisma` - Database workflow tools
