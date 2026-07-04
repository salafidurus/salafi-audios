# Metadata

- **Date:** 2026-06-25
- **Status:** Planned
- **Scope:** `apps/native` — all screens, shared components, navigation, routing; `packages/core-contracts` —
  route constants and `ListingViewDto`; `apps/api` — new listing detail and scholar topics endpoints
- **Summary:** Comprehensive UI redesign of the Salafi Durus native mobile app. The app serves Muslim
  learners seeking authentic Islamic knowledge; the target mood is scholarly, calm, and trustworthy —
  matching the premium web experience. The redesign does not change the core color palette. It
  addresses layout, typography, spacing, card/row consistency, navigation structure, settings
  restructuring, and clean route mapping across all mobile screens.
- **Dependencies:**
  - `docs/nomenclature.md` content nomenclature rules.
  - Shared design tokens in `packages/design-tokens` and shared domain packages
    (`@sd/domain-content`, `@sd/core-contracts`).
  - Backend endpoints in `apps/api` (new: `GET /listing/:id`, `GET /scholars/:slug/topics`).

---

# Worktree Requirement

> **All implementation work for this plan must be done in a git worktree.**
>
> ```bash
> git worktree add .worktrees/feat/native-ui-redesign -b feat/native-ui-redesign
> ```
>
> Work exclusively in `.worktrees/feat/native-ui-redesign`. Commit each stage independently.
> When all stages are complete and the final verification passes, open a PR from
> `feat/native-ui-redesign` into the main branch and remove the worktree after merge.

---

# Design Brief — For Mobile Agents

- **Look & Feel:** Scholarly, premium, digital Islamic library.
- **Styling Tech:** Use `react-native-unistyles` with `theme.colors.*`, `theme.spacing.*`,
  `theme.radius.*`, `theme.typography.*` paths — never CSS variable syntax (`var(--...)`).
- **Nomenclature:** Implement the listing system per `docs/nomenclature.md`. Remove `/lectures`,
  `/series`, `/collections` route layouts. Introduce unified `/listing/[id].tsx`.
- **TDD Requirement:** Write test files (`*.spec.tsx` / `*.spec.ts`) before implementation.
- **Execution:** Sequential (one stage at a time).

---

# Progress

- **Done:** Mobile directory structure catalogued. Codebase exploration complete — tab icon already
  `Settings` gear, admin subtree found, `scholar-content-list.tsx` is sole legacy route linker,
  `ListingViewDto` absent from `@sd/core-contracts`.
- **Blocked / Uncertain:** None.
- **Next step:** Create worktree, then Stage 1.

---

# Staging Strategy

1. Global shell — Account→Settings rename + route constants update
2. Global design polish — tokens + MiniPlayer
3. Feed screen — podcast-style rows
4. Scholar List — vertical catalog rows
5. Scholar Detail — topic-based grouping + backend topics endpoint
6. Live screen — tabbed sub-views
7. Library screen — sub-tab layout
8. Sign in — premium auth card
9. Settings — grouped sub-sections
10. Admin audit + cleanup
11. Backend listing endpoint + ListingViewDto + unified mobile route + nomenclature docs

---

## Stage 1: Global shell — Rename Account to Settings

- **Status:** Planned

### Why

"Account" must become "Settings". The `CustomTabBar` already uses the `Settings` icon — only the
label, route name, and route constants need changing. `@sd/core-contracts` exports route constants
that reference `account` — they must be updated too.

### Files

- `apps/native/src/app/(tabs)/_layout.tsx`
- `apps/native/src/features/navigation/utils/tab-route-config.ts`
- `apps/native/src/app/(tabs)/account/` — rename to `(tabs)/settings/`
- `apps/native/src/features/account/` — rename to `features/settings/`
- `packages/core-contracts/src/query/routes.ts` or wherever `routes.account.*` constants are defined
- All files importing from `@/features/account/` or `@/app/(tabs)/account/`

### Changes

1. Delete `(tabs)/account/(admin)/` (all files).
2. Rename `(tabs)/account/` → `(tabs)/settings/`.
3. Update `_layout.tsx`: `name="account"` → `name="settings"`, label → `"Settings"`.
4. Update `tab-route-config.ts`: `routeName: "account"` → `routeName: "settings"`,
   `label: "Settings"`.
5. Update `@sd/core-contracts` route constants: `routes.account.*` → `routes.settings.*`.
6. Rename `features/account/` → `features/settings/`.
7. Update all import paths.

### Test Files

