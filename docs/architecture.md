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
- **`@sd/core-contracts`**: shared public API contracts and query helpers.
- **`@sd/core-db`**: schema, migrations, and generated database client.
- **`@sd/core-env`**: environment parsing and validation.
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
- Expo Router owns route structure through a tab-based main app boundary under `apps/mobile/src/app/(tabs)`.
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

- `.desktop.web.tsx`
- `.mobile.web.tsx`
- `.web.tsx`
- `.native.tsx`
- `.ios.tsx` / `.android.tsx`
- base `.tsx`

### Package Entrypoint Rules

- Use plain `index.ts` only when the package public surface is fully platform-agnostic and there is no real web/native split.
- If a package has distinct platform behavior, use `index.web.ts` and `index.native.ts` as the only public entrypoints.
- `index.web.ts` is reserved for code that is intended for `apps/web`.
- `index.native.ts` is reserved for code that is intended for `apps/mobile`.
- Intermediate barrel files inside `src/` are not allowed. Export only from the package root entrypoint files.

### Package Structure Rules

- Use explicit folders such as `components/`, `screens/`, `hooks/`, `utils/`, `types/`, `api/`, and `store/`.
- Do not leave platform implementation files loose in `src/` if they belong to one of those categories.
- Route-level or app-level assembly belongs in apps, not inside low-level shared packages.

### Platform Naming Rules

- Use plain `.ts` / `.tsx` only for platform-agnostic files.
- Use `.native.ts` / `.native.tsx` for mobile native files.
- Use `.web.ts` / `.web.tsx` for web files shared by mobile web and desktop web.
- Use `.desktop.web.ts` / `.desktop.web.tsx` for desktop-web-only implementations.
- Use `.mobile.web.ts` / `.mobile.web.tsx` for mobile-web-only implementations.
- Prefer explicit exported names such as `ButtonMobileNative`, `AuthRequiredStateResponsive`, or `UnistylesStyleDesktopWeb` instead of generic component names for platform-bound code.

### Dependency Rules

- Every package must declare the external libraries it imports directly.
- Do not rely on app-level installs to satisfy package-level imports.
- If a package imports `next/*`, `expo-*`, `better-auth/*`, `clsx`, or any other non-workspace module, that package manifest must declare it in `dependencies` or `peerDependencies`.

## 8. Navigation Architecture

### Mobile App Shell

The mobile app uses Expo Router `Tabs` for top-level sections, with a custom tab bar and subsection bar supplied by `@sd/feature-navigation`.

- Top-level sections are real tab roots.
- Subsections are route-owned within each tab stack.
- Shared tab chrome and section constants live in `@sd/feature-navigation`.

This keeps Expo Router responsible for tab state, route structure, and screen lifecycle while preserving a product-specific navigation surface.

### Web Navigation

The shipped web app currently preserves the same high-level section model and section re-entry behavior, but it still uses its own web navigation surface rather than the mobile shell implementation as a shared source of truth.

## 9. Technology Stack

- Monorepo: PNPM, Turborepo
- Backend: NestJS, Prisma, PostgreSQL
- Web: Next.js, React, Unistyles
- Mobile: Expo, React Native, Expo Router, Unistyles
- Shared: TypeScript, Zod, TanStack Query
