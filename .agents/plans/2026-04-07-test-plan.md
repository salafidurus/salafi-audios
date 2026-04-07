# Test Plan — Salafi Durus Monorepo

> **For agentic workers:** Use superpowers:executing-plans or superpowers:subagent-driven-development to implement this plan.
> **Status:** FINAL — ready to execute.

**Goal:** Establish meaningful test coverage for core functionality across all apps and packages. The focus is behaviour — not implementation details. Tests must survive refactors as long as the behaviour contract holds.

**Philosophy:**

- Unit test pure logic: stores, utilities, data transforms, service invariants.
- Integration test module and auth boundaries: service + mocked repo, guard + real NestJS testing module.
- E2E test only critical user flows: public content access, auth enforcement, navigation landmarks.
- **Never** test: presentational-only UI components, trivial getters/setters, framework-provided wiring.

---

## TDD Workflow

```text
Red → Green → Commit  (test + implementation in the same commit)
```

1. Write the failing test describing the expected behaviour.
2. Run it — confirm it fails with the _expected_ message, not a setup error.
3. Implement the minimum code to make it pass.
4. Run again — confirm it passes.
5. Commit test and implementation together.

Bug fixes always start with a failing regression test.

---

## Current Coverage Baseline

| Area                                | File                                    | State      |
| ----------------------------------- | --------------------------------------- | ---------- |
| `apps/api` — auth guard             | `auth.guard.spec.ts`                    | ✅         |
| `apps/api` — topics service         | `topics.service.spec.ts`                | ✅         |
| `apps/api` — search utils           | `search-error.utils.spec.ts`            | ✅         |
| `apps/api` — topics utils           | `topics-error.utils.spec.ts`            | ✅         |
| `apps/web` — E2E smoke              | `e2e/smoke.spec.ts`, `e2e/home.spec.ts` | ✅ minimal |
| All packages, mobile, remaining API | —                                       | ❌         |

---

## Packages Requiring Jest Setup

These packages have no `jest.config.cjs` yet. Add one before writing tests for them. Copy the pattern from `packages/core-env/jest.config.cjs` (node environment) or `packages/core-db/jest.config.cjs` (jsdom for Zustand stores).

```text
packages/domain-playback/      → jsdom  (Zustand)
packages/domain-progress/      → jsdom  (Zustand)
packages/domain-search/        → jsdom
packages/feature-downloads/    → jsdom  (Zustand)
packages/feature-navigation/   → node   (string utils only; store tests use jsdom)
packages/shared/               → node   (pure functions; format.desktop.web.ts has no DOM deps)
packages/util-ingest/          → node   (already has jest setup; no test files yet)
packages/core-contracts/       → node
```

Each needs these additions to `package.json`:

```json
{
  "scripts": {
    "test": "jest --passWithNoTests",
    "test:watch": "jest --watch --passWithNoTests",
    "test:cov": "jest --coverage --passWithNoTests",
    "test:prepush": "jest --passWithNoTests --testPathPattern"
  }
}
```

---

## Section 1 — `apps/api` (NestJS Backend)

### 1.1 Scholars Service

**File:** `apps/api/src/modules/scholars/scholars.service.spec.ts`

Setup: `Test.createTestingModule` with `ScholarsService` + mocked `ScholarsRepository`.

Tests:

- `getBySlug` resolves with DTO when scholar exists
- `getBySlug` throws `NotFoundException` when `repo.findBySlug` returns `null`
- `getStats` throws `NotFoundException` when scholar is not found
- `getStats` returns the stats DTO when found
- `getContent` returns grouped content (collections, standalone series, standalone lectures) from the repo response
- `list` returns the array from `repo.list`

### 1.2 Library Service

**File:** `apps/api/src/modules/library/library.service.spec.ts`

Setup: mock `LibraryRepository`.

Tests:

- `getSaved` calls repo with the authenticated user's `userId`
- `getCompleted` calls repo with the authenticated user's `userId`
- `getProgress` returns progress entries for the user
- `saveLecture(userId, lectureId)` calls `repo.save` with correct arguments
- `unsaveLecture(userId, lectureId)` calls `repo.remove` with correct arguments

