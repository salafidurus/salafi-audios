# System Architecture

## 1. High-Level Overview

Salafi Durus is a single system delivered through multiple clients around one authoritative backend.

### Core Components

- **API (`apps/api`)**: authoritative backend for business rules, access control, content lifecycle, and media coordination.
- **Web (`apps/web`)**: public discovery surface plus authenticated editorial and account flows.
- **Mobile (`apps/native`)**: listening-focused client with local-first sync and offline audio downloads.
- **Database**: PostgreSQL via Prisma for authoritative relational state.
- **Storage and CDN**: object storage for media, delivered separately from relational state.

## 2. Architectural Intent

- Centralize authority in the backend.
- Keep clients thin in policy and rich in presentation.
- Share contracts and reusable primitives without collapsing platform boundaries.
- Isolate media and analytics from core authoritative state.
- Preserve a structure that can evolve without re-architecture.

## 3. Monorepo Structure

The monorepo exists because the web app, mobile app, and backend are one coordinated product, not separate systems.

### Top-Level Areas

- `apps/api` — authoritative backend core
- `apps/web` — public/admin web client (Next.js, CSS-responsive — no React Native Web)
- `apps/native` — offline-first native client (iOS + Android — no Expo Web)
- `packages/*` — shared libraries: core infra, domain state, design tokens, cross-app utilities
- `docs/` — product + implementation authority

### App Source Structure

Both apps follow this layout:

```text
src/
  app/      ← routing ONLY — imports screen components from ../features or ../shared
  features/ ← one folder per feature; each owns components, hooks, screens, utils
  shared/   ← components and hooks used across 2+ features within this app
  core/     ← platform bootstrap (providers, config, auth, styles)
```

### Platform File Extensions

Mobile (`apps/native`): `.tsx` (base), `.ios.tsx` (iOS-only), `.android.tsx` (Android-only).

Web (`apps/web`): `.tsx` (base, CSS-responsive), `.desktop.tsx` (desktop-only), `.mobile.tsx` (mobile-web).

### Package Map

- `packages/core-db` — Database schema and client
- `packages/core-env` — Environment variable schemas
- `packages/core-i18n` — Internationalization config and keys
- `packages/core-contracts` — Shared TypeScript contracts (DTOs, types, query hooks)
- `packages/core-api` — Platform-agnostic API client infrastructure
- `packages/core-sync` — Local-first repository/sync primitives (entity store, persisted outbox, sync engine, last-write-wins conflict resolution) shared by `domain-audio` (progress) and `domain-content` (saved/library)
- `packages/design-tokens` — Design tokens (colors, spacing, radius, typography) — authoritative source
- `packages/domain-content` — Lectures, scholars, series, feed, library data hooks
- `packages/domain-account` — User profile and auth state hooks
- `packages/domain-audio` — Playback engine, player state, and progress tracking (queue management, stream resolution, local-first progress sync) — one unified package, not split by playback/progress
- `packages/domain-search` — Search and quick-browse hooks

Shared lint/TS config lives at the repo root (`tsconfig.base.json`, `tsconfig.packages.json`, `tsconfig.nest.json`, `eslint.config.base.mjs`, `eslint.config.packages.mjs`, `eslint.config.nest.mjs`). Apps extend/compose these; `next`/`expo` specifics are inlined into `apps/web` and `apps/native`.

### Package Roles

- **`@sd/core-*`**: Foundational infrastructure (auth, api, config, styles, i18n, env, db, contracts, sync). `core-styles`, `core-config`, and `core-env` have been dissolved — styling bootstrap, environment config, and env validation now live in each app's `src/core/` directory (or the consuming package's `src/env.ts`).
- **`@sd/domain-*`**: Shared data and state hooks organized by bounded context (`domain-content`, `domain-account`, `domain-audio`, `domain-search`).
- **`@sd/design-tokens`**: Authoritative visual tokens.

## 4. Dependency and Boundary Rules

- Apps may depend on packages.
- Packages may depend on packages.
- Apps must not depend on other apps.
- Packages must not import from apps.
- Backend-only logic must never leak into client bundles.
- Circular dependencies across package boundaries are forbidden.

These rules are enforcement rules, not style preferences.

## 5. Platform Responsibilities

### Mobile

