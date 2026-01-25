# AGENT.md — apps/mobile (Offline-First Client)

Expo / React Native mobile app. Primary listening experience.

## Core responsibility

- Offline-first playback + continuity.
- Record user intent safely while offline.
- Sync with backend as connectivity permits.

## Non-negotiables

- Mobile is a **client**. Backend remains source of truth.
- Offline records **intent**, not authority.
- **No administrative/editorial actions offline.**
- Conflicts are resolved **on the backend**, deterministically.

## Offline sync mechanics (outbox)

- Offline-writable actions (progress, favorites, etc.) are queued in an **outbox**.
- Outbox entries are append-only, retryable, idempotent.
- Sync triggers: connectivity restore, foreground, periodic task, explicit refresh.
- Client never “decides” final state; backend returns authoritative state.

## App structure (enforced)

Top-level structure:

- `app/` routing + composition only (no business logic)
- `core/` infrastructure (api, auth, playback, persistence, sync)
- `features/` domain-oriented vertical slices
- `shared/` reusable primitives (domain-agnostic)

Dependency direction:

- features -> core/shared
- core -> shared
- shared -> (nothing)
  No circular dependencies.

## Media

- Playback uses backend-provided references / URLs.
- Offline downloads are for continuity, not ownership.
- Never embed storage credentials.

## Commands

From repo root:

- Dev: `pnpm dev:mobile`
- Lint: `pnpm lint --filter=mobile`
- Typecheck: `pnpm typecheck --filter=mobile`
- Test: `pnpm test --filter=mobile`

## Quality

- Fail safely and explicitly; no silent failures.
- Treat caching/persistence as replaceable working set, not canonical truth.
