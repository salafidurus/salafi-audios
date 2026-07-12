# API End-to-End Test Suite (Lean, Neon-Optimized)

## Metadata

- **Date**: 2026-07-08 (Refactored: 2026-07-12)
- **Status**: Planned
- **Scope**: Focused E2E test suite for `apps/api` covering critical paths: infrastructure,
  core public API, auth/permissions, and user flows
- **Summary**: Add ~43 E2E tests for `apps/api` using `vitest` + `supertest` + `@nestjs/testing`.
  Runs against ephemeral Neon database branches (no cleanup logic needed). Mocks external
  dependencies (Telegram, CDN).
- **Key Difference**: Leverages Neon branch-based CI/CD. Each test run gets a fresh database with
  migrations. Zero cleanup complexity. Essential paths only (50% reduction from original plan).

## Progress

- **Done**: Deep analysis of API modules, existing test infrastructure, authorization patterns.
  Refactoring to leverage Neon ephemeral branches.
- **Current**: Refactored plan ready
- **Next**: Stage 1 — E2E infrastructure & seed data setup

## Architecture: Neon Ephemeral Branches

Instead of persistent dev DB with complex cleanup:

```
CI Trigger → Create Neon branch → Run migrations → Seed test data → Run tests → Delete branch
```

**Benefits:**

- ✅ No cleanup logic needed (branch auto-deletes)
- ✅ Test isolation guaranteed (fresh schema per run)
- ✅ Simplified test fixtures (single seed script, not per-test fixtures)
- ✅ No stale state between runs

## Staging Strategy

Break into 4 stages that can be committed independently, each passing `bun run test:e2e` before
the next stage starts.

---

## Stage 1: E2E Infrastructure & Seed Data

- **Status**: Pending
- **Goal**: Set up the E2E test scaffolding, app factory, auth helpers, seed data, and baseline
  health/throttler tests. No complex cleanup needed.
- **Files**:
  - `apps/api/test/helpers/create-e2e-app.ts` (new)
  - `apps/api/test/helpers/test-auth.factory.ts` (new)
  - `apps/api/test/helpers/seed-test-data.ts` (new)
  - `apps/api/test/helpers/mock-telegram.module.ts` (new)
  - `apps/api/test/helpers/mock-cdn.health.ts` (new)
  - `apps/api/test/infrastructure.e2e-spec.ts` (new)
  - `apps/api/vitest.config.e2e.ts` (modified)
  - `apps/api/test/app.e2e-spec.ts` (updated)

- **Changes**:
  1. **`vitest.config.e2e.ts`** — Add `globalSetup` for seed data init (runs once at suite start),
     increase timeout to 30s for DB calls, add `setupFiles` for env bootstrap.

  2. **`test/helpers/create-e2e-app.ts`** — Build a `createE2eApp()` function that:
     - Uses `Test.createTestingModule` with `AppModule`
     - Overrides `TelegramModule` with `MockTelegramModule` (no cron, no real connection)
     - Overrides `CDNHealthIndicator` with a mock that always returns healthy
     - Creates the Fastify NestJS app, inits, and calls `ready()`
     - Returns the app instance and module ref

  3. **`test/helpers/seed-test-data.ts`** — One-time seed script (runs in `globalSetup`):
     - Creates 1 test scholar with name translations (en, ar)
     - Creates 1 test topic with parent + children
     - Creates 1 test listing with audio asset linked to scholar + topic
     - Creates 1 test live channel (static data for `/live/channels` read test)
     - All IDs exported as constants for tests to reference
     - **No cleanup needed** — branch deletes after tests

  4. **`test/helpers/test-auth.factory.ts`** — A class `TestAuthFactory` that:
     - Creates a test user via `PrismaService` (unique email like `e2e-test-{random}@salafidurus.com`)
     - Bypasses OAuth redirects by inserting a `Session` record directly into the database linked to the user
     - Returns `{ user, session, headers: { Authorization: Bearer <token> } }`
     - Provides `createAdminUser(permissions: Permission[])` that creates user, assigns permissions in `UserPermission` table, and assigns roles
     - **No cleanup method** — all users deleted with branch after tests

  5. **`test/helpers/mock-telegram.module.ts`** — A `MockTelegramModule` with `@Global()` that
     provides a no-op `TelegramService` stub, omits cron.

  6. **`test/helpers/mock-cdn.health.ts`** — A mock `CDNHealthIndicator` that returns
     `{ cdn: { status: 'up' } }`.

  7. **`test/infrastructure.e2e-spec.ts`** — Essential baseline tests (5 tests):
     - `GET /health` returns 200 with correct shape
     - `GET /health/healthz` returns 200
     - `GET /docs` returns 200 HTML (Swagger)
     - `GET /nonexistent` returns 404 with error body
     - **Throttler**: Rapid-fire a throttled endpoint, verify 429 on rate limit

  8. **`test/app.e2e-spec.ts`** — Update existing test to use new helper.