### 1.3 Live Service

**File:** `apps/api/src/modules/live/live.service.spec.ts`

Setup: mock `LiveRepository`.

Tests:

- `getActive` delegates to `repo.getActive` and returns sessions
- `getUpcoming` delegates to `repo.getUpcoming`
- `getEnded(cursor)` delegates with cursor and returns paginated result
- `updateStatus(id, UPCOMING → LIVE)` calls `repo.updateStatus` and returns updated session
- `updateStatus(id, LIVE → ENDED)` succeeds
- `updateStatus(id, ENDED → LIVE)` throws `BadRequestException` (invalid transition)
- `updateStatus` for a non-existent session throws `NotFoundException`

### 1.4 Feed Service

**File:** `apps/api/src/modules/feed/feed.service.spec.ts`

Setup: mock `FeedRepository`.

Tests:

- `getList(cursor, topicSlugs, scholarSlugs)` delegates to repo with correct params
- `getList` with no filters passes empty arrays (not `undefined`) to repo
- `getRecent(cursor)` delegates to `repo.getRecent`
- `getFollowing(userId, cursor)` delegates to `repo.getFollowing` with userId
- `getScholars()` delegates to `repo.getScholars` and returns chip array

### 1.5 Progress Service

**File:** `apps/api/src/modules/progress/progress.service.spec.ts`

Setup: mock `ProgressRepository`.

Tests:

- `update(userId, lectureId, dto)` calls `repo.upsert` with correct payload
- `bulkSync(userId, items)` calls `repo.bulkUpsert` with the items array and returns results
- `getForUser(userId, cursor)` delegates to `repo.list` with userId and cursor

### 1.6 Admin Permissions Service

**File:** `apps/api/src/modules/admin-permissions/admin-permissions.service.spec.ts`

Setup: mock `AdminPermissionsRepository`.

Tests:

- `hasPermission(userId, 'manage:scholars')` returns `true` when record exists in repo
- `hasPermission(userId, 'manage:scholars')` returns `false` when repo returns null/undefined
- `getMyPermissions(userId)` returns the permissions array from repo
- `grantPermission(granterId, targetId, permission)` calls `repo.create` with correct args
- `revokePermission(id)` calls `repo.delete(id)`
- `revokePermission` on a non-existent id throws `NotFoundException`

### 1.7 Home Service

**File:** `apps/api/src/modules/home/home.service.spec.ts`

Setup: mock `HomeRepository`.

Tests:

- `getQuickBrowse(userId?)` returns DTO from repo
- `getQuickBrowse` called without userId returns anonymous form (no recentProgress)
- `getQuickBrowse` called with userId returns DTO with recentProgress populated

### 1.8 Auth Boundary Integration

**File:** `apps/api/src/modules/auth/auth-boundary.integration.spec.ts`

Setup: `Test.createTestingModule` that boots a minimal NestJS app including `AuthModule` + mock controllers for each auth tier. Mock `getAuth` to return null/session based on the test case.

Tests:

- `GET /scholars` (marked `@Public()`) returns 200 without any auth token
- `GET /me/library/saved` returns 401 when no session is present
- `GET /me/library/saved` returns 200 when a valid session is injected into the request
- `POST /admin/scholars` returns 403 when authenticated user has no `manage:scholars` permission
- `POST /admin/scholars` returns 201 when authenticated user has `manage:scholars` permission
- Guard correctly reads `@Public()`, `@Roles()` decorators in combination

---

## Section 2 — `packages/domain-playback`

### 2.1 Playback Store

**File:** `packages/domain-playback/src/store/playback.store.spec.ts`

Environment: `jsdom`. Reset state between tests with `usePlaybackStore.setState(initialState)`.

Tests for `play`:

- Sets `currentTrack` to the supplied track
- Sets `status` to `"loading"`
- Resets `positionSeconds` to `0`
- Sets `durationSeconds` from `track.durationSeconds`; defaults to `0` when undefined

Tests for `pause` / `resume`:

