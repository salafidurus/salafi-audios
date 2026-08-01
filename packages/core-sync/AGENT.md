# AGENT.md - `@sd/core-sync`

## Purpose

`@sd/core-sync` owns the generalized local-first repository/sync primitive shared by
`@sd/domain-audio` (progress) and `@sd/domain-content` (saved/library): a tombstone-aware
entity store, a persisted outbox, and a debounce/flush/delta-hydrate sync engine.

- Keep this package platform-agnostic. It defines contracts and pure logic only.
- Do not add feature-specific behavior (progress semantics, saved semantics) here — that
  belongs in the consuming domain package, configured on top of these primitives.

## Platform storage: dependency injection, not platform entrypoints

This package ships a `StorageAdapter` interface and zero concrete implementations. Each app
supplies its own adapter (`apps/web/src/core/sync/local-storage-adapter.ts`,
`apps/native/src/core/sync/sqlite-kv-adapter.ts`) and passes it in.

- Do not add `index.web.ts` / `index.native.ts` to this package to special-case storage.
  This package has no platform-specific _behavior_ — only platform-specific storage, which
  is solved by injecting a `StorageAdapter`, mirroring the existing `PlaybackEngine` DI
  pattern in `packages/domain-audio/src/service/audio.service.ts`.
- If a genuine platform-specific behavior need ever arises (not just storage), reconsider
  this rule explicitly rather than silently adding a platform file.

## Structure

- `src/storage/` — `StorageAdapter` interface.
- `src/store/` — `createEntityStore<T>()`, the generalized tombstone-aware local store.
- `src/conflict/` — conflict-resolution helpers (last-write-wins comparator).
- `src/outbox/` — persisted outbox (queue + drain).
- `src/sync/` — `createSyncEngine()` (debounce/flush/delta-hydrate/bulk push).

## Entrypoints

- `src/index.ts` is the only public entrypoint — this package is fully platform-agnostic.
- No intermediate barrels inside `src/`; export only from the root `src/index.ts`.

## Rules

- All exports must be explicit.
- Package dependencies must declare every direct external import.
