# Native Features Refactoring + Feed → Explore Rename Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Consolidate native feature slices, eliminate dead routes, rename Feed→Explore
across all layers, and merge orphan features (support, legal, i18n, progress, admin\*)
into their logical homes.

**Architecture:** Purely refactoring — no new functionality. File moves, import path
updates, spec mock path updates, and route rewiring. No behavioral changes.

**Tech Stack:** Expo Router, react-native-unistyles, Zustand

---

## Global Constraints

- `apps/native/src/features/` — every feature must have an `index.ts` barrel with named exports.
- `apps/native/src/app/` — routing only; imports from features.
- TDD required: update existing specs to pass before moving on; no regression.
- TypeScript strict mode across all files.
- Design tokens via Unistyles theme (native) — no hardcoded colors.
- All moves preserve git history (use `git mv` via filesystem rename).
- Every stage must pass `bun run typecheck` and `bun run test` scoped to native before stage commit.
- Breaking change on `"feed"` section key is acceptable — no public users.

---

### Stage 0: Delete placeholder routes

**Status:** Planned
**Goal:** Remove `series/[id].tsx` and `collections/[id].tsx` placeholder routes — no stubs.

**Files:**

- Delete: `apps/native/src/app/(content)/series/`
- Delete: `apps/native/src/app/(content)/collections/`

**Changes:**

- Remove entire `series/` directory (contains `[id].tsx`)
- Remove entire `collections/` directory (contains `[id].tsx`)

**Blockers:** None currently identified.

**Completion Criteria:**

- `bun run typecheck --filter native` passes — no dangling imports
- `bun run test --filter native` passes — no broken specs

**Suggested Commit Message:**

```
refactor(native): remove series/[id] and collections/[id] placeholder routes
```

---

### Stage 1: Admin feature merge

**Status:** Planned
**Goal:** Merge 4 admin features (`admin/`, `admin-lectures/`, `admin-live/`, `admin-scholars/`)
into single `features/admin/` with subdirectories. Add barrel. Update 6 spec mock paths.

**Files:**

All 4 source features' contents move into a flat feature structure at `features/admin/`:

```
features/admin/
  api/
    admin-permissions.api.ts           ← from admin/
    admin-lectures.api.ts              ← from admin-lectures/
    admin-live.api.ts                  ← from admin-live/
    admin-scholars.api.ts               ← from admin-scholars/
  hooks/
    use-admin-permissions.ts           ← from admin/
    use-admin-lectures.ts              ← from admin-lectures/
    use-admin-live.ts                  ← from admin-live/
    use-admin-scholars.ts              ← from admin-scholars/
  screens/
    admin-dashboard/                   ← from admin/
    admin-lectures/                    ← from admin-lectures/
    admin-live/                        ← from admin-live/
    admin-scholars/                    ← from admin-scholars/
    admin-scholar-detail/              ← from admin-scholars/
  components/
    AudioUploaderSheet/                ← from admin-lectures/
    BulkActionBar/                     ← from admin-lectures/
    LectureEditSheet/                  ← from admin-lectures/
    ChannelSheet/                      ← from admin-live/
    SessionSheet/                      ← from admin-live/
    CollectionSheet/                   ← from admin-scholars/
    SeriesSheet/                       ← from admin-scholars/
  index.ts                            ← create
```

- Delete: `features/admin-lectures/`, `features/admin-live/`, `features/admin-scholars/`
- Delete: old `features/admin/` contents after moving files

**Barrel exports:**