- `apps/native/src/app/(tabs)/_layout.spec.tsx`
- `apps/native/src/features/navigation/utils/tab-route-config.spec.ts`
- `packages/core-contracts/src/query/__tests__/routes.spec.ts`

### Completion Criteria

- `pnpm --filter native typecheck && pnpm --filter native test` passes.
- `pnpm --filter @sd/core-contracts typecheck && test` passes.
- Bottom tab bar displays "Settings". Admin routes absent. Route constants resolve correctly.

### Suggested Commit Message

```
feat(native): rename Account tab to Settings, update route constants

- Rename (tabs)/account/ → (tabs)/settings/ in route tree
- Delete all admin route files
- Rename features/account/ → features/settings/
- Update @sd/core-contracts route constants (account → settings)
- Update all import references in apps/native/src
```

---

## Stage 2: Global design polish — Unistyles tokens, typography, card layouts, and MiniPlayer

- **Status:** Planned

### Why

Mobile typography needs to feel premium. Card layouts and the MiniPlayer use hardcoded values that
must be migrated to design tokens for consistency and dark/light theme compliance.

### Goal

Integrate design tokens for card padding, borders, shadows, and row highlights. Remediate hardcoded
colors. Merge MiniPlayer token migration into this stage (absorbing the former Stage 12).

### Files

- `apps/native/src/shared/components/ScreenView/ScreenView.tsx`
- `apps/native/src/shared/components/Button/`
- `apps/native/src/features/audio/components/mini-player.tsx`
- Unistyles config files (theme definition, breakpoints)

### Changes

1. Map `ScreenView` background colors to `theme.colors.surface.*` tokens.
2. Map `Button` component colors to `theme.colors.action.*` and `theme.colors.content.*`.
3. Map MiniPlayer colors from hardcoded hex values to `theme.colors.surface.*`, `theme.colors.content.*`.
4. Define unified row container style helper in `apps/native/src/shared/styles/` for reuse across
   Feed, Scholar List, Library, and Listing screens.
5. Verify Unistyles theme resolves all new token references correctly.

### Test Files

- `apps/native/src/shared/components/ScreenView/ScreenView.spec.tsx`
- `apps/native/src/shared/components/Button/Button.spec.tsx`
- `apps/native/src/features/audio/components/mini-player.spec.tsx`

### Completion Criteria

- `pnpm --filter native typecheck` passes.
- `pnpm --filter native test` passes.
- All audited screens show consistent spacing, border radius, and color token usage.
- MiniPlayer renders correctly in both dark and light modes.

### Suggested Commit Message

```
feat(native): migrate ScreenView, Button, MiniPlayer to design tokens

- Map ScreenView background to theme.colors.surface tokens
- Map Button colors to theme.colors.action and content tokens
- Map MiniPlayer from hardcoded hex to theme token references
- Add shared row style helper in shared/styles/
- All hardcoded colors remediated in target components
```

---

## Stage 3: Feed screen — Podcast-style list layout

- **Status:** Planned

### Why

The current feed renders various card variants that compete for visual attention. A vertical list of
podcast-style rows improves scannability.

### Goal

Replace card grid layouts in the feed with clean, full-width row items showing scholar avatar,
lecture title, duration, date, and progress indicator. Use the shared row style helper from Stage 2.

### Files

- `apps/native/src/features/feed/screens/feed-recent.screen.tsx`
- `apps/native/src/features/feed/components/feed-content-card/feed-content-card.tsx`

### Changes

1. Rebuild `FeedRecentScreen` to render a single vertical `FlatList` with full-width podcast rows.
2. Integrate progress bar indicator for in-progress feed items.
3. Replace `FeedContentCard` with the new row component, or delete it if no other consumers exist.

### Test Files

- `apps/native/src/features/feed/screens/feed-recent.screen.spec.tsx`

### Completion Criteria

- `pnpm --filter native test` passes.
- Feed scrolls smoothly and items render with consistent padding from shared row styles.

### Suggested Commit Message

```
feat(native): redesign feed as podcast-style full-width rows

- Replace card grid in FeedRecentScreen with FlatList of rows
- Add progress bar indicator for in-progress items
- Use shared row style helper from Stage 2
```

---

## Stage 4: Scholar List screen — Vertical catalog rows

- **Status:** Planned

### Why

The portrait grid displays minimal information per scholar. A vertical catalog row layout allows
showing bio snippets and lecture counts directly in the list.

### Goal

Update the scholar list to show large circle photos, scholar names (serif typography), bio
snippets, and lecture counts.

### Files

- `apps/native/src/features/scholar/screens/scholar-list/scholar-list.screen.tsx`
- `apps/native/src/features/scholar/components/scholar-card/scholar-card.tsx`