- `pause` transitions status to `"paused"` without clearing the track
- `resume` transitions status to `"playing"` without clearing the track

Tests for `seek`:

- Updates `positionSeconds` to the given value

Tests for `stop`:

- Clears `currentTrack` to `null`
- Resets `status` to `"idle"`, `positionSeconds` to `0`, `durationSeconds` to `0`

Tests for `setError`:

- Sets `status` to `"error"` and `error` to the supplied string

Tests for queue operations:

- `enqueue(track)` adds a `QueueItem` to the end of `queue`
- `enqueue` twice → two items in order
- `dequeue(trackId)` removes the matching item; queue length decreases by 1
- `dequeue` for a non-existent trackId leaves the queue unchanged
- `clearQueue` sets `queue` to `[]`

Tests for `skipToNext`:

- When queue is empty, calls `stop()` (status becomes `"idle"`, currentTrack becomes `null`)
- When queue has one item, plays that item and empties the queue
- When queue has multiple items, plays the first item and the remaining stay in queue (FIFO order preserved)

---

## Section 3 — `packages/domain-progress`

### 3.1 Progress Store

**File:** `packages/domain-progress/src/store/progress.store.spec.ts`

Environment: `jsdom`. Reset state between tests.

Tests:

- `setProgress(id, 120, 3600)` creates entry with correct `positionSeconds` and `durationSeconds`
- `setProgress` preserves `completedAt` when updating an existing entry
- `setProgress` updates `updatedAt` to a new ISO timestamp on each call
- `markCompleted(id)` sets `completedAt` to a truthy ISO string
- `markCompleted` on an unknown lectureId is a no-op (no entry created)
- `addSaved(id)` + `isSaved(id)` → `true`
- `addSaved` then `removeSaved` + `isSaved` → `false`
- `removeSaved` on an id that was never saved is a no-op (no error thrown)
- `getSavedIds` returns exactly the keys in `savedMap`
- `loadSaved([{lectureId, savedAt}])` merges into `savedMap` without clobbering existing entries
- `loadProgress(entries)` merges into `progressMap` without clobbering existing entries

### 3.2 Progress Sync

**File:** `packages/domain-progress/src/sync/progress.sync.spec.ts`

Environment: `node`. Use `jest.useFakeTimers()` for debounce tests. Mock `httpClient`.

Tests for `syncProgressToBackend`:

- First call for a lectureId starts a 5-second debounce timer
- Second call for the same lectureId within the window resets (collapses) the timer — only one HTTP call is made
- Two calls for different lectureIds within the window result in two entries sent in one flush
- After the debounce fires, `httpClient` is called with the correct endpoint and body
- On HTTP failure, the pending update is re-enqueued (retried on next flush)

Tests for `syncLocalToServer`:

- With progress entries in the store, calls `POST /me/progress/sync` with all entries
- With saved ids in the store, calls `POST /me/library/saved/sync` with all ids
- With empty store, makes no HTTP calls
- Fires both requests concurrently (not sequentially)

Tests for `saveLecture` / `unsaveLecture`:

- `saveLecture(id)` adds id to the store's `savedMap` immediately (optimistic)
- `saveLecture(id)` fires `POST /me/library/saved/:id`
- `unsaveLecture(id)` removes id from `savedMap` immediately (optimistic)
- `unsaveLecture(id)` fires `DELETE /me/library/saved/:id`
- On HTTP failure, `unsaveLecture` re-adds the id to `savedMap` (rollback)

---

## Section 4 — `packages/domain-search`

### 4.1 Search Result Transformer

**File:** `packages/domain-search/src/utils/build-search-result-rows.spec.ts`

Environment: `node`.

Tests:

- `buildSearchResultRows(undefined)` returns `[]`
- `buildSearchResultRows({ collections: [], series: [], lectures: [] })` returns `[]`
- Collections are prefixed `"collection:<id>"` in the `id` field
- Series are prefixed `"series:<id>"`
- Lectures are prefixed `"lecture:<id>"`
- Result order: collections first, then series, then lectures
- `coverImageUrl` is used as `imageUrl` when present; falls back to `scholarImageUrl`
- When both `coverImageUrl` and `scholarImageUrl` are absent, `imageUrl` is `undefined`
- `lectureCount`, `durationSeconds`, `scholarName`, `title` are passed through unchanged

