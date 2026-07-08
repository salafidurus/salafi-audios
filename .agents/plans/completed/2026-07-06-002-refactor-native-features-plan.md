# Native Features Refactoring + Feed → Explore Rename Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Consolidate native feature slices, eliminate dead routes, rename Feed→Explore
across all layers, and merge orphan features (support, legal, progress, admin\*)
into their logical homes. Note: i18n merge already complete.

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

## Rollback Procedures

**Before starting any stage:**

1. Create backup branch: `git branch backup/refactor-native-features-$(date +%Y%m%d)`
2. Document current git SHA: `git rev-parse HEAD > .agents/plans/refactor-checkpoint.txt`
3. Verify clean working tree: `git status --porcelain` should return empty

**If a stage fails:**

1. Assess whether to fix forward or roll back
2. To roll back: `git reset --hard <stage-start-sha>` and `git clean -fd`
3. Document failure reason in plan file before retrying

**Emergency rollback:**

```bash
git reset --hard $(cat .agents/plans/refactor-checkpoint.txt)
git clean -fd
```

---

## Pre-Stage: Cleanup redundant settings/i18n barrel

**Status:** Needed
**Goal:** Remove unnecessary `features/settings/i18n/` directory — it's a redundant barrel since main `settings/index.ts` already exports the same components.

**Changes:**

1. Update `features/settings/screens/account.screen.tsx`:
   - Change: `import { LanguageSwitch, ContentLanguageToggle } from "@/features/settings/i18n";`
   - To: `import { LanguageSwitch, ContentLanguageToggle } from "@/features/settings";`
2. Delete: `features/settings/i18n/` directory

**Completion Criteria:**

- `bun run typecheck --filter native` passes
- No imports from `@/features/settings/i18n` remain

**Commit Message:**

```
refactor(native): remove redundant settings/i18n barrel
```

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

**Execution Steps:**

1. Create target directory structure:

   ```bash
   mkdir -p features/admin/{api,hooks,screens,components}
   ```

2. Move files using git mv (preserves history):

   ```bash
   # API files
   git mv features/admin/api/admin-permissions.api.ts features/admin/api/
   git mv features/admin-lectures/api/admin-lectures.api.ts features/admin/api/
   git mv features/admin-live/api/admin-live.api.ts features/admin/api/
   git mv features/admin-scholars/api/admin-scholars.api.ts features/admin/api/

   # Hooks
   git mv features/admin/hooks/use-admin-permissions.ts features/admin/hooks/
   git mv features/admin-lectures/hooks/use-admin-lectures.ts features/admin/hooks/
   git mv features/admin-live/hooks/use-admin-live.ts features/admin/hooks/
   git mv features/admin-scholars/hooks/use-admin-scholars.ts features/admin/hooks/

   # Screens (entire directories)
   git mv features/admin/screens/admin-dashboard features/admin/screens/
   git mv features/admin-lectures/screens/admin-lectures features/admin/screens/
   git mv features/admin-live/screens/admin-live features/admin/screens/
   git mv features/admin-scholars/screens/admin-scholars features/admin/screens/
   git mv features/admin-scholars/screens/admin-scholar-detail features/admin/screens/

   # Components (entire directories)
   git mv features/admin-lectures/components/AudioUploaderSheet features/admin/components/
   git mv features/admin-lectures/components/BulkActionBar features/admin/components/
   git mv features/admin-lectures/components/LectureEditSheet features/admin/components/
   git mv features/admin-live/components/ChannelSheet features/admin/components/
   git mv features/admin-live/components/SessionSheet features/admin/components/
   git mv features/admin-scholars/components/CollectionSheet features/admin/components/
   git mv features/admin-scholars/components/SeriesSheet features/admin/components/
   ```

3. Create barrel at `features/admin/index.ts` with exports listed above

4. Update internal imports within admin feature to use relative paths

5. Update route imports:
   - Find all files importing from `@/features/admin-lectures`, `@/features/admin-live`, `@/features/admin-scholars`
   - Change to `@/features/admin`

6. Update spec mock paths (jest.mock calls) in 6 test files

7. Delete empty feature directories:
   ```bash
   rm -rf features/admin-lectures features/admin-live features/admin-scholars
   ```

**Blockers:** None currently identified.

**Dependencies:** Standalone.

**Completion Criteria:**

- `bun run typecheck --filter native` passes
- `bun run test --filter native` passes
- All route imports use `@/features/admin` barrel
- No `admin-lectures`, `admin-live`, `admin-scholars` directories remain

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

**Execution Steps:**

1. Create target directory structure:

   ```bash
   mkdir -p features/listing/{screens,components}
   ```

2. Move screen directories using git mv:

   ```bash
   git mv features/lecture/screens/lecture-detail features/listing/screens/
   git mv features/scholar/screens/scholar-list features/listing/screens/
   git mv features/scholar/screens/scholar-detail features/listing/screens/
   ```