```typescript
export { AdminDashboardScreen } from "./screens/admin-dashboard/admin-dashboard.screen";
export { AdminLecturesScreen } from "./screens/admin-lectures/admin-lectures.screen";
export { AdminLiveScreen } from "./screens/admin-live/admin-live.screen";
export { AdminScholarsScreen } from "./screens/admin-scholars/admin-scholars.screen";
export { AdminScholarDetailScreen } from "./screens/admin-scholar-detail/admin-scholar-detail.screen";
export { AudioUploaderSheet } from "./components/AudioUploaderSheet/AudioUploaderSheet";
export { BulkActionBar } from "./components/BulkActionBar/BulkActionBar";
export { LectureEditSheet } from "./components/LectureEditSheet/LectureEditSheet";
export { ChannelSheet } from "./components/ChannelSheet/ChannelSheet";
export { SessionSheet } from "./components/SessionSheet/SessionSheet";
export { CollectionSheet } from "./components/CollectionSheet/CollectionSheet";
export { SeriesSheet } from "./components/SeriesSheet/SeriesSheet";
export { useAdminPermissions } from "./hooks/use-admin-permissions";
export { useAdminLectures } from "./hooks/use-admin-lectures";
export { useAdminLive } from "./hooks/use-admin-live";
export { useAdminScholars } from "./hooks/use-admin-scholars";
```

**Spec mock path updates (6 files):**

- `admin/hooks/use-admin-permissions.spec.ts`
- `admin/hooks/use-admin-lectures.spec.ts`
- `admin/components/AudioUploaderSheet/AudioUploaderSheet.spec.ts`
- `admin/components/BulkActionBar/BulkActionBar.spec.ts`
- `admin/components/LectureEditSheet/LectureEditSheet.spec.ts`
- `admin/hooks/use-admin-live.spec.ts`

**Blockers:** None currently identified.

**Dependencies:** Standalone.

**Completion Criteria:**

- `bun run typecheck --filter native` passes
- `bun run test --filter native` passes

**Suggested Commit Message:**

```
refactor(native): merge 4 admin features into single features/admin/ with barrel
```

---

### Stage 2: Merge lecture + scholar into listing

**Status:** Planned
**Goal:** Merge `features/lecture/` and `features/scholar/` into `features/listing/`
to match web's already-refactored structure. Update 5 spec mock paths + 3 route file imports.

**Files:**

Both source features' contents move into a flat feature structure at `features/listing/`:

```
features/listing/
  screens/
    lecture-detail/                      ← from features/lecture/screens/
    scholar-list/                        ← from features/scholar/screens/
    scholar-detail/                      ← from features/scholar/screens/
  components/
    lecture-meta/                        ← from features/lecture/components/
    lecture-play-button/                 ← from features/lecture/components/
    lecture-save-button/                 ← from features/lecture/components/
    series-context-bar/                  ← from features/lecture/components/
    topic-chips/                         ← from features/lecture/components/
    scholar-card/                        ← from features/scholar/components/
    scholar-content-list/                ← from features/scholar/components/
    scholar-header/                      ← from features/scholar/components/
    scholar-row/                         ← from features/scholar/components/
  index.ts                              ← create
```

- Delete: `features/lecture/`, `features/scholar/`

**New barrel exports:**

```typescript
export { LectureDetailScreen } from "./screens/lecture-detail/lecture-detail.screen";
export { ScholarListScreen } from "./screens/scholar-list/scholar-list.screen";
export { ScholarDetailScreen } from "./screens/scholar-detail/scholar-detail.screen";
export { LecturePlayButton } from "./components/lecture-play-button/LecturePlayButton";
export { LectureSaveButton } from "./components/lecture-save-button/LectureSaveButton";
export { LectureMeta } from "./components/lecture-meta/lecture-meta";
export { TopicChips } from "./components/topic-chips/topic-chips";
export { SeriesContextBar } from "./components/series-context-bar/series-context-bar";
export { ScholarCard } from "./components/scholar-card/scholar-card";
export { ScholarRow } from "./components/scholar-row/scholar-row";
```

**Spec mock path updates (5 files):**

- `listing/screens/lecture-detail/lecture-detail.screen.spec.ts`
- `listing/components/lecture-play-button/LecturePlayButton.spec.ts`
- `listing/components/lecture-save-button/LectureSaveButton.spec.ts`
- `listing/screens/scholar-detail/scholar-detail.screen.spec.ts`
- `listing/components/scholar-row/scholar-row.spec.ts`

**Route file import updates (3 files):**

- `app/(content)/lectures/[id].tsx` — `@/features/listing/screens/...`
- `app/(content)/scholars/index.tsx` — `@/features/listing/screens/...`
- `app/(content)/scholars/[slug].tsx` — `@/features/listing/screens/...`

