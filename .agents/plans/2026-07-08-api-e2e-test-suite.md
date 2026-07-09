# API End-to-End Test Suite

## Metadata

- **Date**: 2026-07-08
- **Status**: Planned
- **Scope**: Comprehensive end-to-end test suite for `apps/api` covering all 5 tiers: infrastructure,
  public API, auth, admin permissions, and authenticated user flows
- **Summary**: Add ~80+ E2E tests for `apps/api` using `vitest` + `supertest` + `@nestjs/testing`,
  with real better-auth sessions against the existing dev database, and mocked external
  dependencies (Telegram, CDN)
- **Dependencies**: Existing dev DB must be running with test data for read-based tests;
  `better-auth` requires `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL` env vars

## Progress

- **Done**: Deep analysis of all 17 API modules, 70+ endpoints, existing test infrastructure,
  and guard/authorization patterns
- **Current**: Plan written
- **Next**: Stage 1 — infrastructure scaffolding

## Staging Strategy

Break into 5 stages that can be committed independently, each passing `bun run test:e2e` before
the next stage starts.

---

## Stage 1: E2E Test Infrastructure

- **Status**: Pending
- **Goal**: Set up the E2E test scaffolding: test app factory, DB cleanup helpers, auth helpers,
  mocked modules, and the first baseline health-check and throttler tests
- **Files**:
  - `apps/api/test/helpers/create-e2e-app.ts` (new)
  - `apps/api/test/helpers/test-auth.factory.ts` (new)
  - `apps/api/test/helpers/test-db.ts` (new)
  - `apps/api/test/helpers/mock-telegram.module.ts` (new)
  - `apps/api/test/helpers/mock-cdn.health.ts` (new)
  - `apps/api/test/infrastructure.e2e-spec.ts` (new)
  - `apps/api/vitest.config.e2e.ts` (modified)
  - `apps/api/test/app.e2e-spec.ts` (updated)
- **Changes**:
  1. **`vitest.config.e2e.ts`** — Add `globalSetup` for test DB cleanup, increase timeout to 30s
     for real DB calls, add `setupFiles` for env bootstrap. Ensure SWC plugin works with the
     test files.
  2. **`test/helpers/create-e2e-app.ts`** — Build a `createE2eApp()` function that:
     - Uses `Test.createTestingModule` with `AppModule`
     - Overrides `TelegramModule` with `MockTelegramModule` (a module with no cron or real
       Telegram connection)
     - Overrides `CDNHealthIndicator` with a mock that always returns healthy
     - Creates the Fastify NestJS app, inits, and calls `ready()`
     - Returns the app instance and the module ref for accessing providers
  3. **`test/helpers/test-db.ts`** — Utility functions:
     - `cleanTestData(userId)`: Deletes test-created rows (sessions, accounts, progress,
       favorites, admin permissions, listings, scholars, topics created during tests).
       Filtered by a known test marker prefix or explicit test user ID.
     - `ensureTestData()`: Seeds known entities (a test scholar, test topic, test listing
       with audio asset) that read-only tests can query against. These are stable fixtures
       that all tests can reference.
  4. **`test/helpers/test-auth.factory.ts`** — A class `TestAuthFactory` that:
     - Creates a test user directly via `PrismaService` (unique email like
       `e2e-test-{random}@salafidurus.com`)
     - Uses `better-auth` API to create a session for that user (via the `better-auth`
       instance from `auth.instance.ts`)
     - Returns `{ user, session, headers: { Authorization: Bearer <token> } }`
     - Provides `createAdminUser(permissions: string[])` that creates a user + grants admin
       permissions
     - Provides `cleanup(userId)` to remove test user and all related rows
  5. **`test/helpers/mock-telegram.module.ts`** — A `MockTelegramModule` with `@Global()` that
     provides a no-op `TelegramService` stub and omits the `TelegramMonitor` cron entirely.
  6. **`test/helpers/mock-cdn.health.ts`** — A mock `CDNHealthIndicator` that returns
     `{ cdn: { status: 'up' } }`.
  7. **`test/infrastructure.e2e-spec.ts`** — Baseline + throttler tests: - `GET /health` returns 200 with `{ status: 'ok', info: { db: ..., cdn: ... },
error: {}, details: ... }` - `GET /health/healthz` returns 200 with `{ status: 'ok' }` - `GET /health/readyz` returns 200 with `{ status: 'ok' }` - `GET /docs` returns 200 HTML (Swagger UI) - `GET /nonexistent` returns 404 with structured error body - CORS preflight `OPTIONS /scholars` returns correct headers - Helmet security headers present on any response - **Throttler**: rapid-fire a throttled endpoint and verify at least one response is 429
     with the correct error shape
  8. **`test/app.e2e-spec.ts`** — Update the existing test to use the new helper and test
     correct health path (`/health/healthz` instead of `/health/live`).
