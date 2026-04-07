# Test Plan — Salafi Durus Monorepo

> **For agentic workers:** Use superpowers:executing-plans or superpowers:subagent-driven-development to implement this plan.
> **Status:** FINAL — ready to execute.

**Goal:** Establish meaningful test coverage for core functionalities across the monorepo. Not brittle snapshot testing — behavior-driven tests that catch real regressions without requiring constant maintenance.

**Philosophy:**

- Unit test pure logic: stores, utilities, service invariants, data transforms.
- Integration test module boundaries: service + mocked repo, guard + real NestJS module.
- E2E test critical user flows only: public content access, auth protection, navigation.
- **Never** test: presentational-only React/RN components, trivial getters/setters, or framework-provided behavior.

---

## TDD Workflow (Red → Green → Commit)

Every new feature or bug fix follows this sequence:

1. Write a failing test that describes the desired behavior or reproduces the bug.
2. Run it: confirm it fails with the expected error, not a setup error.
3. Write the minimal implementation to make it pass.
4. Run again: confirm it passes.
5. Commit: test and implementation together.

---

## Current Coverage Baseline

| Area                      | Files                                   | State          |
| ------------------------- | --------------------------------------- | -------------- |
| `apps/api` auth guard     | `auth.guard.spec.ts`                    | ✅ covered     |
| `apps/api` topics service | `topics.service.spec.ts`                | ✅ covered     |
| `apps/api` search utils   | `search-error.utils.spec.ts`            | ✅ covered     |
| `apps/api` topics utils   | `topics-error.utils.spec.ts`            | ✅ covered     |
| `apps/web` E2E smoke      | `e2e/smoke.spec.ts`, `e2e/home.spec.ts` | ✅ minimal     |
| Everything else           | —                                       | ❌ not covered |

---

## Packages Needing Jest Setup (Before Tests Can Run)

The following packages need a `jest.config.cjs` and a test script before any tests can be added. Copy the pattern from `packages/core-env/jest.config.cjs`.

```text
packages/domain-progress/
packages/domain-playback/
packages/feature-navigation/
packages/core-contracts/
```

Each needs:

- `jest.config.cjs` with `testEnvironment: "node"` (or `jsdom` for Zustand stores)
- `"test": "jest --passWithNoTests"` in `package.json` scripts

---

## Tier 1: API — Service Invariants (Unit, `apps/api`)

These are the highest-ROI tests. They protect authorization boundaries and domain rules without a running database.

### `scholars.service.spec.ts`

File: `apps/api/src/modules/scholars/scholars.service.spec.ts`
Pattern: same as `topics.service.spec.ts` — mock `ScholarsRepository`, test service in isolation.

Tests:

- `getBySlug` resolves with DTO when scholar is found
- `getBySlug` throws `NotFoundException` when `repo.findBySlug` returns null
- `getStats` throws `NotFoundException` when scholar not found
- `getContent` returns grouped content DTO from repo response

### `library.service.spec.ts`

File: `apps/api/src/modules/library/library.service.spec.ts`

Tests:

- `getSaved` calls repo with the authenticated user's ID
- `getCompleted` calls repo with the authenticated user's ID
- `saveLecture` calls `repo.save` with correct lectureId and userId
- `unsaveLecture` calls `repo.remove` with correct lectureId and userId
- `getProgress` returns progress entries for the user

### `live.service.spec.ts`

File: `apps/api/src/modules/live/live.service.spec.ts`

Tests:

- `getActive` returns only sessions with `status = LIVE`
- `updateStatus` transitions `UPCOMING → LIVE` successfully
- `updateStatus` transitions `LIVE → ENDED` successfully
- `updateStatus` throws `BadRequestException` for invalid transition (e.g., `ENDED → LIVE`)

### `admin-permissions.service.spec.ts`

File: `apps/api/src/modules/admin-permissions/admin-permissions.service.spec.ts`

Tests:

- `hasPermission(userId, 'manage:scholars')` returns `true` when record exists
- `hasPermission(userId, 'manage:scholars')` returns `false` when record absent
- `grantPermission` creates a permission record via repo
- `revokePermission` deletes the permission record via repo
- `revokePermission` throws `NotFoundException` when record does not exist

### `progress.service.spec.ts`

File: `apps/api/src/modules/progress/progress.service.spec.ts`