**Blockers:** None currently identified.

**Dependencies:** Standalone — no file overlap with Stage 1.

**Completion Criteria:**

- `bun run typecheck --filter native` passes
- `bun run test --filter native` passes

**Suggested Commit Message:**

```
refactor(native): merge lecture + scholar into features/listing/ to match web
```

---

### Stage 3: Merge i18n into settings

**Status:** Planned
**Goal:** Merge `features/i18n/` content into `features/settings/` with flat structure. Update all external
import paths (`content-preference.ts` is used by 10 files across 7 features). Add barrel.

**Files:**

i18n's contents move into a flat feature structure at `features/settings/`:

```
features/settings/
  screens/                              (existing)
    account.screen.tsx
    account-profile.screen.tsx
  components/
    language-switch/                    ← from features/i18n/components/
    content-language-toggle/            ← from features/i18n/components/
  content-preference.ts                 ← from features/i18n/ (root)
  index.ts                             (update barrel)
```

- Delete: `features/i18n/`

**Import path updates across codebase (all `@/features/i18n/` → `@/features/settings/`):**

- `content-preference.ts` — 10 files across: search, feed, lecture, scholar, library, settings
- `LanguageSwitch` — used in settings screens
- `ContentLanguageToggle` — used in settings screens

**Settings barrel updates:**

```typescript
export { AccountScreen } from "./screens/account.screen";
export { AccountProfileScreen } from "./screens/account-profile.screen";
export { LanguageSwitch } from "./components/language-switch/language-switch";
export { ContentLanguageToggle } from "./components/content-language-toggle/content-language-toggle";
```

**Blockers:** Need exact grep of all import sites for `@/features/i18n/` to update them all in one pass.

**Dependencies:** Standalone.

**Completion Criteria:**

- `bun run typecheck --filter native` passes
- `bun run test --filter native` passes (check i18n spec mock paths)

**Suggested Commit Message:**

```
refactor(native): merge i18n feature into settings/ flat
```

---

### Stage 4: Merge progress into library

**Status:** Planned
**Goal:** Merge `features/progress/` content into `features/library/` with flat structure. Zero external
imports — only the barrel needs updating. Components are Phase 05 stubs.

**Files:**

progress's contents move into a flat feature structure at `features/library/`:

```
features/library/
  screens/                              (existing)
    library.screen.tsx
    library-saved.screen.tsx
    library-completed.screen.tsx
  components/
    library-item-row/                   (existing)
    progress-indicator/                 ← from features/progress/components/
    resume-badge/                       ← from features/progress/components/
  index.ts                             (update barrel)
```

- Delete: `features/progress/`

**Library barrel updates:**

```typescript
export { LibraryScreen } from "./screens/library.screen";
export { LibrarySavedScreen } from "./screens/library-saved.screen";
export { LibraryCompletedScreen } from "./screens/library-completed.screen";
export { LibraryItemRow } from "./components/library-item-row/library-item-row";
export { ProgressIndicator } from "./components/progress-indicator/progress-indicator";
export { ResumeBadge } from "./components/resume-badge/resume-badge";
```

**Blockers:** None — 0 external imports confirmed.

**Dependencies:** Standalone.

**Completion Criteria:**

- `bun run typecheck --filter native` passes

**Suggested Commit Message:**

```
refactor(native): merge progress feature into library/ flat
```

---

### Stage 5: Merge support + legal into settings

**Status:** Planned
**Goal:** Move `features/support/` and `features/legal/` into `features/settings/`.
Convert SupportScreen hardcoded styles to Unistyles. Create legal toggle screen
(Terms + Privacy via segment control). Wire SupportScreen to new route
`app/(tabs)/settings/support.tsx`. Rewrite old `app/(tabs)/settings/legal.tsx`
to use the new LegalToggleScreen.

**Files:**

Both source features' contents move into the flat structure at `features/settings/`:

```
features/settings/
  screens/
    account.screen.tsx                   (existing)
    account-profile.screen.tsx           (existing)
    support.screen.tsx                   ← from features/support/screens/
    legal-toggle.screen.tsx              ← new, replaces old legal/screens/
  components/                            (created if needed for shared support/legal UI)
  index.ts                              (update barrel)
```