- **Blockers**: None currently identified.
- **Dependencies**: None — this is the foundational stage.
- **Completion Criteria**:
  - `bun run test:e2e` passes with at least 8 tests
  - Test DB can be cleaned between runs without side effects
  - `TestAuthFactory` can create a user and return valid auth headers
  - Mock Telegram module prevents any real Telegram calls or cron jobs
  - Throttler returns 429 after exceeding rate limit
- **Suggested Commit Message**: `test(api): add E2E test infrastructure with health and throttler checks`

---

## Stage 2: Public API Response Integrity Tests

- **Status**: Pending
- **Goal**: Validate the shape and content of every public (`@Public()`) endpoint. These tests
  assume the dev DB has seeded data (scholars, topics, listings, audio assets). They verify
  contract adherence, locale resolution, pagination, error states, and throttler boundaries.
- **Files**:
  - `apps/api/test/public-api.e2e-spec.ts` (new)
  - `apps/api/test/helpers/test-data.ts` (new — shared test data constants)
- **Changes**:
  1. **`test/helpers/test-data.ts`** — Define constants for known entity slugs/IDs that exist
     in the dev DB (e.g., `KNOWN_SCHOLAR_SLUG`, `KNOWN_TOPIC_SLUG`, `KNOWN_LISTING_SLUG`).
     These are read-only fixtures, not created by tests. Also define known-invalid slugs for
     error-path tests.
  2. **`test/public-api.e2e-spec.ts`** — Test groups (each `describe`):
     - **Search** (`/search`):
       - `GET /search?q={valid}` returns `{ listings: [...], scholars?: [...] }` with correct
         DTO keys
       - `GET /search?q=` (empty) returns empty listings array (not error)
       - `GET /search?q=nonexistent123xyz` returns empty results
       - `GET /search/extended?q={term}` returns results including scholar matches
       - `GET /search?q={arabic}` — non-Latin query works
     - **Explore** (`/explore`):
       - `GET /explore` returns `FeedPageDto` with `items`, `nextCursor`
       - `GET /explore?limit=5` returns ≤5 items
       - `GET /explore?topicSlugs={slug}&scholarSlugs={slug}` filters correctly
       - `GET /explore/recent` returns items sorted by creation date
       - `GET /explore/scholars` returns `{ scholars: ScholarChipDto[] }`
     - **Home** (`/home`):
       - `GET /home/quickbrowse` returns `QuickBrowseDto` with scholars and recent suggestions
       - `GET /home/quickbrowse` without auth does NOT include progress
     - **Scholars** (`/scholars`):
       - `GET /scholars` returns array with locale-aware names and lecture counts
       - `GET /scholars/{valid-slug}` returns detail with stats, bio
       - `GET /scholars/{valid-slug}/content` returns unified ranked listing
       - `GET /scholars/{valid-slug}/topics` returns content grouped by topic
       - `GET /scholars/invalid-slug` returns 404
     - **Topics** (`/topics`):
       - `GET /topics` returns array of all topics
       - `GET /topics/{valid-slug}` returns topic detail
       - `GET /topics/{valid-slug}/children` returns direct children only
       - `GET /topics/{valid-slug}/lectures` returns published lectures
       - `GET /topics/invalid-slug` returns 404
     - **Listing** (`/listings`):
       - `GET /listings/{valid-id}` returns full listing with scholar, topics, audio assets,
         series context
       - `GET /listings/{valid-slug}` resolves by slug
       - `GET /listings/{valid-id}/related` returns related items
       - `GET /listings/invalid-id` returns 404
     - **Audio** (`/audio`):
       - `GET /audio/listings/{valid-id}/stream` returns `{ url, durationSeconds, format }`
       - `GET /audio/listings/invalid-id/stream` returns 404
     - **Sitemap** (`/sitemap`):
       - `GET /sitemap.xml` returns valid XML with scholar and listing URLs
       - XML contains `<?xml` declaration and proper `<urlset>` shape
     - **Live** (`/live`):
       - `GET /live/channels` returns active channels array
       - `GET /live/sessions/active` returns `LiveSessionDeltaDto` with correct shape
       - `GET /live/sessions/upcoming` returns upcoming sessions
     - **Throttler — `@SkipThrottle()` verification**:
       - `@SkipThrottle()` routes (explore, search, live, sitemap, health) never return 429
         under rapid fire
       - Throttled routes (scholars, topics, listings) DO return 429 under rapid fire
     - **Cache** (`CacheInterceptor`):
       - Second `GET /scholars` within 10min returns cached response (same body, same timing)