### Changes

1. Replace the 2-column `FlatList` grid with a single-column vertical list.
2. Render photo circle, scholar name, bio snippet (clamped to 2 lines), and lecture count.
3. Apply the shared row style helper.

### Test Files

- `apps/native/src/features/scholar/screens/scholar-list/scholar-list.screen.spec.tsx`
- `apps/native/src/features/scholar/components/scholar-card/scholar-card.spec.tsx`

### Completion Criteria

- `pnpm --filter native test` passes.
- Scholar list renders as a vertical list with centered, max-width-aligned content.

### Suggested Commit Message

```
feat(native): redesign scholar list as vertical catalog rows

- Replace 2-column grid with single-column FlatList
- Display circle photo, name, bio snippet, lecture count
- Apply shared row style helper
```

---

## Stage 5: Scholar Detail screen — Topic-based content grouping

- **Status:** Planned

### Why

The scholar profile header is sparse. Content should be grouped by topic (Tawheed, Fiqh, etc.)
rather than filtered by type (Series/Singles/Collections). This requires a new backend endpoint
that returns only topics for which the scholar has published listings.

### Goal

Expand `ScholarHeader` with collapsible bio. Replace type-filter tabs with topic-based grouping
powered by a new `GET /scholars/:slug/topics` endpoint. Render topic sections with their listings.

### Files

- **New (backend):** `apps/api/src/modules/scholars/` — add topic-grouped content endpoint
- **New (domain):** `packages/domain-content/src/hooks/useScholarTopics.ts`
- **Existing (mobile):** `apps/native/src/features/scholar/screens/scholar-detail/scholar-detail.screen.tsx`
- **Existing (mobile):** `apps/native/src/features/scholar/components/scholar-header/scholar-header.tsx`

### Changes

1. **Backend:** Add `GET /scholars/:slug/topics` that returns
   `{ topics: { topicId, topicName, items: ScholarContentItemDto[] }[] }`.
2. **Contracts:** Add `ScholarTopicsDto` to `@sd/core-contracts/src/types/scholar.types.ts`.
3. **Domain:** Add `useScholarTopics(slug)` hook.
4. **Mobile:** Replace `ScholarContentList` with topic-sectioned display. Add expandable bio to
   `ScholarHeader`.

### Test Files

- `apps/api/src/modules/scholars/scholars.controller.spec.ts`
- `packages/core-contracts/src/types/scholar.types.spec.ts`
- `apps/native/src/features/scholar/screens/scholar-detail/scholar-detail.screen.spec.tsx`
- `apps/native/src/features/scholar/components/scholar-header/scholar-header.spec.tsx`

### Completion Criteria

- `pnpm --filter api test` passes.
- `pnpm --filter @sd/core-contracts typecheck && test` passes.
- `pnpm --filter native typecheck && test` passes.
- Scholar detail shows topic-grouped content sections. Bio expands/collapses smoothly.

### Suggested Commit Message

```
feat(api): add GET /scholars/:slug/topics endpoint

feat(native): group scholar content by topic, add expandable bio

- Add backend endpoint returning topics with their listings
- Add ScholarTopicsDto and useScholarTopics hook
- Replace type-filter tabs with topic sections on scholar detail
- Add collapsible bio to ScholarHeader
```

---

## Stage 6: Live screen — Tabbed categories

- **Status:** Planned

### Why

Showing Live, Scheduled, and Ended sessions in a single scroll causes visual clutter. Sub-tabs
divide concerns logically.

### Goal

Add segmented control (Now | Scheduled | Ended) to the live screen, displaying list variants
based on the active category.

### Files

- `apps/native/src/features/live/screens/live.screen.tsx`

### Changes

1. Implement top tab switcher or segmented control component.
2. Render three list variants conditionally based on the active tab.

### Test Files

- `apps/native/src/features/live/screens/live.screen.spec.tsx`

### Completion Criteria

- `pnpm --filter native test` passes.
- Live screen switches tabs smoothly. Empty states render correctly.

### Suggested Commit Message

```
feat(native): add Now/Scheduled/Ended tabs to live screen

- Implement segmented control for live session categories
- Render list variants conditionally per active tab
```

---

## Stage 7: Library screen — Sub-tab layout

- **Status:** Planned

### Why

Users need to quickly filter saved, in-progress, and completed listings.

### Goal

Add top tab switcher (Saved | In Progress | Completed) to the library, with clean row items
featuring progress bars.

### Files

- `apps/native/src/features/library/screens/library.screen.tsx`

