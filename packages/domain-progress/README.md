# @sd/domain-progress

> Lecture progress tracking and offline sync state management

## Purpose

Tracks listening progress per lecture via a Zustand store, provides a `useLectureProgress` hook, and handles progress sync logic for offline-first mobile usage. Progress intent is recorded locally and synced to the backend when connectivity is available.

## Boundaries

- **Depends on:** `@sd/core-contracts`, `zustand`
- **Consumed by:** `@sd/feature-progress`, `apps/web`, `apps/native`

## Structure

```text
src/
├── store/
│   └── progress.store.ts       # Zustand progress state
├── hooks/
│   └── use-lecture-progress.ts  # useLectureProgress hook
├── sync/
│   └── progress.sync.ts        # Sync logic for offline progress
├── types/
│   └── index.ts                # Progress type definitions
└── index.ts                    # Public entrypoint
```

## Key Commands

- `pnpm --filter domain-progress typecheck` — Type check

## Constraints

- Offline writes follow the **outbox pattern** — client records intent, backend resolves state.
- No UI components belong here — those live in `@sd/feature-progress`.
- Store must remain platform-agnostic.
