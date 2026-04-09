# Metadata

- **Date:** 2026-04-07
- **Status:** In Progress
- **Scope:** Full monorepo — `packages/design-tokens`, `apps/api`, `apps/web`, `apps/mobile`,
  `apps/livestreams` (new), `packages/domain-*`, `packages/core-contracts`, `packages/core-db`
- **Summary:** Establish the cross-platform design token recipe system, fix TypeScript
  deprecation noise, implement missing features (feed, library, scholar detail, lecture detail),
  add a granular admin permission system, and create the `apps/livestreams` NestJS service with
  Telegram MTProto integration. The monorepo restructure (dissolving feature packages and the
  shared package into `apps/web/src/features/`, `apps/mobile/src/features/`,
  `apps/web/src/shared/`, and `apps/mobile/src/shared/`) is **fully complete**.
- **Dependencies:**
  - `packages/core-db` Prisma schema and generated client underpin all API work
  - `packages/core-contracts` must be updated whenever API response shapes change
  - Stage 0 (design token recipes) must be complete before feature phases use accent surfaces
  - See also: `2026-04-07-cross-platform-ui-color-integration-plan.md` (Stage 0 detail)
  - See also: `2026-04-07-test-plan.md` (test coverage work)

---

# Progress

## Done

- Monorepo restructure — **fully complete**:
  - Dissolved: `@sd/core-styles`, `@sd/shared`, `@sd/core-env`, `@sd/core-config`,
    `@sd/core-auth`, all `packages/feature-*` packages
  - Features now live in `apps/web/src/features/<name>/` and `apps/mobile/src/features/<name>/`
  - Shared primitives live in `apps/web/src/shared/` and `apps/mobile/src/shared/`
  - Unistyles bootstrap: `apps/web/src/core/styles/unistyles.ts` and
    `apps/mobile/src/core/styles/unistyles.ts`
- Design token recipe files exist:
  - `packages/design-tokens/src/recipes/shared.ts`
  - `packages/design-tokens/src/recipes/web.ts`
  - `packages/design-tokens/src/recipes/native.ts`
  - `packages/design-tokens/src/theme/web.ts` (with recipe projections)
  - `packages/design-tokens/src/theme/native.ts` (with recipe projections)
- **Stage 0 — Cross-platform UI color integration — complete** ✅:
  - `packages/design-tokens` exports `createAccentRecipesWeb` + `createAccentRecipesNative`
  - `apps/web/src/app/theme-css.ts` is a pure projector — all CSS vars emitted from recipes
  - Feature color audit done — all ad hoc hex/rgba replaced with CSS vars / theme tokens
- `AccentGradientFill` web + native — in `apps/web/src/shared/` and `apps/mobile/src/shared/`
- Button primary variant web + native — in `apps/web/src/shared/` and `apps/mobile/src/shared/`
- API service specs: auth guard, topics, search utils, scholars, library, admin-permissions,
  home, lectures, live, feed, progress — all ✅

## Blocked / Uncertain

- None currently identified.

## Immediate Next Step

Stage 0 complete. See `.agents/plans/completed/2026-04-07-cross-platform-ui-color-integration-plan.md`
for the full record. Next: proceed with remaining feature implementation phases.

---

# Architecture Context

## Content Hierarchy

| Term                   | Definition                                           | DB shape                                                       |
| ---------------------- | ---------------------------------------------------- | -------------------------------------------------------------- |
| **Standalone Lecture** | Single playable audio lecture not part of any series | `Lecture` where `seriesId = null`                              |
| **Standalone Series**  | Series of lectures not inside any collection         | `Series` where `collectionId = null`                           |
| **Collection**         | Named grouping of series belonging to a Scholar      | `Collection` → `Series[]` → each `Series` contains `Lecture[]` |

- DTOs: `StandaloneLectureDto`, `StandaloneSeriesDto`, `CollectionSummaryDto`
- Component props: `contentKind: 'standalone_lecture' | 'standalone_series' | 'collection'`
- Feed discriminator: `kind: 'lecture' | 'series' | 'collection'`

## Auth vs Public Endpoint Reference