### Changes

1. Refactor `SectionList` into tab-filtered `FlatList` elements.
2. Display thin progress bars (4px, rounded) under in-progress items.

### Test Files

- `apps/native/src/features/library/screens/library.screen.spec.tsx`

### Completion Criteria

- `pnpm --filter native test` passes.
- Library tabs filter correctly. Progress bars reflect database state.

### Suggested Commit Message

```
feat(native): add Saved/In Progress/Completed tabs to library

- Replace SectionList with tab-filtered FlatLists
- Add thin progress bar to in-progress items
```

---

## Stage 8: Sign In screen — Premium Auth card

- **Status:** Planned

### Why

The login page should present a high-quality interface matching a scholarly digital catalog.

### Goal

Design a clean floating authentication panel with Google and Apple premium SSO buttons.

### Files

- `apps/native/src/features/auth/screens/sign-in/sign-in.screen.tsx`

### Changes

1. Polish spacing, logo placement, and typography using design tokens.
2. Style SSO buttons to match dark/light token presets.

### Test Files

- `apps/native/src/features/auth/screens/sign-in/sign-in.screen.spec.tsx`

### Completion Criteria

- `pnpm --filter native test` passes.
- Sign-in screen renders cleanly. Button interaction states work correctly.

### Suggested Commit Message

```
feat(native): polish sign-in screen with premium SSO buttons

- Apply design tokens to logo, spacing, and typography
- Style Google and Apple buttons for dark/light mode
```

---

## Stage 9: Settings screen — Sub-sections configuration

- **Status:** Planned

### Why

The Account screen was a flat list mixing unrelated options. Grouped sub-sections provide better
hierarchy. The Unistyles theme context already exists — no infrastructure to build.

### Goal

Re-style Settings as a multi-menu panel with three sub-sections:

- General: Language preference, theme mode (System/Light/Dark), notification toggles.
- Profile: Name, email, display name editing, role display.
- Legal: Privacy Policy, Terms links.

### Files

- `apps/native/src/features/settings/screens/settings.screen.tsx` (renamed from account)
- `apps/native/src/features/settings/screens/settings-profile.screen.tsx` (renamed from account-profile)

### Changes

1. Add segmented layout blocks or sub-route screens for each category.
2. Implement local state for notification toggles.
3. Wire theme mode selector to the existing Unistyles theme context.

### Test Files

- `apps/native/src/features/settings/screens/settings.screen.spec.tsx`
- `apps/native/src/features/settings/screens/settings-profile.screen.spec.tsx`

### Completion Criteria

- `pnpm --filter native test` passes.
- Theme mode toggle applies correctly in light/dark/system modes.
- Notification toggles persist correctly.

### Suggested Commit Message

```
feat(native): restructure settings with General/Profile/Legal sections

- Add segmented sections for language, theme, notifications
- Wire theme mode to existing Unistyles context
- Wire notification toggles to local state
```

---

## Stage 10: Admin route cleanup — Audit then delete

- **Status:** Planned

### Why

Admin is web-only. The admin subtree and feature folders must be removed. First audit for
cross-references to avoid build breaks.

### Files

- **Grep targets:** `apps/native/src/` for any imports/usage of admin features
- **Delete:** `apps/native/src/app/(tabs)/account/(admin)/` (all files)
- **Delete:** `apps/native/src/features/admin/`, `admin-lectures/`, `admin-live/`, `admin-scholars/`
- **Update:** `apps/native/src/features/settings/screens/settings.screen.tsx`

### Changes

1. Grep `apps/native/src/` for `features/admin`, `admin-lectures`, `admin-live`, `admin-scholars`,
   to confirm no cross-feature imports exist.
2. Delete admin route directory and all admin feature folders.
3. Remove `onNavigateToAdmin` and `useAdminPermissions` admin-button branch from Settings screen.

### Test Files

- `apps/native/src/features/settings/screens/settings.screen.spec.tsx`

### Completion Criteria

- `pnpm --filter native typecheck && test` passes.
- No `(admin)` directory exists. Settings has no admin button.

### Suggested Commit Message

```
feat(native): audit and remove admin routes from mobile app

- Audit cross-references before deletion
- Delete (tabs)/account/(admin)/ route tree
- Delete admin feature folders
- Remove admin navigation from Settings screen
```

---

## Stage 11: Unified Listing Detail page — /listing/[id], ListingViewDto, and backend endpoint

- **Status:** Planned

### Why

Legacy `/lectures/[id]`, `/series/[id]`, `/collections/[id]` must become a single `/listing/[id]`.
A `ListingViewDto` must be created in `@sd/core-contracts` and served by a new backend endpoint.