3. Move component directories using git mv:

   ```bash
   # Lecture components
   git mv features/lecture/components/lecture-meta features/listing/components/
   git mv features/lecture/components/lecture-play-button features/listing/components/
   git mv features/lecture/components/lecture-save-button features/listing/components/
   git mv features/lecture/components/series-context-bar features/listing/components/
   git mv features/lecture/components/topic-chips features/listing/components/

   # Scholar components
   git mv features/scholar/components/scholar-card features/listing/components/
   git mv features/scholar/components/scholar-content-list features/listing/components/
   git mv features/scholar/components/scholar-header features/listing/components/
   git mv features/scholar/components/scholar-row features/listing/components/
   ```

4. Create barrel at `features/listing/index.ts` with exports listed above

5. Update 3 route file imports:
   - `app/(content)/lectures/[id].tsx`: change `@/features/lecture` → `@/features/listing`
   - `app/(content)/scholars/index.tsx`: change `@/features/scholar` → `@/features/listing`
   - `app/(content)/scholars/[slug].tsx`: change `@/features/scholar` → `@/features/listing`

6. Update spec mock paths in 5 test files

7. Delete empty feature directories:
   ```bash
   rm -rf features/lecture features/scholar
   ```

**Blockers:** None currently identified.

**Dependencies:** Standalone — no file overlap with Stage 1.

**Completion Criteria:**

- `bun run typecheck --filter native` passes
- `bun run test --filter native` passes
- All route imports use `@/features/listing` barrel
- No `lecture` or `scholar` feature directories remain

**Suggested Commit Message:**

```
refactor(native): merge lecture + scholar into features/listing/ to match web
```

---

### Stage 3: Merge progress into library

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

**Execution Steps:**

1. Move component directories using git mv:

   ```bash
   git mv features/progress/components/progress-indicator features/library/components/
   git mv features/progress/components/resume-badge features/library/components/
   ```

2. Update `features/library/index.ts` barrel to add progress component exports

3. Verify no external imports exist (confirmed: 0 external imports)

4. Delete empty feature directory:
   ```bash
   rm -rf features/progress
   ```

**Blockers:** None — 0 external imports confirmed.

**Dependencies:** Standalone.

**Completion Criteria:**

- `bun run typecheck --filter native` passes
- No `progress` feature directory remains
- Library barrel exports progress components

**Suggested Commit Message:**

```
refactor(native): merge progress feature into library/ flat
```

---

### Stage 4: Merge support + legal into settings

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

**Execution Steps:**

1. Move support screen using git mv:

   ```bash
   git mv features/support/screens/support.screen.tsx features/settings/screens/
   ```

2. Create new `LegalToggleScreen`:
   - Extract section-rendering logic from `PrivacyScreen` and `TermsOfUseScreen`
   - Both screens use identical structure: ScrollView > Title > Sections
   - Create segment control with "Terms" | "Privacy" tabs
   - Render appropriate content based on selected segment
   - Already use Unistyles — no hardcoded colors

3. Convert SupportScreen hardcoded colors to Unistyles theme tokens:
   - `#e5e7eb` → `theme.colors.surface.subtle`
   - `#555` → `theme.colors.content.muted`

4. Create route file `app/(tabs)/settings/support.tsx`:

   ```tsx
   import { SupportScreen } from "@/features/settings";
   export default function SupportRoute() {
     return <SupportScreen />;
   }
   ```

5. Update `app/(tabs)/settings/legal.tsx` to use LegalToggleScreen:

   ```tsx
   import { LegalToggleScreen } from "@/features/settings";
   export default function LegalRoute() {
     return <LegalToggleScreen />;
   }
   ```

6. Update `features/settings/screens/account.screen.tsx`:
   - Add navigation to support route

7. Update `features/settings/index.ts` barrel

8. Delete empty feature directories:
   ```bash
   rm -rf features/support features/legal
   ```

**Blockers:** None — legal screens verified as embeddable (identical structure, already use Unistyles).

**Dependencies:** Standalone.

**Completion Criteria:**

- `bun run typecheck --filter native` passes
- Legal toggle renders both Terms and Privacy
- Support route navigable from AccountScreen
- No `#e5e7eb` or `#555` hardcoded in support files
- No `support` or `legal` feature directories remain

**Suggested Commit Message:**

```
refactor(native): merge support + legal into settings with Unistyles conversion
```

---

### Stage 5: Feed → Explore cross-cutting rename

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

**Execution Approach: Sub-Stages with Version Coordination**

This stage is executed as 5 coordinated sub-stages to allow incremental review and easier rollback:

**Sub-Stage 5.1: Shared packages (contracts, i18n, domain-content)**

1. Update `@sd/core-contracts`:
   - `src/routes.ts`: `feed` → `explore` (all route definitions)
   - `src/endpoints.ts`: `/feed/*` → `/explore/*`
   - `src/navigation.ts`: Section type, SECTION_TABS, SECTION_LABELS, SECTION_ROUTES
   - `src/query/index.ts`: queryKeys.feed → queryKeys.explore
   - Bump patch version
2. Update `@sd/core-i18n`:
   - `locales/en.json`: `tabs.feed` → `tabs.explore`, `navigation.subnav.feed.*` → `explore.*`
   - `locales/ar.json`: matching key renames
   - `src/translation-helpers.ts`: SUBNAV_KEYS, getEmptyStateText
   - Bump patch version