- **Blockers**: Dev DB must have at least 1 scholar, 1 topic with children, 1 listing with
  audio asset, and 1 live channel/session. Without seed data these tests will fail meaningfully
  (which is itself a useful validation).
- **Dependencies**: Stage 1 (test infrastructure) must be complete.
- **Completion Criteria**:
  - `bun run test:e2e` passes with ~30 tests
  - All public endpoint response shapes match the DTOs defined in `@sd/core-contracts`
  - Locale-aware responses work (check `Accept-Language` header)
  - 404/empty cases return correct error structure
  - `@SkipThrottle()` routes verified immune to rate limiting
- **Suggested Commit Message**: `test(api): add E2E tests for all public API endpoints`

---

## Stage 3: Auth & Session Handling Tests

- **Status**: Pending
- **Goal**: Test the global `AuthGuard` behavior — session validation, public route bypass,
  banned user rejection, and authenticated user flows. Uses real better-auth flow (as chosen).
- **Files**:
  - `apps/api/test/auth.e2e-spec.ts` (new)
- **Changes**:
  1. **`test/auth.e2e-spec.ts`** — Tests (each in isolated user):
     - **Unauthenticated access**:
       - `GET /account/profile` with no auth headers → 401
       - `GET /account/profile` with `Authorization: Bearer invalidtoken` → 401
       - `GET /account/profile` with malformed `Authorization: Bearer` → 401
       - `GET /account/profile` with expired/invalid session → 401
     - **Public route access**:
       - `GET /scholars` (public) with no auth → 200 (not 401)
       - `GET /explore` (public) with no auth → 200
       - `GET /health` (public, skip throttle) → 200
       - `POST /auth/apple/native` (public) → 200 or 400 (validation), never 401
     - **Authenticated access**:
       - `GET /account/profile` with valid auth → 200 returns `UserProfileDto`
       - `PATCH /account/profile` with `{ displayName: "New Name" }` → updates and returns
         profile
       - `GET /explore/following` with auth → 200 returns feed (may be empty)
     - **Banned user**:
       - Create user, ban via DB `user.banned` field, verify protected routes return 403
     - **Role guard** (`@Roles('admin')`):
       - Non-admin user gets 403 on role-gated route
       - Admin user gets 200 on role-gated route
     - **Locale resolution** (`LocaleInterceptor`):
       - Authenticated user with `preferredLanguage: 'ar'` → scholar name resolves to
         Arabic translation
       - `PATCH /auth/me/locale` with `{ locale: 'ar' }` → updates preferred language
       - `GET /account/profile` after locale update returns updated language
     - **Account deletion** (`DELETE /account`):
       - Unauthenticated → 401
       - Authenticated → deletes user, verifies 200
       - After deletion, subsequent auth requests for that user → 401
- **Blockers**: Real better-auth session creation requires `BETTER_AUTH_SECRET` and
  `BETTER_AUTH_URL` to be correctly configured in the test environment. The `bearer()` plugin
  must be enabled (it already is in `auth.instance.ts`).
- **Dependencies**: Stage 1 (infrastructure), Stage 2 (public API tests exist for regression
  check).