| Endpoint                                                      | Auth                   |
| ------------------------------------------------------------- | ---------------------- |
| `GET /scholars`, `/scholars/:slug`, `/scholars/:slug/content` | Public                 |
| `GET /lectures/:id`                                           | Public                 |
| `GET /home/quickbrowse`                                       | Public + optional auth |
| `GET /feed`, `GET /feed/scholars`                             | Public                 |
| `GET /live/active`, `/live/upcoming`, `/live/ended`           | Public                 |
| `GET /topics`, `GET /search`                                  | Public                 |
| `GET /me/library/*`, `GET /me/progress/*`                     | **Auth required**      |
| `POST /me/progress/:lectureId`                                | **Auth required**      |
| `POST/DELETE /me/library/saved/:lectureId`                    | **Auth required**      |
| `POST/PATCH/DELETE /admin/*`                                  | **Auth + permission**  |

Anonymous users get a fully functional library backed by local storage. API endpoints are only
called when authenticated. On sign-in, local data syncs to the server.

## Dependency Layer (Current Architecture)

```
Layer 0 — packages/design-tokens, packages/core-contracts, packages/core-db
Layer 1 — packages/core-api, packages/util-ingest, packages/util-*
Layer 2 — packages/domain-search, packages/domain-playback, packages/domain-progress,
           packages/domain-content, packages/domain-account
Layer 3 — apps/web (src/core/, src/shared/, src/features/, src/app/)
           apps/mobile (src/core/, src/shared/, src/features/, src/app/)
           apps/api
           apps/livestreams (new)
```

No `apps/*` → `apps/*` imports. No `packages/*` → `apps/*` imports.

## Domain vs Feature Rule

Create a `domain-*` package when state or logic must be shared across multiple feature areas.
A domain package owns: Zustand stores, local-storage adapters, sync logic, platform-agnostic
business rules. It has no UI.

Feature code in `apps/web/src/features/` and `apps/mobile/src/features/` owns screen
composition and UI. It may depend on domain packages for state.

**Current domain packages:**

| Package           | Owns                                        | Consumed by                                               |
| ----------------- | ------------------------------------------- | --------------------------------------------------------- |
| `domain-search`   | Search query state, filters, history        | `features/search`                                         |
| `domain-playback` | Audio engine, play/pause/seek/queue store   | `features/playback`, `features/lecture`, mini-player      |
| `domain-progress` | Progress store, local-storage adapter, sync | `features/library`, `features/lecture`, `features/search` |
| `domain-content`  | Content hooks shared across features        | Various features                                          |
| `domain-account`  | Account/profile state hooks                 | `features/account`                                        |

---

# Staging Strategy

1. **Stage 0** — Design token recipe system (In Progress — partially done)
2. **Stage 1** — TypeScript deprecation noise removal (baseUrl cleanup) — Done ✅
3. **Stage 2** — Feed feature implementation
4. **Stage 3** — Library feature implementation
5. **Stage 4** — Scholar detail screen
6. **Stage 5** — Lecture detail screen
7. **Stage 6** — Admin permissions system
8. **Stage 7** — Livestreams service (`apps/livestreams`)

---

## Stage 0: Design Token Recipe System

**Status:** In Progress

**Goal:** Make `packages/design-tokens` the single source of truth for all accent recipe
semantics. Make `apps/web/src/app/theme-css.ts` a pure projector. Ensure feature code in
`apps/web/src/features/` and `apps/mobile/src/features/` uses the theme system consistently.

**Remaining work (partially done — see cross-platform UI color plan for full detail):**

- Add missing recipes: `selectedSurface`, `selectedContent`, `secondarySupportingBadge`,
  `mixedPromotedPanel` to `packages/design-tokens/src/recipes/`
- Export recipe types from `packages/design-tokens/src/index.native.ts` and `index.web.ts`
- Refactor `apps/web/src/app/theme-css.ts` — remove local computations for `chromeSurface`,
  `chromeSurfaceStrong`, `chromeBorder`, `chromeBorderStrong`, `hoverAccentSurface`,
  `screenWashPrimary`, `screenWashSecondary`, `screenWashMixed`; project from recipes instead
- Audit `apps/web/src/features/` and `apps/mobile/src/features/` for ad hoc color treatments

**Files:**

- `packages/design-tokens/src/recipes/shared.ts`
- `packages/design-tokens/src/recipes/web.ts`
- `packages/design-tokens/src/recipes/native.ts`
- `packages/design-tokens/src/index.web.ts`
- `packages/design-tokens/src/index.native.ts`
- `apps/web/src/app/theme-css.ts`
- `apps/web/src/features/**` (audit)
- `apps/mobile/src/features/**` (audit)

**Blockers:** None currently identified.

**Dependencies:** None — foundational.