Tests:

- `update` creates a new progress record when none exists
- `update` updates `positionSeconds` on existing record
- `bulkSync` upserts all provided entries and returns the saved array

---

## Tier 2: API — Auth Boundary (Integration, `apps/api`)

These tests boot the NestJS module and fire HTTP requests against it. They use `supertest` and a mocked `PrismaService`. They verify that the auth layer is wired correctly — not just the guard in isolation.

### `auth-boundary.spec.ts`

File: `apps/api/src/modules/auth/auth-boundary.spec.ts`
Setup: spin up a minimal NestJS `Test.createTestingModule` that includes `AuthModule` + one protected controller. Mock `getAuth` to return no session by default.

Tests:

- `GET /scholars` (public endpoint) returns 200 without an auth token
- `GET /me/library/saved` returns 401 when no session is present
- `GET /me/library/saved` returns 200 when a valid session is injected
- `POST /admin/scholars` returns 403 when user has no `manage:scholars` permission
- `POST /admin/scholars` returns 201 when user has `manage:scholars` permission

---

## Tier 3: Domain Package — Progress Store (Unit, `domain-progress`)

The Zustand store is pure state logic — no network, no side effects. Test via the store's action functions directly.

### `progress.store.spec.ts`

File: `packages/domain-progress/src/store/progress.store.spec.ts`
Environment: `jsdom` (Zustand `create` works in jsdom).
Reset store state between tests with `useProgressStore.setState({ progressMap: {}, savedMap: {} })`.

Tests:

- `setProgress` creates a new entry with correct `positionSeconds` and `durationSeconds`
- `setProgress` preserves `completedAt` when updating an existing entry
- `setProgress` updates `updatedAt` to a new ISO timestamp
- `markCompleted` sets `completedAt` to an ISO string on an existing entry
- `markCompleted` is a no-op when the lectureId does not exist in `progressMap`
- `addSaved(id)` + `isSaved(id)` → `true`
- `removeSaved(id)` + `isSaved(id)` → `false`
- `getSavedIds` returns all keys in `savedMap`
- `loadSaved` merges entries without clobbering entries already in `savedMap`
- `loadProgress` merges entries without clobbering existing `progressMap` entries

---

## Tier 4: Domain Package — Progress Sync (Unit, `domain-progress`)

### `progress.sync.spec.ts`

File: `packages/domain-progress/src/sync/progress.sync.spec.ts`

Tests:

- Sync payload contains all progress entries from `progressMap`
- Sync payload is empty `[]` when `progressMap` is empty
- Sync payload contains all `savedMap` entries under `saved`
- `mergeSyncResponse` upserts server entries (server wins on conflict for position)

---

## Tier 5: Navigation Utilities (Unit, `feature-navigation`)

These are pure string-manipulation functions. No DOM, no React. Fast and robust.

### `get-current-section.web.spec.ts`

File: `packages/feature-navigation/src/utils/get-current-section.web.spec.ts`

Tests:

- `/feed` → `"feed"`
- `/feed/recent` → `"feed"` (sub-route still maps to section)
- `/library/saved` → `"library"`
- `/account/profile` → `"account"`
- `/account/legal` → `"account"`
- `/` → `"home"`
- `/scholars/some-slug` → `"home"` (not a main section)

### `build-section-tab-path.spec.ts`

File: `packages/feature-navigation/src/utils/build-section-tab-path.spec.ts`
(Tests `buildSectionTabPath` from `get-current-section.web.ts`)

Tests:

- `("feed", "popular")` → `"/feed"` (default tab collapses to root)
- `("feed", "recent")` → `"/feed/recent"`
- `("account", "general")` → `"/account"` (default tab collapses to root)
- `("account", "profile")` → `"/account/profile"`
- `("account", "legal")` → `"/account/legal"`
- Called without `tabId` → falls back to `DEFAULT_TABS[section]`

### `tab-route-config.native.spec.ts`

File: `packages/feature-navigation/src/utils/tab-route-config.native.spec.ts`
(Tests `getRootTabFromPathname` and `getActiveSubsection`)

Tests for `getRootTabFromPathname`:

- `/feed` → `"feed"`
- `/feed/recent` → `"feed"`
- `/library/saved` → `"library"`
- `/account/legal` → `"account"`
- `/` → `"search"` (home maps to search on mobile)
- `/search` → `"search"`