- Playback-focused listening experience.
- Local-first sync for personal state (progress, saved/library) and offline audio downloads, reconciled to the backend via a persisted outbox — see [mobile.md](./mobile.md).
- No backend authority, no hidden business rules.
- Expo Router owns route structure through a tab-based main app boundary under `apps/native/src/app/(tabs)`.
- The bottom navigation surface is package-owned custom chrome layered on top of real Expo Router tabs, with a subsection bar for in-tab route switching.

### Web

- Public discovery, SEO, and shareable routes.
- Authenticated account and editorial surfaces.
- Pure consumer of backend APIs.

### Backend

- Authentication, authorization, validation, and use-case orchestration.
- Content visibility, lifecycle rules, and conflict resolution.
- Mediation of database, storage, and analytics integrations.

### Infrastructure

- Durable storage, media delivery, deployment, and secret management.
- No policy ownership.

## 6. Communication Model

- Clients communicate with the backend via stable HTTP contracts.
- The backend owns authoritative decisions and state transitions.
- Media uploads and delivery are mediated through backend-issued references, not direct client authority.
- Analytics are isolated so they can scale without becoming part of core domain truth.

## 7. Platform-Specific Implementation Pattern

The repo uses platform-specific module extensions to colocate a feature while keeping implementations explicit:

### App-Level Extensions

| Context               | Extension      | When                           |
| --------------------- | -------------- | ------------------------------ |
| Mobile (shared)       | `.tsx`         | iOS + Android                  |
| Mobile (iOS-only)     | `.ios.tsx`     | Behavior truly diverges        |
| Mobile (Android-only) | `.android.tsx` | Behavior truly diverges        |
| Web (shared)          | `.tsx`         | Fully CSS-responsive (default) |
| Web (desktop)         | `.desktop.tsx` | Desktop-only layout            |
| Web (mobile-web)      | `.mobile.tsx`  | Mobile-web layout              |

### Shared Package Extensions

| Context           | Extension                              | When                 |
| ----------------- | -------------------------------------- | -------------------- |
| Platform-agnostic | `.ts` / `.tsx`                         | Works everywhere     |
| Mobile native     | `.native.ts` / `.native.tsx`           | iOS + Android        |
| Web (shared)      | `.web.ts` / `.web.tsx`                 | Desktop + mobile web |
| Desktop web only  | `.desktop.web.ts` / `.desktop.web.tsx` | Desktop-only impl    |
| Mobile web only   | `.mobile.web.ts` / `.mobile.web.tsx`   | Mobile web only      |

### Package Entrypoint Rules

- Use plain `index.ts` only when the package public surface is fully platform-agnostic and there is no real web/native split.
- If a package has distinct platform behavior, use `index.web.ts` and `index.native.ts` as the only public entrypoints.
- Intermediate barrel files inside `src/` are not allowed. Export only from the package root entrypoint files.

### Package Structure Rules

- Use explicit folders such as `components/`, `screens/`, `hooks/`, `utils/`, `types/`, `api/`, and `store/`.
- Do not leave platform implementation files loose in `src/` if they belong to one of those categories.
- Route-level or app-level assembly belongs in apps, not inside low-level shared packages.

### Dependency Rules

- Every package must declare the external libraries it imports directly.
- Do not rely on app-level installs to satisfy package-level imports.
- If a package imports `next/*`, `expo-*`, `better-auth/*`, `clsx`, or any other non-workspace module, that package manifest must declare it in `dependencies` or `peerDependencies`.

## 8. Navigation Architecture

### Mobile App Shell

The mobile app uses Expo Router `Tabs` for top-level sections, with a custom tab bar and subsection bar supplied by `apps/native/src/features/navigation/`.

- Top-level sections are real tab roots.
- Subsections are route-owned within each tab stack.
- Tab chrome and section constants live in the app-local `features/navigation/` slice.

This keeps Expo Router responsible for tab state, route structure, and screen lifecycle while preserving a product-specific navigation surface.

### Web Navigation

The shipped web app currently preserves the same high-level section model and section re-entry behavior, but it still uses its own web navigation surface (sidebar) rather than the mobile shell implementation as a shared source of truth.

## 9. Technology Stack

- Monorepo: Bun Workspaces, Turborepo
- Backend: NestJS, Prisma, PostgreSQL (with native UUIDv4 primary keys and pg_trgm GIN indexing)
- Web: Next.js, React, CSS Modules + CSS custom properties (design tokens)
- Mobile: Expo, React Native, Expo Router, react-native-unistyles
- Shared: TypeScript, Zod, TanStack Query
