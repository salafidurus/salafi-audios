# Durus Audio Platform — Design Spec

**Date:** 2026-05-23
**Status:** Approved

---

## Problem

The native app has no working audio playback. `@sd/domain-playback` exists with the right abstraction shape but the native engine is a stub. Audio concerns are split across two packages (`domain-playback`, `domain-progress`) and a standalone API module (`progress`), creating unnecessary cognitive overhead and coupling.

---

## Goal

Consolidate all audio concerns — playback, queue, progress state, and sync — into a single cohesive `audio` domain across all layers, and deliver a complete listening experience:

- Streaming playback (primary mode)
- Series auto-continuation (finish one lecture → next plays automatically)
- On-demand downloads with offline playback
- Local-first resume position with delta sync to backend
- Mini-player (always visible) + full-screen player UI
- Lock screen and background audio controls

---

## Decisions Made

| Question               | Decision                                                                                |
| ---------------------- | --------------------------------------------------------------------------------------- |
| Audio library (native) | `expo-audio` (hooks + AudioPlayer + AudioPlaylist)                                      |
| Download approach      | On-demand only; `expo-file-system` class-based API (`File.createDownloadTask()`)        |
| Background downloads   | `expo-background-task` (replaces deprecated `expo-background-fetch`)                    |
| Queue                  | Series auto-continuation only; `nextLecture` from existing `seriesContext` API response |
| Resume position        | Local-first, delta-synced to backend (`since=lastSyncedAt`)                             |
| Player controls        | Play/pause, seek bar, skip ±30s, speed selector [0.75, 1.0, 1.25, 1.5, 1.75, 2.0]       |
| UI surfaces            | Mini-player (persistent, always visible) + full-screen player                           |
| Package structure      | Single `@sd/domain-audio` package; platform adapters live in each app                   |
| API hardening          | In scope — `GET /audio/lectures/:id/stream` + delta progress sync                       |
| Package consolidation  | `domain-playback` + `domain-progress` → `@sd/domain-audio`                              |
| API consolidation      | `progress` module → `audio` module under `/audio/*` namespace                           |

---

## Architecture

```text
UI (mini-player / full-screen)
        ↓
use-audio.ts hook
        ↓
DurusAudioService        ← domain layer: playLecture(), resumeLast(), onTrackEnd()
        ↓
QueueManager             ← series auto-continuation, current/next track
        ↓
PlaybackEngine (interface)
        ↓
ExpoAudioAdapter (native) / HTMLAudioAdapter (web)
        ↓
expo-audio / HTMLAudioElement
```

`DownloadManager` operates independently. `audio-source.resolver.ts` checks for a local file before falling back to the stream URL — the adapter is source-agnostic.

---

## Package: `@sd/domain-audio`

Replaces `@sd/domain-playback` and `@sd/domain-progress`. Contains shared interfaces, business logic, and state — no platform-specific code.

```text
packages/domain-audio/src/
├── types/
│   ├── index.ts                    ← re-exports
│   ├── track.types.ts              ← Track, AudioSource, SeriesRef
│   ├── state.types.ts              ← PlaybackState, QueueState
│   └── progress.types.ts           ← LectureProgress, ProgressSyncEntry
├── engine/
│   ├── playback.engine.ts          ← PlaybackEngine abstract class / interface
│   └── playback.events.ts          ← typed events: trackEnd, stateChange, error
├── queue/
│   ├── queue.manager.ts            ← QueueManager class: setCurrent(), advance(), hasNext(), reset()
│   └── queue.types.ts              ← QueueEntry, QueueState
├── service/
│   ├── audio.service.ts            ← DurusAudioService: playLecture(), resumeLast(), onTrackEnd()
│   └── audio.service.types.ts      ← method param/return types
├── progress/
│   ├── progress.store.ts           ← Zustand: progressMap, lastSyncedAt
│   ├── progress.sync.ts            ← delta sync with debounce (5s)
│   └── progress.selectors.ts       ← getProgress(lectureId), getResumePosition(lectureId)
├── store/
│   ├── playback.store.ts           ← Zustand: currentTrack, isPlaying, position, queueState
│   └── playback.selectors.ts       ← currentTrack, isPlaying, canSkipNext
└── index.ts
```

**Key principles:**

- `DurusAudioService` receives `PlaybackEngine` via constructor injection
- `QueueManager` is owned by `DurusAudioService`; not exposed to UI
- UI never writes to store directly — only `DurusAudioService` does
- Progress updates flow from engine position events → `DurusAudioService` → store → debounced sync

---

## Native App: `apps/native/src/features/audio/`

