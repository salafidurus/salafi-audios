# Tech Stack

**Language**: TypeScript (strict mode required)
**Build Tool**: Turbo (monorepo orchestration)
**Package Manager**: Bun
**Runtime**: Node.js (backend), Browser (web), React Native (mobile)

## Framework Versions

- Backend: NestJS (with Prisma ORM)
- Web: Next.js (SSR, App Router, CSS-responsive)
- Native: React Native + Expo (offline-first, no Expo Web)
- Auth: better-auth + @better-auth/expo (pinned to exact same version - NO CARET)
- DB: Prisma with PostgreSQL

## Key Dependencies

- Design tokens: `packages/design-tokens` (CSS variables, typography, colors)
- Contracts: `packages/core-contracts` (shared DTOs, query hooks)
- i18n: `packages/core-i18n` (internationalization keys)
- Auth: `packages/core-auth` (auth state, better-auth client)
- Domain: `packages/domain-*` (content, playback, progress, search, etc.)

## Critical Pins

- `better-auth` and `@better-auth/expo`: **exact same version** in workspace catalog (no caret)
- Each pins `@better-fetch/fetch` exactly (e.g. v1.6.18 → v1.3.0)
- Version skew installs two copies, breaks native typecheck
- Renovate ignores these - bump manually, in lockstep

## Build Outputs

- Web: `apps/web/.next/`
- API: `apps/api/dist/`
- Native: `apps/native/ios/` + `apps/native/android/`
- DB: `packages/core-db/dist/generated/` (Prisma artifacts)

## File Encoding

UTF-8, CRLF line endings (Windows)