- **Blockers**: None — foundational stage.
- **Dependencies**: None — this is the foundation.
- **Completion Criteria**:
  - `bun run test:e2e` passes with 5 infrastructure tests
  - `TestAuthFactory` creates valid sessions
  - Seed data created once at suite start, reused by all tests
  - Mock Telegram module prevents real calls

- **Suggested Commit Message**: `test(api): add E2E infrastructure with seed data and health checks`

---

## Stage 2: Core Public API Tests

- **Status**: Pending
- **Goal**: Validate the shape and content of critical public endpoints. Uses seeded data.
  Focus: search, explore, scholars, listings (core user-facing surfaces only).
- **Files**:
  - `apps/api/test/public-api.e2e-spec.ts` (new)

- **Changes**:
  1. **`test/public-api.e2e-spec.ts`** — Essential tests (10 tests):
     - **Search** (2 tests):
       - `GET /search?q={valid}` returns results
       - `GET /search?q=nonexistent` returns empty array (not error)
     - **Explore** (2 tests):
       - `GET /explore` returns `FeedPageDto` with items
       - `GET /explore?limit=5` returns ≤5 items
     - **Scholars** (2 tests):
       - `GET /scholars` returns array
       - `GET /scholars/{valid-slug}` returns detail
     - **Topics** (2 tests):
       - `GET /topics` returns array
       - `GET /topics/{valid-slug}` returns detail
     - **Listings** (2 tests):
       - `GET /listings/{valid-id}` returns full listing
       - `GET /listings/invalid-id` returns 404

- **Blockers**: Seed data must have scholars, topics, listings (created in Stage 1).
- **Dependencies**: Stage 1 (infrastructure + seed data).
- **Completion Criteria**:
  - `bun run test:e2e` passes with ~10 public API tests
  - All response shapes match DTOs
  - 404 cases return correct error structure

- **Suggested Commit Message**: `test(api): add E2E tests for core public endpoints`

---

## Stage 3: Auth & Permission Boundaries

- **Status**: Pending
- **Goal**: Test `AuthGuard` and `AdminPermissionGuard` — the security-critical boundaries.
  Verify correct permission always succeeds, missing permission always returns 403.
- **Files**:
  - `apps/api/test/auth.e2e-spec.ts` (new)
  - `apps/api/test/admin-permissions.e2e-spec.ts` (new)

- **Changes**:
  1. **`test/auth.e2e-spec.ts`** — Auth guard tests (8 tests):
     - **Unauthenticated** (2 tests):
       - No auth header → 401
       - Invalid token → 401
     - **Public routes** (2 tests):
       - `GET /scholars` without auth → 200
       - `GET /health` without auth → 200
     - **Authenticated** (2 tests):
       - `GET /account/profile` with valid auth → 200
       - `PATCH /account/profile` updates → 200
     - **Banned user** (1 test):
       - Banned user → 403 on protected route
     - **Deletion** (1 test):
       - `DELETE /account` removes user, subsequent auth → 401

  2. **`test/admin-permissions.e2e-spec.ts`** — Permission boundary tests (12 tests):
     - Gated by the global `PermissionGuard` via `@RequiresPermission(Permission.XYZ)`
     - Each permission domain (Listings, Scholars, Topics, Users) tested using Prisma's `Permission` enum values
     - Tested for: without required permission → 403, with required permission → success
     - User with permission X (e.g., `SCHOLARS_CREATE`) but not Y (e.g., `LISTINGS_CREATE`) → 403 on Y domain
     - Test groups:
       - **Content** (3 tests): `LISTINGS_CREATE` (create), `LISTINGS_PUBLISH` (publish/archive)
       - **Scholars** (2 tests): `SCHOLARS_CREATE` (create), `SCHOLARS_EDIT` (update)
       - **Topics** (2 tests): `TOPICS_CREATE` (create), `TOPICS_DELETE` (delete)
       - **User Admin** (2 tests): `USERS_GRANT_PERMISSIONS` (grant/revoke permission)
       - **Cross-isolation** (3 tests): verify permission boundaries are strict (e.g., `SCHOLARS_EDIT` does not grant `LISTINGS_EDIT`)