---

## Section 5 — `packages/shared`

### 5.1 Duration Formatter

**File:** `packages/shared/src/utils/format.spec.ts`

Environment: `node`. Tests for `formatDuration`:

- `formatDuration(undefined)` → `""`
- `formatDuration(0)` → `""`
- `formatDuration(-1)` → `""`
- `formatDuration(30)` → `""` (less than one minute rounds to empty)
- `formatDuration(60)` → `"1m"`
- `formatDuration(90)` → `"1m"` (partial minutes floor)
- `formatDuration(3600)` → `"1hr 00m"`
- `formatDuration(3660)` → `"1hr 01m"`
- `formatDuration(7322)` → `"2hr 02m"` (2h + 122s = 2h2m)
- `formatDuration(59)` → `""` (under one minute)

Tests for `formatCompactNumber`:

- `formatCompactNumber(0)` → `"0"`
- `formatCompactNumber(1)` → `"1"`
- `formatCompactNumber(999)` → `"999"`
- `formatCompactNumber(1000)` → `"1k"`
- `formatCompactNumber(1500)` → `"1.5k"`
- `formatCompactNumber(1100)` → `"1.1k"`
- `formatCompactNumber(10000)` → `"10k"` (whole thousands omit decimal)
- `formatCompactNumber(999999)` → `"1000k"` — or whatever the formula produces (document the boundary behaviour exactly)
- `formatCompactNumber(1_000_000)` → `"1M"`
- `formatCompactNumber(2_500_000)` → `"2.5M"`

---

## Section 6 — `packages/core-contracts`

### 6.1 HTTP Client

**File:** `packages/core-contracts/src/http.spec.ts`

Environment: `node`. Use `jest.spyOn(global, 'fetch')` or `msw` to intercept requests.

Tests:

- Throws `"API client is not configured"` when called before `configureApiClient`
- After `configureApiClient({ baseUrl })`, constructs the correct full URL
- Appends scalar query params as `?key=value`
- Appends array query params by repeating the key (`?tags=a&tags=b`)
- Omits params that are `undefined` or `null`
- Sets `Content-Type: application/json` header on every request
- Injects `Authorization: Bearer <token>` when `getAccessToken` returns a string
- Omits `Authorization` header when `getAccessToken` returns `undefined`
- Throws `"Network request failed"` on fetch rejection (network error)
- Throws `"API 404"` error on 4xx response
- Throws `"API 500"` error on 5xx response
- Returns parsed JSON for `Content-Type: application/json` responses
- Returns raw text for non-JSON responses (e.g., `Content-Type: text/plain`)

### 6.2 Route Smoke Tests

**File:** `packages/core-contracts/src/routes.spec.ts`

Environment: `node`.

Tests:

- Every leaf string value in the `routes` object starts with `"/"`
- No two leaf string values are identical (no accidental duplicate paths)
- `Object.keys(routeAuth)` matches `Object.keys(routes)` exactly — every route section has an auth mode, no extras
- Every key in `routeAuthOverrides` (Phase 15) is a valid leaf path present in the `routes` object

---

## Section 7 — `packages/core-env`

### 7.1 Environment Validation

**File:** `packages/core-env/src/index.spec.ts`

Environment: `node`. Manipulate `process.env` in `beforeEach`/`afterEach`.

Tests (API env):

- Parsing with all required API vars present → returns typed config object
- Missing `DATABASE_URL` → throws a validation error mentioning the var name
- Invalid `DATABASE_URL` format (not a URL) → throws a descriptive error

Tests (Web env):

- `NEXT_PUBLIC_API_URL` present → parsed correctly
- `NEXT_PUBLIC_API_URL` missing → throws or returns `undefined` depending on schema strictness (document the expected behaviour)

---

## Section 8 — `packages/feature-downloads`

### 8.1 Downloads Store

**File:** `packages/feature-downloads/src/store/downloads.store.spec.ts`