- Delete: `features/support/`, `features/legal/`
- Create: `apps/native/src/app/(tabs)/settings/support.tsx`
- Modify: `apps/native/src/app/(tabs)/settings/legal.tsx` (rewrite to use LegalToggleScreen)
- Modify: `features/settings/screens/account.screen.tsx` (add navigation to support route)

**New LegalToggleScreen:**

```tsx
// features/settings/screens/legal-toggle.screen.tsx
// Single screen with a segment control (e.g., SegmentedControl from react-native)
// Two segments: "Terms of Use" | "Privacy Policy"
// Content rendered from existing TermsOfUseScreen and PrivacyScreen source
```

**SupportScreen Unistyles conversion:**

```typescript
// Before: hardcoded #e5e7eb, #555
// After: theme.colors.surface.subtle, theme.colors.content.muted
```

**Settings barrel updates:**

```typescript
export { AccountScreen } from "./screens/account.screen";
export { AccountProfileScreen } from "./screens/account-profile.screen";
export { LegalToggleScreen } from "./screens/legal-toggle.screen";
export { SupportScreen } from "./screens/support.screen";
```

**Blockers:**

- Need to determine exact content of `features/legal/screens/privacy.screen.tsx` to merge into toggle view
- `features/legal/screens/terms-of-use.screen.tsx` content needs to be embeddable in toggle

**Dependencies:** Standalone.

**Completion Criteria:**

- `bun run typecheck --filter native` passes
- Legal toggle renders both Terms and Privacy
- Support route navigable from AccountScreen
- No `#e5e7eb` or `#555` hardcoded in support files

**Suggested Commit Message:**

```
refactor(native): merge support + legal into settings with Unistyles conversion
```

---

### Stage 6: Feed → Explore cross-cutting rename

**Status:** Planned
**Goal:** Rename `"feed"` section to `"explore"` across ALL layers — shared packages,
API backend module, web feature folders, native feature folders, route directories,
i18n keys, types, and exports. Breaking change with no migration needed.

**Files affected (~50+ locations):**

**A — Shared packages:**

| Package              | File                               | Change                                                                                                                                  |
| -------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `@sd/core-contracts` | `src/routes.ts`                    | `feed: { ... }` → `explore: { ... }`, path strings `/feed/*` → `/explore/*`                                                             |
| `@sd/core-contracts` | `src/endpoints.ts`                 | `feed: { ... }` → `explore: { ... }`, `/feed/*` → `/explore/*`                                                                          |
| `@sd/core-contracts` | `src/navigation.ts`                | `Section = "feed"` → `"explore"`, `SECTION_TABS.feed` → `explore`, `SECTION_LABELS.feed` → `explore`, `SECTION_ROUTES.feed` → `explore` |
| `@sd/core-contracts` | `src/query/index.ts`               | `queryKeys.feed` → `explore` (4 keys)                                                                                                   |
| `@sd/core-contracts` | `src/routes.ts` (routeDefinitions) | `routes.feed.following` → `routes.explore.following` etc.                                                                               |
| `@sd/core-i18n`      | `src/translation-helpers.ts`       | `SUBNAV_KEYS.feed` → `explore`, `getEmptyStateText("feed")` → `"explore"`                                                               |
| `@sd/core-i18n`      | `locales/en.json`                  | `tabs.feed`, `navigation.subnav.feed.*`, top-level `feed.*` → rename                                                                    |
| `@sd/core-i18n`      | `locales/ar.json`                  | Same key renames                                                                                                                        |
| `@sd/domain-content` | `src/feed.api.ts`                  | Rename file → `explore.api.ts`, update exports                                                                                          |
| `@sd/domain-content` | `src/use-feed.ts`                  | Rename → `use-explore.ts`, update hooks                                                                                                 |
| `@sd/domain-content` | `src/use-feed-recent.ts`           | Rename → `use-explore-recent.ts`                                                                                                        |
| `@sd/domain-content` | `src/use-feed-following.ts`        | Rename → `use-explore-following.ts`                                                                                                     |
| `@sd/domain-content` | `src/index.ts`                     | Update all export names                                                                                                                 |