```text
apps/native/src/features/audio/
├── engine/
│   ├── expo-audio.adapter.ts       ← ExpoAudioAdapter implements PlaybackEngine
│   ├── audio-source.resolver.ts    ← local file path → stream URL fallback
│   └── lock-screen.service.ts      ← setActiveForLockScreen(true, metadata)
├── downloads/
│   ├── download.manager.ts         ← DownloadManager: download(), pause(), resumeAsync(), getLocalPath()
│   ├── download.store.ts           ← Zustand: status/progress per lectureId
│   └── download.types.ts           ← DownloadStatus, DownloadEntry
├── background/
│   └── sync.task.ts                ← expo-background-task: delta progress sync
├── provider/
│   └── audio.provider.tsx          ← instantiates ExpoAudioAdapter + DurusAudioService
├── hooks/
│   └── use-audio.ts                ← thin hook: play, pause, seek, skip, speed, currentTrack, progress
├── mini-player.tsx                 ← visible when currentTrack !== null
├── player-fullscreen.screen.tsx    ← full player UI
├── playback-controls.tsx           ← shared controls component
└── progress-bar.tsx                ← seek bar
```

Mini-player mounted in `RootLayout`:

```tsx
<>
  <Slot />
  {currentTrack && <MiniPlayer />}
</>
```

---

## Web App: `apps/web/src/features/audio/`

```text
apps/web/src/features/audio/
├── engine/
│   └── html-audio.adapter.ts      ← HTMLAudioAdapter implements PlaybackEngine
├── provider/
│   └── audio.provider.tsx         ← instantiates DurusAudioService with HTMLAudioAdapter
└── hooks/
    └── use-audio.ts               ← thin hook consuming DurusAudioService from context
```

---

## API: `apps/api/src/modules/audio/`

Replaces the standalone `progress` module. All audio endpoints under `/audio/` namespace.

### Endpoints

```text
GET  /audio/progress?since=<ISO>      ← delta sync: records where updatedAt > since
PUT  /audio/progress/:lectureId        ← upsert single lecture progress
POST /audio/progress/sync              ← bulk sync, last-write-wins conflict resolution
GET  /audio/lectures/:id/stream        ← resolve primary AudioAsset → { url, durationSeconds, format }
```

### Module Structure

```text
apps/api/src/modules/audio/
├── audio.module.ts
├── audio.controller.ts
├── audio.service.ts
├── audio.repo.ts
├── dto/
│   ├── stream-response.dto.ts
│   ├── progress-query.dto.ts
│   ├── progress-update.dto.ts
│   └── progress-sync.dto.ts
└── audio.integration.spec.ts
```

### Contracts

- `packages/core-contracts/src/types/audio.types.ts` — new: `StreamResponseDto`, `AudioProgressDto`, `ProgressSyncDto`
- `packages/core-contracts/src/endpoints.ts` — all progress paths updated to `/audio/progress/*`, new `/audio/lectures/:id/stream`
- `packages/core-contracts/src/types/progress.types.ts` — removed after migration

---

## Progress Sync Strategy

- `lastSyncedAt` stored in AsyncStorage
- Foreground resume: `GET /audio/progress?since=lastSyncedAt` → merge delta locally
- Position change: debounced 5s → `PUT /audio/progress/:lectureId`
- Background: `expo-background-task` → `POST /audio/progress/sync`
- Conflict resolution: last-write-wins on `updatedAt` (existing implementation retained)

---

## Data Flows

### User taps play

```text
LecturePlayButton
  → DurusAudioService.playLecture(lecture, seriesContext)
  → audio-source.resolver: local file? → stream URL from GET /audio/lectures/:id/stream
  → QueueManager.setCurrent(track, seriesContext.nextLecture)
  → ExpoAudioAdapter.load(track).play()
  → lock-screen.service: setActiveForLockScreen(true, metadata)
  → store updates → MiniPlayer renders
  → position events → progress store → debounced sync
```

### Track ends (series continuation)

```text
expo-audio playbackEnd event
  → ExpoAudioAdapter emits PlaybackEvent.trackEnd
  → DurusAudioService.onTrackEnd()
  → QueueManager.hasNext() → advance()
  → DurusAudioService.playLecture(nextTrack)
```

---

## Implementation Sequence

| Stage | Scope                                                                                           | Verify                                |
| ----- | ----------------------------------------------------------------------------------------------- | ------------------------------------- |
| 1     | API `audio` module — all 4 endpoints, migrate `progress` module, update contracts               | `pnpm test --filter @sd/api`          |
| 2     | `@sd/domain-audio` package — migrate + restructure, QueueManager, DurusAudioService, delta sync | `pnpm test --filter @sd/domain-audio` |
| 3     | Native streaming — `ExpoAudioAdapter`, provider, hook, wire mini-player + full-screen           | Tap lecture → plays → lock screen     |
| 4     | Series continuation — `trackEnd` event, QueueManager.advance()                                  | Lecture ends → next plays             |
| 5     | Progress sync — delta sync, background task                                                     | Kill app → reopen → resumes           |
| 6     | Downloads — `DownloadManager`, download store, source resolver                                  | Download → airplane mode → plays      |
| 7     | Web adapter — `HTMLAudioAdapter`, provider, hook                                                | Web lecture plays, no regressions     |

---

## Dependencies to Install

| Package                | Workspace     | Purpose                                  |
| ---------------------- | ------------- | ---------------------------------------- |
| `expo-audio`           | `apps/native` | Audio playback + lock screen controls    |
| `expo-file-system`     | `apps/native` | Resumable downloads + local file storage |
| `expo-background-task` | `apps/native` | Background progress sync                 |