Environment: `jsdom`. Reset store between tests.

Tests for state machine transitions:

- `startDownload(id)` creates entry with `status: "pending"` and `progress: 0`
- `startDownload` twice for the same id overwrites (not duplicates) the entry
- `setProgress(id, 50)` transitions to `status: "downloading"` and sets `progress: 50`
- `setProgress` for an unknown id is a no-op (no entry created, no error thrown)
- `setComplete(id, "/path/file.mp3")` transitions to `status: "complete"`, `progress: 100`, sets `localUri`
- `setComplete` for an unknown id is a no-op
- `setError(id, "timeout")` transitions to `status: "error"`, preserves other fields
- `setError` for an unknown id is a no-op
- `removeDownload(id)` removes the entry; `getDownload(id)` returns `undefined` after removal
- `removeDownload` for an unknown id is a no-op

Tests for `getDownload`:

- Returns the correct entry when it exists
- Returns `undefined` when the id has never been added

---

## Section 9 — `packages/feature-navigation`

### 9.1 Section Detection (`get-current-section.web.ts`)

**File:** `packages/feature-navigation/src/utils/get-current-section.web.spec.ts`

Environment: `node`.

Tests:

- `getCurrentSection("/feed")` → `"feed"`
- `getCurrentSection("/feed/recent")` → `"feed"` (sub-route still resolves to section)
- `getCurrentSection("/feed/following")` → `"feed"`
- `getCurrentSection("/library")` → `"library"`
- `getCurrentSection("/library/saved")` → `"library"`
- `getCurrentSection("/library/completed")` → `"library"`
- `getCurrentSection("/live")` → `"live"`
- `getCurrentSection("/account")` → `"account"`
- `getCurrentSection("/account/profile")` → `"account"`
- `getCurrentSection("/account/legal")` → `"account"`
- `getCurrentSection("/")` → `"home"`
- `getCurrentSection("/scholars/some-slug")` → `"home"` (not a section)
- `getCurrentSection("/sign-in")` → `"home"` (auth routes are not sections)

### 9.2 Tab Path Builder (`get-current-section.web.ts`)

**File:** `packages/feature-navigation/src/utils/build-section-tab-path.spec.ts`

Tests for `buildSectionTabPath`:

- `("feed", "popular")` → `"/feed"` (default tab collapses to section root)
- `("feed", "recent")` → `"/feed/recent"`
- `("feed", "following")` → `"/feed/following"`
- `("library", "started")` → `"/library"` (default)
- `("library", "saved")` → `"/library/saved"`
- `("library", "completed")` → `"/library/completed"`
- `("account", "general")` → `"/account"` (default)
- `("account", "profile")` → `"/account/profile"`
- `("account", "legal")` → `"/account/legal"`
- Called without `tabId` → falls back to `DEFAULT_TABS[section]`

### 9.3 Native Route Resolution (`tab-route-config.native.ts`)

**File:** `packages/feature-navigation/src/utils/tab-route-config.native.spec.ts`

Tests for `getRootTabFromPathname`:

- `"/feed"` → `"feed"`
- `"/feed/recent"` → `"feed"`
- `"/library/saved"` → `"library"`
- `"/account/legal"` → `"account"`
- `"/"` → `"search"` (home is the search tab on mobile)
- `"/search"` → `"search"`
- `"/live"` → `"live"`
- `"/unknown/path"` → `"search"` (default)

Tests for `getActiveSubsection`:

- `("/feed", "feed")` → `"popular"` (falls back to default when at section root)
- `("/feed/recent", "feed")` → `"recent"`
- `("/feed/following", "feed")` → `"following"`
- `("/feed/not-a-real-tab", "feed")` → `"popular"` (unknown segment → default)
- `("/library/saved", "library")` → `"saved"`
- `("/library", "library")` → `"started"` (default)

---

## Section 10 — `packages/util-ingest`

### 10.1 Aggregate Computation

**File:** `packages/util-ingest/src/core/run-ingestion.spec.ts`

Environment: `node`. Test the pure helper functions exported or extractable from `run-ingestion.ts`.

