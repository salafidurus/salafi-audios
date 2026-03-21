# System Architecture

## 1. High-Level Overview

Salafi Durus is a single system delivered through multiple clients around one authoritative backend.

### Core Components

- **API (`apps/api`)**: authoritative backend for business rules, permissions, content lifecycle, and media coordination.
- **Web (`apps/web`)**: public discovery surface plus authenticated editorial and account flows.
- **Mobile (`apps/mobile`)**: listening-focused client optimized for continuity and eventual offline support.
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

- `apps/`: deployable applications.
- `packages/`: shared libraries, contracts, config, and tokens.
- `docs/`: authoritative cross-cutting documentation.

### Package Roles

- **`@sd/shared`**: generic UI primitives and utilities.
- **`@sd/core-*`**: cross-cutting infrastructure such as auth, API, config, and styling.
- **`@sd/feature-*`**: domain-oriented feature packages for reusable app behavior.
- **`@sd/contracts`**: shared public API contracts and query helpers.
- **`@sd/db`**: schema, migrations, and generated database client.
- **`@sd/env`**: environment parsing and validation.
- **`@sd/design-tokens`**: authoritative visual tokens.

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
- Local persistence for continuity and planned offline support.
- No backend authority, no hidden business rules.
- Expo Router owns route structure through a stack-based app shell under `apps/mobile/src/app/(shell)`.
- The bottom navigation surface is a custom adaptive shell layered on top of route state, not a tab navigator primitive.

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

- `.desktop.web.tsx`
- `.mobile.web.tsx`
- `.web.tsx`
- `.native.tsx`
- `.ios.tsx` / `.android.tsx`
- base `.tsx`

## 8. Navigation Architecture

### Mobile App Shell

The mobile app uses a stack-owned adaptive shell instead of tab-owned navigation semantics.

- Top-level sections are peer route-group roots.
- Shell state is derived from route state rather than duplicated in UI stores.
- Remembered subsection state is treated as UX memory for section re-entry, not as competing navigation authority.
- Shared shell behavior lives in `@sd/feature-navigation`.

This keeps Expo Router responsible for route structure and screen lifecycle while preserving a product-specific navigation surface.

### Web Navigation

The shipped web app currently preserves the same high-level section model and section re-entry behavior, but it still uses its own web navigation surface rather than the mobile shell implementation as a shared source of truth.

## 9. Technology Stack

- Monorepo: PNPM, Turborepo
- Backend: NestJS, Prisma, PostgreSQL
- Web: Next.js, React, Unistyles
- Mobile: Expo, React Native, Expo Router, Unistyles
- Shared: TypeScript, Zod, TanStack Query