**Completion Criteria:**

- `pnpm --filter design-tokens typecheck` passes.
- `apps/web/src/app/theme-css.ts` contains no inline color computations.
- `pnpm dev:web` — auth page, search home, nav active state render correctly (light + dark).
- `pnpm dev:mobile` — no visual regressions.
- `pnpm typecheck` passes across all workspaces.

**Suggested Commit Message:**

```
feat(design-tokens): complete recipe system — add missing recipes, make theme-css.ts a
pure projector, update feature usage

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

---

## Stage 1: TypeScript Deprecation Noise Removal

**Status:** Done ✅

**Goal:** Remove `baseUrl` from all package and app `tsconfig.json` files. Replace with
explicit `paths` entries where needed. Eliminate TypeScript 5.9 `baseUrl` deprecation warnings.

**Files:**

- Every `packages/*/tsconfig.json` that sets `"baseUrl"`
- `apps/web/tsconfig.json`
- `apps/mobile/tsconfig.json` (if it sets `baseUrl`)
- `apps/api/tsconfig.json`

**Changes:**

- For packages with `moduleResolution: "Bundler"` and `@/` path aliases: remove `baseUrl`,
  add `"paths": { "@/*": ["./src/*"] }`.
- For packages with `moduleResolution: "Bundler"` and no `@/` aliases: remove `baseUrl` with
  no replacement.
- For `apps/api` (`module: "commonjs"`, NestJS): remove `baseUrl: "./"`, add explicit `paths`
  if any `@/` imports exist; leave `moduleResolution` as default (`node`).
- Do not touch `packages/util-config/tsconfig/packages.json` — it is already correct.

**Blockers:** None currently identified.

**Dependencies:** None.

**Completion Criteria:**

- `grep -r '"baseUrl"' packages apps --include="tsconfig*.json"` returns no results.
- `pnpm typecheck` passes across all workspaces.
- `pnpm build` succeeds for all apps and packages.

**Suggested Commit Message:**

```
chore(tsconfig): replace baseUrl with explicit paths, remove TS deprecation warnings

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

---

## Stage 2: Feed Feature Implementation

**Status:** Pending

**Goal:** Implement the ranked infinite-scroll Feed feature. Anonymous users get a generic
ranked feed; personalization hints (scholar/topic slugs from local state) are passed as query
params.

**Files:**

- `apps/api/src/modules/feed/feed.module.ts`
- `apps/api/src/modules/feed/feed.controller.ts`
- `apps/api/src/modules/feed/feed.service.ts`
- `apps/api/src/modules/feed/feed.repo.ts`
- `apps/api/src/app.module.ts`
- `packages/core-contracts/src/types/feed.ts`
- `apps/web/src/features/feed/` (hooks, components, screens)
- `apps/mobile/src/features/feed/` (hooks, components, screens)
- `apps/web/src/app/(main)/feed/page.tsx`
- `apps/mobile/src/app/(tabs)/(feed)/index.tsx`

**Changes:**

- API: `GET /feed` — paginated cursor-based; `FeedItemDto` discriminated union on
  `kind: 'lecture' | 'series' | 'collection' | 'scholar_row' | 'topic_row'`. Scoring:
  analytics play count (30d) × 0.5 + `isFeatured` × 0.3 + recency decay × 0.2.
  Inject horizontal sections every 4–5 vertical items server-side.
- API: `GET /feed/scholars` — top 12 ranked scholars.
- Both endpoints are `@Public()`.
- `FeedItemDto` union type in `packages/core-contracts/src/types/feed.ts`.
- Feature: `use-feed.ts` infinite TanStack Query hook; `FeedList`, `FeedContentCard`,
  `FeedScholarRow`, `FeedTopicRow` components (web + native); responsive screens using
  `ScreenView`.

**Blockers:** Depends on Stage 0 for correct accent surface usage in feed cards.

**Dependencies:** Stage 0 complete (for design tokens); otherwise independent.

**Completion Criteria:**

- `pnpm --filter api test` passes including feed service spec.
- `pnpm --filter api test -- src/modules/feed/feed.service.spec.ts` passes.
- `pnpm typecheck` passes.
- `pnpm dev:web` — feed screen renders with ranked content, horizontal sections visible.
- `pnpm dev:mobile` — feed screen renders without errors.

**Suggested Commit Message:**

```
feat(feed): implement ranked infinite-scroll feed API and screens

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

---

## Stage 3: Library Feature Implementation

**Status:** Done ✅

**Goal:** Implement the Library feature with full local-first support. Anonymous users get a
functional library backed by local storage. Authenticated users get the same UI backed by the
API, with local data synced on sign-in.

**Files:**

- `apps/api/src/modules/library/` (controller, service, repo, DTOs)
- `apps/api/src/modules/progress/` (controller, service, repo + sync endpoints)
- `apps/api/src/app.module.ts`
- `packages/core-contracts/src/types/library.ts`
- `packages/domain-progress/src/store/progress.store.ts` (extend to include saves)
- `packages/domain-progress/src/sync/progress.sync.ts` (extend to sync saves)
- `apps/web/src/features/library/` (screens, hooks, components)
- `apps/mobile/src/features/library/` (screens, hooks, components)
- `apps/web/src/features/auth/` (call sync after sign-in if not already wired)
- `apps/mobile/src/features/auth/` (call sync after sign-in if not already wired)

**Changes:**

- API library endpoints (all require `@Auth()`):
  `GET /me/library/progress`, `GET /me/library/completed`, `GET /me/library/saved`,
  `POST /me/library/saved/:lectureId`, `DELETE /me/library/saved/:lectureId`,
  `POST /me/progress/:lectureId`, `POST /me/progress/sync`, `POST /me/library/saved/sync`.
- Extend `domain-progress` store: add `savedIds`, `addSaved`, `removeSaved`, `isSaved` backed
  by same local-storage adapter. Read existing store before writing.
- Extend `progress.sync.ts`: push saved IDs via `POST /me/library/saved/sync` after progress
  sync. Read existing sync logic before writing.
- Feature: three lazy hooks (`use-library-progress`, `use-library-saved`,
  `use-library-completed`) each switching between API (auth) and local store (anonymous).
  Screens: `LibraryProgressList`, `LibrarySavedList`, `LibraryCompletedList` (web + native).
  All screens use `ScreenView`.

Local storage key schema:

```
sd:progress:{lectureId}  →  { positionSeconds, isCompleted, updatedAt }
sd:saved:{lectureId}     →  { savedAt }
```

**Blockers:** None currently identified. Must read existing domain-progress source before
extending.

**Dependencies:** Stage 0 for accent surfaces (save button state indicator).

**Completion Criteria:**

- `pnpm --filter api test` passes including library and progress specs.
- `pnpm --filter domain-progress test` passes with new save action tests.
- `pnpm typecheck` passes.
- `pnpm dev:web` — library screen shows In Progress / Saved / Completed tabs.
- `pnpm dev:mobile` — library screen renders for anonymous users using local data.

**Suggested Commit Message:**

```
feat(library): local-first library feature with anonymous support and post-signin sync

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

---

## Stage 4: Scholar Detail Screen

**Status:** Done

**Goal:** Implement scholar detail pages on web and mobile. Three public API endpoints; one
new feature area in `apps/web/src/features/scholar/` and `apps/mobile/src/features/scholar/`.

**Files:**

- `apps/api/src/modules/scholars/scholars.module.ts`
- `apps/api/src/modules/scholars/scholars.controller.ts`
- `apps/api/src/modules/scholars/scholars.service.ts`
- `apps/api/src/modules/scholars/scholars.repo.ts`
- `apps/api/src/app.module.ts`
- `packages/core-contracts/src/types/scholars.ts`
- `packages/core-contracts/src/routes.ts`
- `apps/web/src/features/scholar/` (screens, hooks, components)
- `apps/mobile/src/features/scholar/` (screens, hooks, components)
- `apps/web/src/app/(main)/scholars/[slug]/page.tsx`
- `apps/mobile/src/app/(tabs)/(search)/scholar/[slug].tsx`

**Changes:**

- API (all `@Public()`):
  - `GET /scholars` — list active scholars: `ScholarListItemDto[]`
  - `GET /scholars/:slug` — scholar detail: all fields + stats
  - `GET /scholars/:slug/content` — `{ collections, standaloneSeries, standaloneLectures }`,
    paginated with cursor
- Feature web: two-column desktop layout (ScholarHeader left, ScholarContentList right),
  single-column mobile. Wrap with `ScreenView`.
- Feature native: `ScrollView` inside `ScreenViewMobileNative` with ScholarHeader + sectioned
  content list.
- `use-scholar-detail.ts` TanStack Query hook.
- Add `routes.scholars` to `packages/core-contracts/src/routes.ts`.

**Blockers:** None currently identified.

**Dependencies:** Stage 0 for accent surface on scholar header.

**Completion Criteria:**

- `pnpm --filter api test` passes including scholars service spec.
- `pnpm typecheck` passes.
- `pnpm dev:web` — scholar detail page renders with bio, stats, content list.
- `pnpm dev:mobile` — scholar detail screen renders without errors.

**Suggested Commit Message:**

```
feat(scholar): add scholar detail screens and public API endpoints

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

---

## Stage 5: Lecture Detail Screen

**Status:** Pending

**Goal:** Implement lecture detail pages on web and mobile. Single public API endpoint;
feature area in `apps/web/src/features/lecture/` and `apps/mobile/src/features/lecture/`.
Wire play trigger to `domain-playback` and save button to `domain-progress`.

**Files:**

- `apps/api/src/modules/lectures/lectures.module.ts`
- `apps/api/src/modules/lectures/lectures.controller.ts`
- `apps/api/src/modules/lectures/lectures.service.ts`
- `apps/api/src/modules/lectures/lectures.repo.ts`
- `apps/api/src/app.module.ts`
- `packages/core-contracts/src/types/lectures.ts`
- `packages/core-contracts/src/routes.ts`
- `apps/web/src/features/lecture/` (screens, hooks, components)
- `apps/mobile/src/features/lecture/` (screens, hooks, components)
- `apps/web/src/app/(main)/lectures/[id]/page.tsx`
- `apps/mobile/src/app/(tabs)/(search)/lecture/[id].tsx`

**Changes:**

- API (`@Public()`): `GET /lectures/:id` — `LectureDetailDto` with scholar ref, topics,
  primary audio asset, series context (prev/next lecture).
- Feature web (desktop): left column — title, scholar chip, topic chips, description, series
  context bar; right column — play button. Wrap with `ScreenView`.
- Feature web (mobile): single column stacked.
- Feature native: scrollable single column inside `ScreenViewMobileNative`.
- All variants: save/unsave button reading `isSaved(lectureId)` from `domain-progress`;
  play button calling `domain-playback` play action.
- Add `routes.lectures` to `packages/core-contracts/src/routes.ts`.

**Blockers:** Depends on Stage 3 (domain-progress save actions must exist).
Depends on domain-playback play action being implemented.

**Dependencies:** Stage 3 complete.

**Completion Criteria:**

- `pnpm --filter api test` passes including lectures service spec.
- `pnpm typecheck` passes.
- `pnpm dev:web` — lecture detail page renders with title, scholar, topics, play button.
- `pnpm dev:mobile` — lecture detail screen renders; save button state reflects local store.

**Suggested Commit Message:**

```
feat(lecture): add lecture detail screens and public API endpoint

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

---

## Stage 6: Admin Permissions System

**Status:** Pending

**Goal:** Add a granular `AdminPermission` DB model, a permission-aware guard, a decorator,
and CRUD admin endpoints. Replace the single `User.role` string with fine-grained permissions.

**Files:**

- `packages/core-db/prisma/schema.prisma`
- `packages/core-db/prisma/migrations/` (new migration: `add_admin_permissions`)
- `packages/core-contracts/src/types/admin.ts`
- `packages/core-contracts/src/index.ts`
- `apps/api/src/shared/guards/admin-permission.guard.ts`
- `apps/api/src/shared/decorators/requires-permission.decorator.ts`
- `apps/api/src/modules/admin-permissions/admin-permissions.module.ts`
- `apps/api/src/modules/admin-permissions/admin-permissions.controller.ts`
- `apps/api/src/modules/admin-permissions/admin-permissions.service.ts`
- `apps/api/src/modules/admin-permissions/admin-permissions.repo.ts`
- `apps/api/src/app.module.ts`

**Changes:**

DB model:

```prisma
model AdminPermission {
  userId      String
  permission  String
  grantedAt   DateTime @default(now())
  grantedById String?

  user      User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  grantedBy User? @relation("AdminPermissionGranter", fields: [grantedById],
                            references: [id], onDelete: SetNull)

  @@id([userId, permission])
  @@index([userId])
  @@index([permission])
}
```

Permission constants (in `packages/core-contracts/src/types/admin.ts`):

```
manage:scholars, manage:topics, manage:content,
manage:livestreams, manage:users, manage:admin
```

API endpoints (all require `manage:admin`):

- `GET /admin/permissions/:userId`
- `POST /admin/permissions/:userId`
- `DELETE /admin/permissions/:userId/:permission`

**Blockers:** None currently identified.

**Dependencies:** `packages/core-db` Prisma client must be regenerated after schema change.

**Completion Criteria:**

- `pnpm --filter core-db prisma:generate` succeeds after migration.
- `pnpm --filter api test` passes including admin-permissions spec.
- Auth boundary integration tests: `POST /admin/permissions/:userId` returns 403 for a user
  without `manage:admin`.
- `pnpm typecheck` passes.

**Suggested Commit Message:**

```
feat(admin): add granular AdminPermission model, guard, decorator, and CRUD endpoints

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

---

## Stage 7: Livestreams Service

**Status:** Pending

**Goal:** Create `apps/livestreams` — a standalone NestJS service with a Telegram MTProto
connection that polls channels for live session state and writes to the shared DB. The main
API reads live session state from the DB; no direct HTTP coupling between apps.

**Files:**

- `apps/livestreams/` (entire new app)
- `packages/core-db/prisma/schema.prisma` (add `LivestreamChannel`, `LiveSession` models)
- `packages/core-db/prisma/migrations/` (new migration)
- `packages/core-contracts/src/types/live.ts`
- `apps/api/src/modules/live/live.module.ts`
- `apps/api/src/modules/live/live.controller.ts`
- `apps/api/src/modules/live/live.service.ts`
- `apps/api/src/modules/live/live.repo.ts`
- `apps/api/src/app.module.ts`

**Changes:**

DB additions: `LivestreamChannel` model, `LiveSession` model, `LiveSessionStatus` enum.

New app structure:

```
apps/livestreams/src/
  main.ts
  app.module.ts
  telegram/  — gramjs client, connection lifecycle, event listener
  channels/  — admin CRUD for LivestreamChannel (requires manage:livestreams)
  sessions/  — internal: write session state from TelegramMonitor
  shared/    — re-exports PrismaService, env config
```

Main API live endpoints (all `@Public()`, delta-fetching via `?since=<ISO>`):

- `GET /live/active?since=<ISO>` — `status = 'live'`; poll: 15–30s
- `GET /live/upcoming?since=<ISO>` — `status = 'scheduled'`, within 7 days; poll: 2–5 min
- `GET /live/ended?since=<ISO>` — `status = 'ended'`, within 24h; poll: 5–10 min

Response envelope: `{ sessions: LiveSessionPublicDto[], deletedIds: string[], fetchedAt: string }`

Environment variables for `apps/livestreams`:

```
TELEGRAM_API_ID=
TELEGRAM_API_HASH=
TELEGRAM_SESSION=
DATABASE_URL=
```

**Blockers:** Requires Telegram API credentials in environment. gramjs must be added as a
dependency. Confirm gramjs compatibility with the Node version in use.

**Dependencies:** Stage 6 complete (admin permission `manage:livestreams` must exist for
channel management endpoints). Prisma schema from Stage 6 migration must be applied first.

**Completion Criteria:**

- `pnpm --filter core-db prisma:generate` succeeds after new migration.
- `pnpm --filter api test` passes including live service spec.
- `pnpm --filter livestreams build` succeeds.
- `pnpm typecheck` passes across all workspaces.
- `GET /live/active` returns 200 without auth.

**Suggested Commit Message:**

```
feat(livestreams): add apps/livestreams NestJS service with Telegram MTProto integration
and delta-fetch live session endpoints in main API

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

---

# Final Verification

After all stages are complete, confirm:

- `pnpm typecheck` — passes across all workspaces
- `pnpm test` — passes with no regressions
- `pnpm lint` — passes with no new violations
- `pnpm build` — succeeds for all apps and packages
- `pnpm test:e2e` — Playwright E2E passes (smoke, home)
- No references to dissolved packages (`@sd/core-styles`, `@sd/shared`, `@sd/core-env`,
  `@sd/core-config`, `@sd/core-auth`, `packages/feature-*`) in any source file
- All feature phases (Stages 2–7) have passing service specs and typecheck

---

# Plan Completion

This plan is `Completed` when:

1. All eight stages (0–7) are marked `Done`.
2. The Final Verification section passes in full.
3. All feature screens (feed, library, scholar detail, lecture detail) are implemented and
   render correctly on web and mobile.
4. The admin permissions system and livestreams service are deployed and functional.

On completion, move this file to `.agents/plans/completed/` and update status to `Completed`.
