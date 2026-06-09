# Stage 2: `@sd/domain-audio` Package Consolidation

Consolidate all playback engines, queue managers, and progress states into a single, cohesive, platform-agnostic domain package `@sd/domain-audio`. This replaces both `@sd/domain-playback` and `@sd/domain-progress` entirely.

## User Review Required

> [!NOTE]
> Following **Option 1**, both progress syncing and saved lectures (favorites list) will be fully consolidated under `@sd/domain-audio`. This retains the exact database-sync interface built in Stage 1.

> [!IMPORTANT]
> To comply with strict monorepo bounds and preventing web exports leaking into native, `@sd/domain-audio` will contain strictly pure, platform-agnostic business logic and stores. The concrete platform engines (`HTMLAudioElement` and `expo-audio`) will be injected into `DurusAudioService` by the respective apps (`apps/web` and `apps/native`).

## Proposed Changes

---

### Component: Domain Audio Package (`packages/domain-audio`)

We will create a new monorepo package that acts as the single source of truth for audio.

#### [NEW] [package.json](file:///C:/dev/salafi-audios/packages/domain-audio/package.json)

- Define the package name `@sd/domain-audio` depending strictly on `zustand` and `@sd/core-contracts`.

#### [NEW] [src/types/track.types.ts](file:///C:/dev/salafi-audios/packages/domain-audio/src/types/track.types.ts)

- Declare `Track` and `AudioSource` model schemas.

#### [NEW] [src/types/state.types.ts](file:///C:/dev/salafi-audios/packages/domain-audio/src/types/state.types.ts)

- Declare `PlaybackStatus` (`'idle' | 'loading' | 'playing' | 'paused' | 'error'`) and `PlaybackState` properties.

#### [NEW] [src/engine/playback.engine.ts](file:///C:/dev/salafi-audios/packages/domain-audio/src/engine/playback.engine.ts)

- Define the injected `PlaybackEngine` interface and event bindings (`onTrackEnd`, `onStatusChange`, `onPositionChange`, `onDurationChange`, `onError`).

#### [NEW] [src/queue/queue.manager.ts](file:///C:/dev/salafi-audios/packages/domain-audio/src/queue/queue.manager.ts)

- Build the `QueueManager` handling playlist sets, active track index pointers, and series auto-continuation step bounds.

#### [NEW] [src/store/playback.store.ts](file:///C:/dev/salafi-audios/packages/domain-audio/src/store/playback.store.ts)

- Define the Zustand `usePlaybackStore` containing player states: `currentTrack`, `isPlaying`, `positionSeconds`, `durationSeconds`, and `speed`. Exposes transactional internal mutations used exclusively by `DurusAudioService`.

#### [NEW] [src/progress/progress.store.ts](file:///C:/dev/salafi-audios/packages/domain-audio/src/progress/progress.store.ts)

- Define the Zustand `useProgressStore` managing the localized `progressMap` (for resumption coordinates) and `savedMap` (for favorited library references).

#### [NEW] [src/progress/progress.sync.ts](file:///C:/dev/salafi-audios/packages/domain-audio/src/progress/progress.sync.ts)

- Implement a debounced (5s) progress reporter that batches updates to `POST /audio/progress/sync` or `PUT /audio/progress/:lectureId`.
- Maintain offline-outbox queued intents for saved library items to bulk sync with `/me/library/saved/sync`.

#### [NEW] [src/service/audio.service.ts](file:///C:/dev/salafi-audios/packages/domain-audio/src/service/audio.service.ts)

- The primary entry orchestrator `DurusAudioService`. Automatically records progress updates into the store and triggers synchronization on position changes. Triggers `QueueManager.advance()` and auto-continuation on track termination.

#### [NEW] [src/index.ts](file:///C:/dev/salafi-audios/packages/domain-audio/src/index.ts)

- Single canonical entry point exporting `DurusAudioService`, `PlaybackEngine`, stores, hooks, and types.

---

### Component: Old Packages Cleanup

We will permanently delete the obsolete split packages to remove cognitive overhead.

#### [DELETE] [domain-playback package](file:///C:/dev/salafi-audios/packages/domain-playback)

- Delete the entire folder.

#### [DELETE] [domain-progress package](file:///C:/dev/salafi-audios/packages/domain-progress)

- Delete the entire folder.

---

## Verification Plan

### Automated Tests

- Create unit tests for `QueueManager` and `DurusAudioService` using Jest mocks:
  ```bash
  pnpm --filter domain-audio test
  ```
- Run linter and typechecker across the consolidated package:
  ```bash
  pnpm --filter domain-audio typecheck
  pnpm --filter domain-audio lint
  ```