Tests for `getActiveSubsection`:

- `("/feed", "feed")` → `"popular"` (falls back to default)
- `("/feed/recent", "feed")` → `"recent"`
- `("/feed/unknown-tab", "feed")` → `"popular"` (unknown tab → default)

---

## Tier 6: Core Contracts — Route Smoke Tests (Unit, `core-contracts`)

These tests are not about logic — they guard against accidental typos in route constants that would silently break navigation.

### `routes.spec.ts`

File: `packages/core-contracts/src/routes.spec.ts`

Tests:

- Every leaf string value in `routes` starts with `"/"`
- No two leaf strings in `routes` are identical (no duplicate paths)
- `Object.keys(routeAuth)` matches `Object.keys(routes)` exactly (no missing or extra keys)
- `routeAuthOverrides` (Phase 15) — every key in `routeAuthOverrides` is a valid path in the `routes` object

---

## Tier 7: Env Validation (Unit, `core-env`)

### `index.spec.ts`

File: `packages/core-env/src/index.spec.ts`

Tests:

- Parsing with all required API vars present → returns typed config object
- Parsing with `NEXT_PUBLIC_API_URL` missing → throws a validation error (fails fast)
- Parsing with an invalid URL format → throws a descriptive validation error

---

## Tier 8: E2E — Web Critical Flows (Playwright, `apps/web`)

These tests run against a production build. Keep them to the flows that cannot be verified by unit tests.

### `auth.spec.ts` (new)

File: `apps/web/e2e/auth.spec.ts`

Tests:

- `GET /sign-in` page renders the sign-in form
- `GET /sign-up` page renders the sign-up form
- Navigating to `/account` while unauthenticated redirects to `/sign-in`

### `catalog.spec.ts` (new)

File: `apps/web/e2e/catalog.spec.ts`

Tests:

- `GET /feed` renders without JS errors (public)
- `GET /live` renders without JS errors (public)
- `GET /library` renders without crashing (local-first, anon works)

### `navigation.spec.ts` (new)

File: `apps/web/e2e/navigation.spec.ts`

Tests:

- On desktop viewport, sidebar is visible
- Clicking the Feed nav item navigates to `/feed`
- Clicking the Library nav item navigates to `/library`

---

## Execution Order (Migration Priority)

| Phase | What                                                                        | Where              | Type        | Prerequisite |
| ----- | --------------------------------------------------------------------------- | ------------------ | ----------- | ------------ |
| T1    | Add jest setup to `domain-progress`, `feature-navigation`, `core-contracts` | packages           | Setup       | —            |
| T2    | `progress.store.spec.ts`                                                    | domain-progress    | Unit        | T1           |
| T3    | `scholars.service.spec.ts`                                                  | apps/api           | Unit        | —            |
| T4    | `library.service.spec.ts`                                                   | apps/api           | Unit        | —            |
| T5    | `live.service.spec.ts`                                                      | apps/api           | Unit        | —            |
| T6    | `admin-permissions.service.spec.ts`                                         | apps/api           | Unit        | —            |
| T7    | `progress.service.spec.ts`                                                  | apps/api           | Unit        | —            |
| T8    | Navigation utility tests                                                    | feature-navigation | Unit        | T1           |
| T9    | `routes.spec.ts`                                                            | core-contracts     | Unit        | T1           |
| T10   | `index.spec.ts`                                                             | core-env           | Unit        | —            |
| T11   | `auth-boundary.spec.ts`                                                     | apps/api           | Integration | T3–T7        |
| T12   | `progress.sync.spec.ts`                                                     | domain-progress    | Unit        | T2           |
| T13   | E2E: `auth.spec.ts`, `catalog.spec.ts`, `navigation.spec.ts`                | apps/web           | E2E         | —            |

T1–T10 are independent and can run in parallel. T11 benefits from the service specs existing first. T12 can run alongside T2.

---

## TDD Going Forward

Every new service, hook, store action, or utility function added to the repo must follow this rule:

- **New API service method** → service spec test first
- **New domain store action** → store spec test first
- **New navigation/util function** → util spec test first
- **New auth boundary** → integration test that verifies 401/403 before the feature is wired
- **New E2E-visible page** → a Playwright test that the page loads without errors

Bug fixes always start with a failing test that reproduces the bug.