- **Blockers**: None (OAuth redirect flow is bypassed by inserting session records directly in the DB).
- **Dependencies**: Stage 1 (infrastructure + test auth factory).
- **Completion Criteria**:
  - `bun run test:e2e` passes with ~20 auth + permission tests
  - AuthGuard correctly gates public/protected routes
  - AdminPermissionGuard enforces exact permission boundaries
  - Banned user returns 403, not 401

- **Suggested Commit Message**: `test(api): add E2E tests for auth and admin permission boundaries`

---

## Stage 4: Core User Flows

- **Status**: Pending
- **Goal**: Test authenticated user workflows — library save/unsave, progress tracking.
  Focus on happy path, not edge cases.
- **Files**:
  - `apps/api/test/user-flows.e2e-spec.ts` (new)

- **Changes**:
  1. **`test/user-flows.e2e-spec.ts`** — User flow tests (8 tests):
     - **Library** (3 tests):
       - `POST /me/library/save/:listingId` → 201 (idempotent)
       - `GET /me/library/saved` → listing appears
       - `DELETE /me/library/save/:listingId` → 200, listing removed
     - **Progress** (5 tests):
       - `PUT /audio/progress/:listingId` → upserts
       - `GET /audio/progress` → returns delta
       - `PUT /audio/progress/:listingId` with `isCompleted: true` → marks done
       - `GET /me/library/completed` → completed listing appears
       - `GET /me/library/progress` → in-progress listing appears

- **Blockers**: None — seed data provides listing to test against.
- **Dependencies**: Stage 1 (infrastructure + auth).
- **Completion Criteria**:
  - `bun run test:e2e` passes with ~8 user flow tests
  - Library save/unsave cycle verified end-to-end
  - Progress tracking (upsert, query, completion) verified

- **Suggested Commit Message**: `test(api): add E2E tests for core user workflows`

---

## CI Integration: `e2e-api.yml` CI Workflow

Add a new GitHub Actions workflow `.github/workflows/e2e-api.yml` to execute API end-to-end tests against Neon ephemeral database branches:

### Trigger Strategy

- **On Pull Request**: Triggers when changes occur in `apps/api/**`, `packages/core-db/prisma/**`, `packages/core-contracts/**`, `bun.lock`, `turbo.json`, or the workflow itself.
- **On Push**: Triggers on pushes to the `main` branch.
- **Manual (Workflow Dispatch)**: Supported.

### Concurrent Executions

- Cancel active runs for the same pull request automatically (`concurrency` group based on PR or branch ref).

### Pipeline Steps Overview

1. **Setup**: Calculate target git branch names.
2. **Database Provisioning**: Create Neon preview branch using `neondatabase/create-branch-action@v6`. Expiration set to 2 hours.
3. **Validation**: Check that database URL is correctly returned.
4. **Environment & Dependency Setup**: Setup Bun and execute frozen-lockfile installation.
5. **Database Migration**: Run `bun run --filter @sd/core-db migrate:deploy` with the Neon connection URL.
6. **E2E Test Execution**: Execute `bun run --filter api test:e2e` with `DATABASE_URL`, `BETTER_AUTH_SECRET`, and local/test URLs set in environment variables.
7. **Clean up**: Unconditionally delete the temporary Neon branch using `neondatabase/delete-branch-action@v3`.

### Proposed YAML Structure