Tests for `computePublishedLectureAggregates` (extract or test via the exported pipeline):

- All lectures unpublished → `{ publishedLectureCount: 0, publishedDurationSeconds: 0 }`
- All lectures published with known durations → correct sum
- Some lectures published, some not → counts only published ones
- Published lectures with missing duration → `publishedDurationSeconds` is `null`
- Deleted lectures (`deletedAt` set) are excluded from published count

Tests for `parseDate`:

- `parseDate(undefined)` → `null`
- `parseDate("")` → `null`
- `parseDate("2024-01-15")` → a `Date` instance
- `parseDate("invalid")` → an invalid `Date` (behaviour documentation test)

Tests for `computePublishedAt`:

- `computePublishedAt("published", "2024-01-01")` → uses the provided date string
- `computePublishedAt("published", undefined)` → returns `new Date()` (auto-stamp)
- `computePublishedAt("draft", undefined)` → `null`

### 10.2 Topic Sync

**File:** `packages/util-ingest/src/core/topic-sync.spec.ts`

Environment: `node`. Mock the Prisma `TransactionClient` (typed as `jest.Mocked<Prisma.TransactionClient>`).

Tests for `upsertTopics`:

- Root topics (no `parentSlug`) are upserted first
- Child topics are only upserted after their parent is resolved
- `topicIdBySlug` map is returned with all slugs → IDs
- Circular dependency (A's parent is B, B's parent is A) throws `"Unable to resolve topic parent relationships"`
- Missing parent (child references a slug not in the input list) also throws after one full loop pass

Tests for `resolveTopicIds` (via `syncLectureTopics`):

- Unknown topic slug throws `"Unknown topic slug referenced by lecture: <slug>"`

Tests for `syncCollectionTopics` / `syncSeriesTopics` / `syncLectureTopics`:

- With empty `topicSlugs`: calls `deleteMany` (removing all) and skips `createMany`
- With topics: calls `deleteMany` excluding the new ids, then `createMany` with the resolved ids
- `skipDuplicates: true` is passed to `createMany` (idempotent sync)

---

## Section 11 — `apps/web` E2E (Playwright)

All tests use the production build. `baseURL: http://localhost:3000`.

### 11.1 Auth Flows

**File:** `apps/web/e2e/auth.spec.ts`

Tests:

- `GET /sign-in` renders without errors; the email input is present
- `GET /sign-up` renders without errors; the form is present
- Navigating to `/account` without a session redirects to `/sign-in`
- Navigating to `/account/legal` without a session renders the page (public route, no redirect)

### 11.2 Public Content

**File:** `apps/web/e2e/catalog.spec.ts`

Tests:

- `GET /` loads without a console error or crash
- `GET /feed` loads and is not a redirect
- `GET /live` loads and is not a redirect
- `GET /library` loads (local-first — works without auth)
- `GET /search` loads the search home

### 11.3 Navigation

**File:** `apps/web/e2e/navigation.spec.ts`

Tests:

- On a desktop viewport (`1280 × 800`), the sidebar is visible (`[aria-label="Primary sidebar"]`)
- On a mobile viewport (`375 × 812`), the sidebar is not visible
- Clicking the Feed sidebar item navigates to `/feed`
- Clicking the Library sidebar item navigates to `/library`
- The page title changes appropriately on navigation

---

## Section 12 — `apps/mobile` Unit Tests

The mobile app is UI composition — route files delegate to feature packages. There is no business logic in `apps/mobile/src/app/`. However, hook integrations wired in `features/` and `core/` are worth testing when they contain branching logic.

### 12.1 Tab Route Configuration

These utilities are in `@sd/feature-navigation` and already covered in Section 9.3. No duplication needed in `apps/mobile`.

### 12.2 Provider Wiring Smoke Test

**File:** `apps/mobile/src/providers.spec.tsx`

Environment: `jsdom`. Uses `@testing-library/react-native`.

Test:

- `<ProvidersMobileNative>` renders without throwing (validates provider chain)
- Children are rendered inside the providers

---

## Execution Order

Phases are independent unless noted. Run T1–T5 first (unblocks everything else).