3. Update `@sd/domain-content`:
   - Rename files: `feed.api.ts` → `explore.api.ts`, `use-feed*.ts` → `use-explore*.ts`
   - Update internal references and exports in `index.ts`
   - Bump patch version
4. Verify: `bun run typecheck` and `bun run build` in packages/
5. Commit: `refactor(packages): rename feed → explore in shared contracts`

**Sub-Stage 5.2: API module**

1. Update package.json to use new contract versions
2. Rename `apps/api/src/modules/feed/` → `explore/`
3. Update class names, controller decorators to `/explore/*`
4. Update module imports in app.module.ts
5. Verify: `bun run typecheck --filter api && bun run build --filter api`
6. Commit: `refactor(api): rename feed module to explore`

**Sub-Stage 5.3: Native app**

1. Update package.json to use new package versions
2. Rename `features/feed/` → `features/explore/`
3. Rename `app/(tabs)/feed/` → `app/(tabs)/explore/`
4. Update navigation utils:
   - `tab-route-config.ts`: routeName, id, GROUP_NAME_TO_TAB
   - `section-tab-icons.ts`: icon keys and type
5. Update component/hook names in explore feature
6. Verify: `bun run typecheck --filter native && bun run test --filter native`
7. Commit: `refactor(native): rename feed → explore across features and routes`

**Sub-Stage 5.4: Web app**

1. Update package.json to use new package versions
2. Rename `features/feed/` → `features/explore/`
3. Rename `app/(main)/(feed)/feed/` → `(explore)/explore/`
4. Update navigation utils:
   - `section-tab-icons.ts`, `get-current-section.ts`
   - `adaptive-bottom-bar.tsx`, `sidebar.desktop.tsx`
5. Update test assertions in navigation specs
6. Verify: `bun run typecheck --filter web && bun run test --filter web && bun run build --filter web`
7. Commit: `refactor(web): rename feed → explore across features and routes`

**Sub-Stage 5.5: Final verification and version bump**

1. Run full monorepo verification:
   - `bun run typecheck` (all workspaces)
   - `bun run test` (all workspaces)
   - `bun run build` (all packages and apps)
2. Manual testing:
   - API: `/explore/*` routes return 200, `/feed/*` return 404
   - Native: "Explore" tab navigates correctly
   - Web: "Explore" nav item navigates correctly
3. Document breaking change in CHANGELOG if needed
4. Commit: `chore: final verification for feed → explore rename`

**Blockers:** None — sub-stage approach mitigates risk of broken intermediate states.

**Dependencies:** All Stages 0-4 complete (pure native refactoring). This is the final stage.

**Completion Criteria:**

- All 5 sub-stages committed
- `bun run typecheck` passes across entire monorepo
- `bun run build` succeeds for all affected packages and apps
- `bun run test` passes with no regressions
- API routes respond at `/explore/*` instead of `/feed/*`
- Native app navigation works with "Explore" tab
- Web app navigation works with "Explore" nav item

**Rollback Strategy:**
Each sub-stage is independently reversible via `git revert`. If Sub-Stage 5.3 fails, revert 5.3, 5.2, and 5.1 in reverse order.

---

### Final Verification

After all stages complete, verify:

**Monorepo health:**

- `bun run typecheck` passes across entire monorepo
- `bun run test` passes with no regressions
- `bun run build` succeeds for all affected packages and apps

**Native feature structure:**

- No `features/admin-lectures/`, `features/admin-live/`, `features/admin-scholars/` directories
- No `features/lecture/` or `features/scholar/` directories
- No `features/progress/` directory
- No `features/support/` or `features/legal/` directories
- No `features/settings/i18n/` directory
- All consolidated features have barrel exports at `index.ts`

**Feed → Explore rename:**

- No `features/feed/` directories in native or web
- No `*feed*` references in tab-route-config or section-tab-icons (native + web)
- API `/feed/*` routes return 404, `/explore/*` routes return 200
- Native app "Explore" tab navigates correctly
- Web app "Explore" nav item navigates correctly

**Settings consolidation:**

- Legal toggle screen shows both Terms and Privacy
- Support screen uses Unistyles theme tokens (no hardcoded `#e5e7eb` or `#555`)
- Support route navigable from AccountScreen

### Plan Completion

- Pre-stage + Stages 0-4 completed and committed
- Stage 5 sub-stages 5.1-5.5 completed
- Final verification checks pass
- Plan moved to `.agents/plans/completed/2026-07-06-002-refactor-native-features-plan.md`

### Summary

**Stages executed:**

- Pre-stage: Cleanup redundant settings/i18n barrel
- Stage 0: Delete placeholder routes (series, collections)
- Stage 1: Merge 4 admin features → single admin/
- Stage 2: Merge lecture + scholar → listing/
- Stage 3: Merge progress → library/
- Stage 4: Merge support + legal → settings/
- Stage 5: Feed → Explore rename (5 sub-stages)

**Total commits:** ~8-9 commits (1 pre-stage + 5 native stages + 5 feed→explore sub-stages, some may be combined)