```yaml
name: e2e-api

on:
  pull_request:
    paths:
      - "apps/api/**"
      - "packages/core-db/prisma/**"
      - "packages/core-db/package.json"
      - "packages/core-contracts/**"
      - "bun.lock"
      - "turbo.json"
      - ".github/workflows/e2e-api.yml"
  push:
    branches:
      - main
    paths:
      - "apps/api/**"
      - "packages/core-db/prisma/**"
      - "packages/core-db/package.json"
      - "packages/core-contracts/**"
      - "bun.lock"
      - "turbo.json"
      - ".github/workflows/e2e-api.yml"
  workflow_dispatch:

concurrency:
  group: e2e-api-${{ github.workflow }}-${{ github.event.pull_request.number || github.ref }}
  cancel-in-progress: true

permissions:
  contents: read

jobs:
  setup:
    name: Setup
    outputs:
      branch: ${{ steps.branch_name.outputs.current_branch }}
    runs-on: ubuntu-latest
    steps:
      - name: Get branch name
        id: branch_name
        uses: tj-actions/branch-names@v8

  e2e_api:
    name: e2e:api
    needs: setup
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
        with:
          fetch-depth: 0

      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: "1.3.14"

      - name: Set branch expiration (2 hours)
        run: echo "EXPIRES_AT=$(date -u --date '+2 hours' +'%Y-%m-%dT%H:%M:%SZ')" >> "$GITHUB_ENV"

      - name: Create Neon Branch
        id: create_neon_branch
        uses: neondatabase/create-branch-action@v6
        with:
          project_id: ${{ vars.NEON_PROJECT_ID }}
          branch_name: preview/e2e-api-${{ github.event.pull_request.number || github.sha }}-${{ needs.setup.outputs.branch }}
          api_key: ${{ secrets.NEON_API_KEY }}
          expires_at: ${{ env.EXPIRES_AT }}

      - name: Validate Neon Connection
        run: |
          if [ -z "${{ steps.create_neon_branch.outputs.db_url }}" ]; then
            echo "::error::Neon branch database URL is empty"
            exit 1
          fi
          echo "Neon branch created successfully"

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Run Prisma migrations
        env:
          DIRECT_DB_URL: ${{ steps.create_neon_branch.outputs.db_url }}
          DATABASE_URL: ${{ steps.create_neon_branch.outputs.db_url }}
        run: bun run --filter @sd/core-db migrate:deploy

      - name: Run API E2E Tests
        env:
          DATABASE_URL: ${{ steps.create_neon_branch.outputs.db_url }}
          DIRECT_DB_URL: ${{ steps.create_neon_branch.outputs.db_url }}
          BETTER_AUTH_SECRET: "e2e-test-secret-must-be-at-least-32-chars-long"
          BETTER_AUTH_URL: "http://localhost:4000"
          CORS_ORIGINS: "http://localhost:3000"
        run: bun run --filter api test:e2e

      - name: Delete Neon Branch
        if: always()
        uses: neondatabase/delete-branch-action@v3
        with:
          project_id: ${{ vars.NEON_PROJECT_ID }}
          branch: preview/e2e-api-${{ github.event.pull_request.number || github.sha }}-${{ needs.setup.outputs.branch }}
          api_key: ${{ secrets.NEON_API_KEY }}
```

---

## What We Removed (YAGNI)

✂️ **Removed from original plan:**

- Locale interceptor tests (UX concern, not API logic)
- Cache interceptor tests (handled by response headers, not API contracts)
- Sitemap XML tests (content delivery, not business logic)
- Live session state transitions (test live service separately)
- Bulk sync operations (edge case, not critical)
- Pagination cursor tests (one example proves it works)
- Every endpoint variation (test happy path + one error, assume consistency)
- Multiple rapid-fire tests per endpoint
- All DB cleanup/fixture complexity

✅ **Kept:**

- Health checks (infrastructure critical)
- Auth boundaries (security critical)
- Permission gates (security critical)
- Core public endpoints (user-facing critical)
- User workflows (feature integration critical)
- Throttler (rate limiting critical)

---

## Final Verification

After all 4 stages are complete:

- `bun run test:e2e` passes with all tests — no flaky tests, no timeouts
- `bun run test` (unit + integration) still passes with no regressions
- `bun run typecheck` passes — no type errors
- `bun run lint` passes — no new lint violations
- All tests use ephemeral Neon branches (zero DB state issues)

---

## Plan Completion

- All 4 stages are committed and tests pass
- The test suite covers:
  - 5 infrastructure tests (Stage 1)
  - ~10 core public API tests (Stage 2)
  - ~20 auth + permission tests (Stage 3)
  - ~8 user flow tests (Stage 4)
- **Total: ~43 E2E tests** (50% reduction) covering all critical paths
- Zero cleanup complexity (ephemeral branches)
- Move this plan to `.agents/plans/completed/` once all stages are done