- **Completion Criteria**:
  - `bun run test:e2e` passes with ~12-15 auth tests
  - AuthGuard correctly distinguishes public, authenticated, and role-gated routes
  - Banned user gets 403, not 401
  - Locale interceptor correctly resolves from user preference and header
  - Account deletion cleanup works
- **Suggested Commit Message**: `test(api): add E2E tests for auth, session, and locale handling`

---

## Stage 4: Admin Permission Boundary Tests

- **Status**: Pending
- **Goal**: Test every admin endpoint's authorization boundary — the `AdminPermissionGuard`
  combined with the global `AuthGuard`. This is the most security-critical area. Verify that
  lacking the correct permission always returns 403 and having it always succeeds for valid
  requests.
- **Files**:
  - `apps/api/test/admin.e2e-spec.ts` (new)
- **Changes**:
  1. **`test/admin.e2e-spec.ts`** — Test groups:
     - **Setup**: Each test group creates a fresh test user with specific permissions, ensuring
       no cross-test contamination.
     - **Permission introspection**:
       - `GET /admin/permissions/me` returns user's permission array
       - User with no permissions returns empty array
     - **User management** (`manage:admin`):
       - Without `manage:admin` → 403 on ALL `/admin/users/*` endpoints
       - With `manage:admin` → list users, get user permissions
       - Grant permission: `POST /admin/users/:id/permissions` with valid permission → 201
       - Grant invalid permission name → 400 or 422 (validation)
       - Revoke permission: `DELETE /admin/users/:id/permissions/:perm` → removes row
       - Revoke non-existent permission → 404 or appropriate error
     - **Listing CRUD** (`manage:content`):
       - Without `manage:content` → 403 on ALL `/admin/listings/*` endpoints
       - With `manage:content`:
         - `POST /admin/listings` creates listing → 201 with ListingDto
         - `PUT /admin/listings/:id` updates metadata
         - `POST /admin/listings/:id/publish` → listing is published
         - `POST /admin/listings/:id/archive` → listing is archived
         - `POST /admin/listings/bulk` with valid IDs → bulk action succeeds
       - Attempt publish on already-published → idempotent (no error)
       - Attempt archive on already-archived → idempotent
     - **Metadata translation** (`manage:content`):
       - Without permission → 403
       - With permission → `POST /listings/:id/translations` upserts translation
       - `POST /listings/:id/translations/:locale/publish` → translation becomes active
       - `POST /listings/:id/translations/:locale/unpublish` → translation hidden
       - `GET /listings/:id/translations` returns all translations
     - **Scholar CRUD** (`manage:scholars`):
       - Without `manage:scholars` → 403
       - With `manage:scholars` → `POST /admin/scholars` creates scholar
       - `PATCH /admin/scholars/:id` updates scholar
       - Scholar translation endpoints still require `manage:content` (not `manage:scholars`)
     - **Topic CRUD** (`manage:topics`):
       - Without `manage:topics` → 403
       - With `manage:topics` → `POST /admin/topics` creates topic
       - `PATCH /admin/topics/:slug` updates topic
       - `DELETE /admin/topics/:slug` deletes topic (if no dependencies)
     - **Livestream management** (`manage:livestreams`):
       - Without permission → 403
       - With permission → CRUD on channels and sessions
       - `PATCH /admin/live/sessions/:id/status` transitions session state
     - **Media** (`manage:content`):
       - Without `manage:content` → 403 on `POST /admin/media/presigned-url`
       - With `manage:content` → returns `{ uploadUrl, publicUrl, objectKey }`
     - **Cross-permission isolation**:
       - User with `manage:topics` but NOT `manage:scholars` → 403 on scholar endpoints
       - User with `manage:content` but NOT `manage:livestreams` → 403 on live endpoints
       - Verify each permission controls exactly its domain
- **Blockers**: Admin endpoints that modify data (create/update/delete) will leave residue in
  the dev DB. `afterAll` cleanup must use `cleanTestData()` to remove: created listings,
  scholars, topics, admin permissions, translation rows. Test users must be cleaned up via
  `TestAuthFactory.cleanup()`.
