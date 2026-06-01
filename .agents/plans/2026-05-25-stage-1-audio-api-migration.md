# Stage 1: API Audio Module & Contracts Migration

Provide a unified, highly optimized, and namespace-clean API under `/audio/*` to support delta-sync progress tracking, bulk syncing, and stream URL resolution. This replaces the legacy `/me/progress` namespace with a structured set of endpoints, ensuring consistent data flows and strong contract enforcement.

## User Review Required

> [!NOTE]
> All endpoints under `/audio/progress/*` will strictly inherit the existing authorization model. A valid session is mandatory; anonymous requests will return `401 Unauthorized`.

> [!WARNING]
> This is a breaking change for the backend API paths. The `/me/progress` routes are deprecated and completely replaced by `/audio/progress`. Because both web and native packages exist in the same monorepo, both will be migrated in subsequent stages to use the updated contracts.

## Open Questions

There are no remaining open questions. The consolidation of saved library lists and progress tracking into `@sd/domain-audio` has been selected as the design paradigm.

## Proposed Changes

---

### Component: Core Contracts (`packages/core-contracts`)

We will update the shared type definitions and routes in the monorepo's contracts package to keep dependent client applications fully synchronized.

#### [NEW] [audio.types.ts](file:///C:/dev/salafi-audios/packages/core-contracts/src/types/audio.types.ts)
* Create standard DTO interface types for streaming and progress updates:
  * `StreamResponseDto`: `{ url: string; durationSeconds: number; format?: string }`
  * `AudioProgressDto`: `{ lectureId: string; positionSeconds: number; durationSeconds: number; completedAt?: string; updatedAt: string }`
  * `ProgressSyncItemDto`: `{ lectureId: string; positionSeconds: number; durationSeconds: number; completedAt?: string; updatedAt: string }`
  * `ProgressSyncDto`: `{ items: ProgressSyncItemDto[] }`

#### [MODIFY] [index.ts](file:///C:/dev/salafi-audios/packages/core-contracts/src/types/index.ts)
* Re-export new audio DTO types.
* Clean up any obsolete progress type references.

#### [MODIFY] [endpoints.ts](file:///C:/dev/salafi-audios/packages/core-contracts/src/endpoints.ts)
* Remove `progress` block under `/me/progress/*`.
* Add `audio` block containing:
  * `progress.list`: `/audio/progress`
  * `progress.update(lectureId)`: `/audio/progress/${lectureId}`
  * `progress.sync`: `/audio/progress/sync`
  * `lectures.stream(id)`: `/audio/lectures/${id}/stream`

---

### Component: API Modules (`apps/api`)

We will migrate all progress logic to a newly structured `audio` module under `apps/api/src/modules/audio`.

#### [DELETE] [progress module](file:///C:/dev/salafi-audios/apps/api/src/modules/progress)
* Delete the entire old `apps/api/src/modules/progress` folder structure after successfully migrating its logic.

#### [NEW] [audio.module.ts](file:///C:/dev/salafi-audios/apps/api/src/modules/audio/audio.module.ts)
* Wire up `AudioController`, `AudioService`, `AudioRepository`, and `PrismaService` imports.

#### [NEW] [audio.controller.ts](file:///C:/dev/salafi-audios/apps/api/src/modules/audio/audio.controller.ts)
* Define `@Controller('audio')` endpoints decorated with proper authentication guards (`JwtAuthGuard` / `AuthGuard`):
  * `GET /audio/progress`: Retrieves user progress, accepts optional `since` ISO query parameter.
  * `PUT /audio/progress/:lectureId`: Upserts specific lecture progress.
  * `POST /audio/progress/sync`: Performs batch-upsert of client progress queue.
  * `GET /audio/lectures/:lectureId/stream`: Resolves a lecture's primary audio asset url.

#### [NEW] [audio.repo.ts](file:///C:/dev/salafi-audios/apps/api/src/modules/audio/audio.repo.ts)
* Handle high-performance database interactions via Prisma:
  * Extend legacy `getUserProgress` to filter by `updatedAt > since` if provided.
  * Maintain the optimized raw-SQL transaction `bulkSync` for last-write-wins (LWW) conflict resolution using the client's `updatedAt` timestamps.

#### [NEW] [audio.service.ts](file:///C:/dev/salafi-audios/apps/api/src/modules/audio/audio.service.ts)
* Provide standard service orchestration for controller endpoints.
* Implement audio asset stream url resolution:
  * Fetch `AudioAsset` records for a `lectureId`.
  * Return the one marked `isPrimary: true`, falling back to the first available asset if none are explicitly primary.
  * Raise a `NotFoundException` if no audio assets exist for the lecture.

#### [NEW] [audio.integration.spec.ts](file:///C:/dev/salafi-audios/apps/api/src/modules/audio/audio.integration.spec.ts)
* Implement mock-based controller route verification testing auth/unauth boundaries.

#### [NEW] [audio.service.spec.ts](file:///C:/dev/salafi-audios/apps/api/src/modules/audio/audio.service.spec.ts)
* Perform comprehensive unit-testing coverage for all service methods.

#### [MODIFY] [app.module.ts](file:///C:/dev/salafi-audios/apps/api/src/app.module.ts)
* Replace `ProgressModule` with `AudioModule` imports.

---

## Verification Plan

### Automated Tests
* Build core contracts:
  ```bash
  pnpm --filter core-contracts build
  ```
* Run core-contracts test specs:
  ```bash
  pnpm --filter core-contracts test
  ```
* Run new audio module unit and integration tests:
  ```bash
  pnpm --filter api test -- src/modules/audio/
  ```
* Verify whole API compiles and passes checks:
  ```bash
  pnpm --filter api typecheck
  pnpm --filter api lint
  ```

### Manual Verification
* Run the API server locally:
  ```bash
  pnpm dev:api
  ```
* Trigger endpoints using an API client (or cURL/Postman) with a valid user session to ensure proper response shapes for:
  * Stream resolution: `GET /audio/lectures/l1/stream`
  * Delta sync progress: `GET /audio/progress?since=2026-05-25T00:00:00.000Z`
