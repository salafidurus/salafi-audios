# AGENT.md - apps/mobile (Offline-First Client)

This Expo/React Native app prioritizes offline listening and resilient sync.

## Core responsibilities

- Deliver reliable playback and offline continuity.
- Queue user intent locally and sync safely.
- Reflect backend-authoritative state after sync.

## Non-negotiables

- Mobile is never the authority for protected state transitions.
- Offline mode records intent only.
- No admin/editorial authority while offline.
- Backend resolves conflicts deterministically.

## Offline sync rules

- Use an outbox pattern for offline-writable intents.
- Outbox entries must be idempotent and retry-safe.
- Sync on reconnect, foreground, periodic triggers, and explicit refresh.
- Reconcile to backend truth after sync completion.

## Structure and dependency direction

- `app/` - routing and composition
- `features/` - domain UX slices
- `core/` - API/auth/playback/persistence/sync infrastructure
- `shared/` - primitives/utilities

Direction:

- features -> core/shared
- core -> shared
- shared -> no inward deps

## Media rules

- Consume backend-provided media references.
- Never ship storage credentials in app code.
- Treat downloads as continuity cache, not ownership.

## Commands (run from repo root)

- Dev: `pnpm dev:mobile`
- Lint: `pnpm --filter mobile lint`
- Typecheck: `pnpm --filter mobile typecheck`
- Test: `pnpm --filter mobile test`

## Single-test commands

- Jest file: `pnpm --filter mobile test -- src/path/to/file.test.tsx`
- Jest by name: `pnpm --filter mobile test -- -t "renders heading"`
- Jest watch: `pnpm --filter mobile test:watch -- src/path/to/file.test.tsx`

## Quality expectations

- Fail safely and explicitly; avoid silent drops.
- Keep persistence/cache replaceable and non-authoritative.
- Add tests for outbox behavior, retry semantics, and reconciliation paths.