- **Dependencies**: Stage 1 (infrastructure), Stage 3 (real auth flow for creating admin users).
- **Completion Criteria**:
  - `bun run test:e2e` passes with ~25 admin tests
  - Every permission check is verified (right permission = 2xx, wrong permission = 403,
    no auth = 401)
  - All created test data is cleaned up after the suite
  - Cross-permission isolation proven (no over-permissive grants)
- **Suggested Commit Message**: `test(api): add E2E tests for admin permission boundaries`

---

## Stage 5: Authenticated User Flow Tests

- **Status**: Pending
- **Goal**: Test authenticated user workflows end-to-end — library (save/unsave/sync), audio
  progress (upsert/sync/delta), and following feed.
- **Files**:
  - `apps/api/test/library.e2e-spec.ts` (new)
- **Changes**:
  1. **`test/library.e2e-spec.ts`** — Tests:
     - **Library — save listing**:
       - `POST /me/library/save/:listingId` without auth → 401
       - `POST /me/library/save/:listingId` → creates favoriteListing, returns 201
       - `GET /me/library/saved` → listing appears in saved list
       - `POST /me/library/save/:listingId` again → idempotent (no duplicate)
     - **Library — unsave listing**:
       - `DELETE /me/library/save/:listingId` → removes favoriteListing, returns 200
       - `DELETE /me/library/save/:listingId` again → idempotent (204 or 200)
       - `GET /me/library/saved` → listing no longer in saved list
     - **Library — bulk sync saves**:
       - `POST /me/library/saved/sync` with array of listing IDs → bulk replaces saved state
       - Verify `GET /me/library/saved` matches the synced set
     - **Library — progress**:
       - `GET /me/library/progress` returns empty initially
       - `GET /me/library/completed` returns empty initially
     - **Audio — progress upsert**:
       - `PUT /audio/progress/:listingId` without auth → 401
       - `PUT /audio/progress/:listingId` with `{ positionSeconds: 300 }` → upserts row
       - `GET /audio/progress` → delta includes this progress item
       - `PUT /audio/progress/:listingId` with `{ positionSeconds: 600, isCompleted: true }`
         → updates
     - **Audio — bulk sync**:
       - `POST /audio/progress/sync` with array of items → bulk upserts
       - Verify latest-wins conflict resolution (timestamp based)
       - `GET /audio/progress?since={old-date}` → returns delta including all items
       - `GET /audio/progress?since={future-date}` → returns empty items
     - **Library — progress listing**:
       - After 2 progress items, `GET /me/library/progress` returns both with cursor
       - Mark one completed → appears in `GET /me/library/completed`
       - Mark all completed → progress empty, completed has items
     - **Explore — following feed**:
       - Without following any scholar, `GET /explore/following` returns empty (or normal
         feed fallback)
- **Blockers**: `followedScholar` table relationship and following implementation — need to
  verify the DB model for following.
- **Dependencies**: Stage 1 (infrastructure), Stage 3 (real auth flow).
- **Completion Criteria**:
  - `bun run test:e2e` passes with ~15 user flow tests
  - Library save/unsave cycle verified end-to-end
  - Progress upsert + bulk sync + delta query all work correctly
  - Cursor pagination works for library lists
  - All test data cleaned up after suite
- **Suggested Commit Message**: `test(api): add E2E tests for library and progress user flows`

---

## Final Verification

After all 5 stages are complete:

- `bun run test:e2e` passes with all tests — no flaky tests, no timeouts
- `bun run test` (unit + integration) still passes with no regressions
- `bun run typecheck` passes — no type errors in test files
- `bun run lint` passes — no new lint violations
- All test-created data is cleaned up from the dev DB after each test suite run
- Tests can be run back-to-back without stale state issues

## Plan Completion

- All 5 stages are committed and tests pass
- The test suite covers:
  - 8 infrastructure + throttler tests (Stage 1)
  - ~30 public API contract + throttler boundary tests (Stage 2)
  - ~12-15 auth/session tests (Stage 3)
  - ~25 admin permission tests (Stage 4)
  - ~15 user flow tests (Stage 5)
- Total: ~90 E2E tests covering every major API surface
- Move this plan to `.agents/plans/completed/` once all stages are done