**B — API module:**

| File                                   | Change                                                                                                       |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `apps/api/src/modules/feed/` (6 files) | Rename directory to `explore/`, update class names, controller routes to `/explore/*`, update module imports |

**C — Native app:**

| File                                                                 | Change                                                                            |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `apps/native/src/features/feed/` (12 files, 1 dir)                   | Rename to `features/explore/`, update component names, barrel                     |
| `apps/native/src/app/(tabs)/feed/` (4 files)                         | Rename route dir to `(tabs)/explore/`, rename route component functions           |
| `apps/native/src/features/navigation/utils/tab-route-config.ts`      | `"feed"` → `"explore"` (routeName, id, GROUP_NAME_TO_TAB, getRootTabFromPathname) |
| `apps/native/src/features/navigation/utils/tab-route-config.spec.ts` | 6 test assertion updates                                                          |
| `apps/native/src/features/navigation/utils/section-tab-icons.ts`     | `"feed-*"` → `"explore-*"`, rename SectionTabIconKey type values                  |

**D — Web app:**

| File                                                                          | Change                                                              |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `apps/web/src/features/feed/` (17 files, 1 dir)                               | Rename to `features/explore/`                                       |
| `apps/web/src/app/(main)/(feed)/feed/` (route dir)                            | Rename to `(explore)/explore/`                                      |
| `apps/web/src/features/navigation/utils/section-tab-icons.ts`                 | `"feed-*"` → `"explore-*"`                                          |
| `apps/web/src/features/navigation/utils/get-current-section.ts`               | `[routes.feed.index]: "feed"` → `[routes.explore.index]: "explore"` |
| `apps/web/src/features/navigation/utils/get-current-section.spec.ts`          | Update test assertions                                              |
| `apps/web/src/features/navigation/utils/build-section-tab-path.spec.ts`       | Update test assertions                                              |
| `apps/web/src/features/navigation/components/sidebar/adaptive-bottom-bar.tsx` | `feed: Cloud` → `explore: Cloud`, `SECTION_ORDER`                   |
| `apps/web/src/features/navigation/components/sidebar/sidebar.desktop.tsx`     | `routes.feed.index` → `routes.explore.index`                        |

**Verification methodology:**

- Step 1: Shared packages — update contracts routes/endpoints/navigation/query → typecheck
- Step 2: i18n — update keys → typecheck
- Step 3: domain-content — rename hooks → typecheck all packages
- Step 4: API — rename module, update controller + routes
- Step 5: Native + Web features + routes + navigation utils in parallel

**Blockers:** Large cross-repo change; must be committed as a single atomic commit
to avoid broken intermediate states across shared packages. Best done as one commit
(final stage) or as sub-stages with coordinated version bumps.

**Dependencies:** All Stages 0-5 complete (pure native refactoring). This is the final stage.

**Completion Criteria:**

- `bun run typecheck` passes across entire monorepo
- `bun run build` succeeds for all affected packages and apps
- `bun run test` passes with no regressions
- API routes respond at `/explore/*` instead of `/feed/*`
- Native app navigation works with "Explore" tab
- Web app navigation works with "Explore" nav item

**Suggested Commit Message:**

```
refactor: rename Feed → Explore across all layers (contracts, API, web, native)
```

---

### Final Verification

- `bun run typecheck` passes across entire monorepo
- `bun run test` passes with no regressions
- `bun run build` succeeds for all affected packages and apps
- No `features/feed/`, `features/admin-\*/`, `features/lecture/`, `features/scholar/`,
  `features/i18n/`, `features/progress/`, `features/support/`, `features/legal/`
  directories remain in `apps/native/src/`
- No `\*feed\*` references in tab-route-config or section-tab-icons (native + web)
- API `/feed/\*` routes return 404, `/explore/\*` routes return 200
- Legal toggle screen shows both Terms and Privacy
- Support screen uses Unistyles theme tokens (no hardcoded colors)

### Plan Completion

- All 7 stages completed and committed
- Final verification checks pass
- Plan moved to `.agents/plans/completed/2026-07-06-002-refactor-native-features-plan.md`
