# Salafi Durus Monorepo - Core Reference

**Project**: Educational content platform (Quran scholars, lectures, live sessions)
**Repo**: Monorepo with strict boundaries (apps cannot import from apps)
**Key Principle**: Backend authority is absolute; clients are consumers

## Structure

- `apps/api` - NestJS backend (authoritative)
- `apps/web` - Next.js web client (SSR, CSS-responsive, no React Native Web)
- `apps/native` - React Native + Expo (offline-first, iOS + Android)
- `packages/*` - Shared libraries (DB, contracts, design tokens, domain state)

## Boundaries

- apps → packages: allowed
- packages → packages: allowed
- app → app: **FORBIDDEN**
- package → app: **FORBIDDEN**
- Circular deps: **FORBIDDEN**

## Key Memories

- `mem:tech_stack` - Languages, frameworks, versions, build tools
- `mem:conventions` - Code style, file naming, design patterns
- `mem:suggested_commands` - Project commands (dev, test, lint, build, etc.)
- `mem:task_completion` - Verification checklist for completed tasks
- `mem:web/admin-refactor` - Admin interface refactoring plan + progress

## Contract Discipline

- Shared types in `packages/core-contracts/src/types/`
- Hand-written, stable (no codegen)
- All apps import from `@sd/core-contracts`
- Update contracts when API response shapes change

## DB & Migrations

- Primary DB: Prisma (PostgreSQL)
- Migrations are first-class, reviewable artifacts
- Keep media as references only (no blobs)
- `packages/core-db` manages schema + client
