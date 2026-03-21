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

The navigation shell has been reworked into a stack-owned adaptive shell:

- the main app surface lives under `apps/mobile/src/app/(shell)/`
- the shared shell boundary is `apps/mobile/src/app/(shell)/_layout.tsx`
- top-level sections are peer roots: search, feed, live, library, and account
- shell UI is rendered by `@sd/feature-navigation`
- route state is the source of truth for active section and subsection
- remembered subsection state is retained only as section re-entry memory

This means mobile no longer treats the primary app surface as a tab navigator. It uses Expo Router stacks plus a persistent adaptive shell that changes by route state.

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

## 9. Navigation Shell

The adaptive shell is a product-specific navigation surface, not a standard tab bar.

### Current Rules

- The shell mounts once at the shared `(shell)` layout boundary.
- Top-level section switches are peer-root transitions.
- Re-entering a section restores the last remembered subsection for that section.
- Current route state is authoritative for the active location.
- Remembered subsection state only supplies the destination when the user intentionally re-enters a section.

### Shell Modes

- `launcher` mode for search-home style routes
- `section` mode for section routes with subsection controls

### Ownership

- Route parsing and shell href building live in `packages/feature-navigation/src/utils/shell-navigation.native.ts`
- Route-derived shell state lives in `packages/feature-navigation/src/hooks/use-active-navigation-state.native.ts`
- Shell rendering primitives live in `packages/feature-navigation/src/components/*`

### Verification Status

- Section re-entry memory is implemented
- The `(tabs)` route group has been removed in favor of `(shell)`
- Focused route tests cover grouped/internal href parsing, normalized pathname parsing, launcher mode, and remembered subsection fallback
- Native back-navigation and deep-link verification still require continued device-level smoke coverage as the app grows