| Phase   | Scope                                                                                                                                          | Type              | Blocks  |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ------- |
| **T1**  | Add jest setup to `domain-playback`, `domain-progress`, `domain-search`, `feature-downloads`, `feature-navigation`, `shared`, `core-contracts` | Setup             | T2–T11  |
| **T2**  | `playback.store.spec.ts`                                                                                                                       | Unit              | —       |
| **T3**  | `progress.store.spec.ts`                                                                                                                       | Unit              | T6      |
| **T4**  | `build-search-result-rows.spec.ts`                                                                                                             | Unit              | —       |
| **T5**  | `format.spec.ts` (formatDuration, formatCompactNumber)                                                                                         | Unit              | —       |
| **T6**  | `progress.sync.spec.ts`                                                                                                                        | Unit              | T3      |
| **T7**  | `downloads.store.spec.ts`                                                                                                                      | Unit              | T1      |
| **T8**  | `get-current-section.web.spec.ts`, `build-section-tab-path.spec.ts`, `tab-route-config.native.spec.ts`                                         | Unit              | T1      |
| **T9**  | `http.spec.ts`                                                                                                                                 | Unit              | T1      |
| **T10** | `routes.spec.ts`                                                                                                                               | Unit              | T1      |
| **T11** | `core-env/src/index.spec.ts`                                                                                                                   | Unit              | —       |
| **T12** | `scholars.service.spec.ts`                                                                                                                     | Unit (API)        | —       |
| **T13** | `library.service.spec.ts`                                                                                                                      | Unit (API)        | —       |
| **T14** | `live.service.spec.ts`                                                                                                                         | Unit (API)        | —       |
| **T15** | `feed.service.spec.ts`                                                                                                                         | Unit (API)        | —       |
| **T16** | `progress.service.spec.ts`                                                                                                                     | Unit (API)        | —       |
| **T17** | `admin-permissions.service.spec.ts`                                                                                                            | Unit (API)        | —       |
| **T18** | `home.service.spec.ts`                                                                                                                         | Unit (API)        | —       |
| **T19** | `run-ingestion.spec.ts`                                                                                                                        | Unit (ingest)     | —       |
| **T20** | `topic-sync.spec.ts`                                                                                                                           | Unit (ingest)     | —       |
| **T21** | `auth-boundary.integration.spec.ts`                                                                                                            | Integration (API) | T12–T17 |
| **T22** | E2E: `auth.spec.ts`, `catalog.spec.ts`, `navigation.spec.ts`                                                                                   | E2E (web)         | —       |
| **T23** | `providers.spec.tsx` (mobile smoke)                                                                                                            | Unit (mobile)     | —       |

T2–T5, T11–T20 are fully independent after T1 and can run in parallel.

---

## Coverage Summary by Layer

| Layer                         | Files to Create                      | Target                                                |
| ----------------------------- | ------------------------------------ | ----------------------------------------------------- |
| `apps/api` services           | 7 service specs + 1 integration spec | All service public methods + auth tiers               |
| `packages/domain-playback`    | 1 store spec                         | All store actions                                     |
| `packages/domain-progress`    | 1 store spec + 1 sync spec           | All store actions + debounce/sync logic               |
| `packages/domain-search`      | 1 util spec                          | Transformer correctness                               |
| `packages/shared`             | 1 util spec                          | All `formatDuration` + `formatCompactNumber` branches |
| `packages/core-contracts`     | 1 http spec + 1 routes spec          | HTTP client behaviour + route constant integrity      |
| `packages/core-env`           | 1 env spec                           | Required var validation                               |
| `packages/feature-downloads`  | 1 store spec                         | All download state transitions                        |
| `packages/feature-navigation` | 3 util specs                         | Section detection, tab path building, native routing  |
| `packages/util-ingest`        | 2 specs                              | Aggregate computation + topic sync algorithm          |
| `apps/web` E2E                | 3 Playwright specs                   | Auth redirect, public content, sidebar navigation     |
| `apps/mobile`                 | 1 provider smoke test                | Provider chain integrity                              |
