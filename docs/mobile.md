# Mobile Application

## 1. Role of the Mobile App

The mobile app (`apps/mobile`) is the listening-first client. It prioritizes continuity, playback ergonomics, and eventual offline support, while remaining a pure consumer of backend authority.

## 2. Structure

### Layered Structure

- **Composition (`apps/mobile/src/app`)**: Expo Router navigation, route groups, layouts, and screen wiring.
- **Features (`@sd/feature-*`)**: domain-oriented screens, hooks, and feature logic.
- **Core (`@sd/core-*`)**: shared infrastructure such as auth, API access, and styling.
- **Shared (`@sd/shared`)**: reusable cross-platform primitives and utilities.

### Structural Rules

- Route composition stays in `app/`.
- Business rules do not live in route files.
- Mobile-specific persistence and playback mechanics belong in infrastructure or feature layers, not navigation.

## 3. Current Implementation State

Current mobile work is centered on search and auth flows. Offline sync, downloads, and canonical playback/progress systems are still planned rather than complete.

The navigation surface has been reworked into a tabs-owned structure:

- the main app surface lives under `apps/mobile/src/app/(tabs)/`
- the shared tabs boundary is `apps/mobile/src/app/(tabs)/_layout.tsx`
- top-level sections are real tabs: feed, live, search, library, and account
- tab chrome UI is rendered by `@sd/feature-navigation`
- route state is the source of truth for active tab and subsection
- subsection selection happens inside each tab stack rather than through a shell-owned navigation store

This means mobile now uses Expo Router tabs for peer-root navigation, with custom package-owned chrome layered over them for product-specific visuals.

## 4. Offline and Sync Principles

Offline support is a product requirement, but the architecture must be described as target-state until implemented.

### Non-Negotiable Rules

- The backend remains the source of truth.
- Clients may record intent locally, not authoritative state.
- Offline mode never grants editorial or administrative capability.
- Synchronization is reconciliation, not peer authority.

## 5. Target Offline Data Model

When offline support is implemented, mobile data falls into three categories:

1. **Offline-readable**: downloaded audio and cached metadata.
2. **Offline-writable**: personal intent such as progress and favorites, queued for later sync.
3. **Offline-only**: temporary UI state and device-local preferences.

## 6. Target Sync Architecture

The intended sync model is an outbox-based design:

- user intent is queued locally,
- sync runs opportunistically when connectivity returns,
- entries are retried safely,
- backend rules resolve conflicts deterministically,
- local state reconciles to backend truth after confirmation.

This is the intended architecture for Phase 06, not a statement that it is already complete today.

## 7. Playback and Continuity

- Playback continuity may use local persistence for resume behavior.
- Progress synchronization should be throttled and idempotent once implemented.
- Cross-device consistency is eventual rather than real-time.

## 8. Mobile-Specific Constraints

- The mobile app may cache and persist aggressively for usability.
- It must not duplicate backend policy.
- It must not invent alternative sync semantics outside the documented outbox model.

## 9. Navigation Surface

The tab bar is a product-specific navigation surface layered over a standard Expo Router `Tabs` navigator.

### Current Rules

- The tab chrome mounts once at the shared `(tabs)` layout boundary.
- Top-level section switches are owned by Expo Router tabs.
- Subsection routes live inside each tab stack.
- Current route state is authoritative for the active location.
- Default subsection routes are canonical bare paths like `/feed` and `/live`.

### Ownership

- Top-level tab chrome lives in `packages/feature-navigation/src/components/CustomTabBar/`
- Subsection chrome lives in `packages/feature-navigation/src/components/SubsectionBarHost/`
- Shared route helpers for tabs live in `packages/feature-navigation/src/utils/tab-route-config.native.ts`

### Package Discipline

- Route files in `apps/mobile/src/app/` stay thin and assemble package-owned screens.
- Feature packages own reusable mobile-native UI and route-facing screen components.
- Shared and core packages must not hide native-only code behind generic filenames or generic root exports.
- If code is mobile-native only, it must live in an explicit `.native.*` file and be exported through `index.native.ts`.
- If code is shared between native and web, it belongs in a platform-agnostic file and may be re-exported from both platform root entrypoints.

### Verification Status

- The `(tabs)` route group is restored as the main app boundary
- Mobile and web route defaults now align on `/feed`, `/live`, `/library`, and `/account`
- Mobile and web typecheck/lint pass on the tabs migration
- Native runtime smoke coverage is still required to confirm the old shell-era crash is gone on device