### Files

- **Add (contracts):** `packages/core-contracts/src/types/listing.types.ts` — add `ListingViewDto`
  discriminated union with `format: ListingFormat`
- **Add (backend):** `apps/api/src/modules/listings/` — `GET /listing/:id` returning `ListingViewDto`
- **Add (domain):** `packages/domain-content/src/hooks/useListingDetail.ts`
- **Delete (routes):** `apps/native/src/app/(content)/lectures/[id].tsx`,
  `series/[id].tsx`, `collections/[id].tsx`
- **Add (route):** `apps/native/src/app/(content)/listing/[id].tsx`
- **Add (screen):** `apps/native/src/features/listing/screens/listing-detail.screen.tsx`
- **Update:** `apps/native/src/features/scholar/components/scholar-content-list/scholar-content-list.tsx`
- **Update:** `docs/nomenclature.md`

### Changes

1. **Add `ListingViewDto`:** Discriminated union:
   ```typescript
   export type ListingViewDto = {
     format: ListingFormat;
   } & (LectureViewDto | SeriesViewDto | CollectionViewDto);
   ```
2. **Backend:** Add `GET /listing/:id` controller that fetches by legacy ID, checks if the entity
   is a top-level Listing (not nested), and returns the unified DTO.
3. **Contracts build:** `pnpm --filter @sd/core-contracts build`.
4. **Domain hook:** `useListingDetail(id)`.
5. **Route deletion:** Remove the three legacy route files.
6. **New route + screen:** `/listing/[id].tsx` → `ListingDetailScreen` rendering by format.
7. **Update scholar-content-list.tsx:** All items use `/(content)/listing/${item.id}`.
8. **Update nomenclature.md:** Replace `/lectures/:id` with `/listing/:id`, add removal note.

### Blockers

None. Old routes are deleted without redirects — no mobile consumers outside
`scholar-content-list.tsx`. `LectureDetailScreen` becomes the Single variant of the new
`ListingDetailScreen`.

### Dependencies

Stages 2 (shared row styles for listing card layouts).

### Test Files

- `packages/core-contracts/src/types/listing.types.spec.ts`
- `apps/api/src/modules/listings/listings.controller.spec.ts`
- `apps/native/src/features/listing/screens/listing-detail.screen.spec.tsx`
- `apps/native/src/features/scholar/components/scholar-content-list/scholar-content-list.spec.tsx`

### Completion Criteria

- `pnpm --filter api typecheck && test` passes.
- `pnpm --filter @sd/core-contracts typecheck && test` passes.
- `pnpm --filter native typecheck && test` passes.
- Legacy routes `/lectures/[id]`, `/series/[id]`, `/collections/[id]` do not exist.
- Navigating to `/listing/[id]` renders correct layout based on `ListingFormat`.
- `scholar-content-list.tsx` routes point to `/listing/[id]` exclusively.
- Nomenclature doc updated.

### Suggested Commit Message

```
feat(api): add GET /listing/:id endpoint returning ListingViewDto

feat(native): replace legacy detail routes with unified /listing/[id]

- Add ListingViewDto to @sd/core-contracts
- Remove /lectures/[id], /series/[id], /collections/[id] routes
- Add /listing/[id] route and ListingDetailScreen
- Absorb LectureDetailScreen as Single variant
- Update scholar-content-list.tsx to use /listing/[id]
- Update docs/nomenclature.md route references
```

---

# Final Verification

- `pnpm --filter api typecheck && test` passes.
- `pnpm --filter native typecheck && test` passes.
- `pnpm --filter @sd/core-contracts typecheck && test` passes.
- Verification checks:
  - Feed list, Library lists, Scholar list scroll smoothly.
  - Legacy routes `/lectures`, `/series`, `/collections` do not exist in router configuration.
  - Unified `/listing/[id]` loads and displays Single, Series, and Collection layouts properly.
  - Scholar content grouped by topic. Bio expand/collapse works.
  - Theme mode toggle applies correctly across all screens.
  - Admin routes and feature code are absent from the mobile app.
  - MiniPlayer renders correctly in both dark and light modes.

---

# Plan Completion

The plan is `Completed` when:

1. All stages are committed and merged from the `feat/native-ui-redesign` worktree branch.
2. All automated types and tests verify cleanly.
3. The worktree branch is removed after merge (`git worktree remove .worktrees/feat/native-ui-redesign`).

Move this file to `.agents/plans/completed/` and update `Status` to `Completed`.
