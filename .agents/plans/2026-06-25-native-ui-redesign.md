# Metadata

- **Date:** 2026-06-25
- **Status:** Planned
- **Scope:** `apps/native` — all screens, shared components, navigation, routing
- **Summary:** Comprehensive UI redesign of the Salafi Durus native mobile app. The app serves Muslim learners seeking authentic Islamic knowledge; the target mood is scholarly, calm, and trustworthy — matching the premium web experience. The redesign does not change the core color palette. It addresses layout, typography, spacing, card/row consistency, navigation structure, settings restructuring, and clean route mapping across all mobile screens.
- **Dependencies:**
  - `docs/nomenclature.md` content nomenclature rules.
  - Shared design tokens in `packages/design-tokens` and shared domain packages (`@sd/domain-content`, `@sd/core-contracts`).

---

# Worktree Requirement

> **All implementation work for this plan must be done in a git worktree.**
>
> Do not implement directly on the main working tree. Create a worktree branch first:
>
> ```bash
> git worktree add .worktrees/feat/native-ui-redesign -b feat/native-ui-redesign
> ```
>
> Work exclusively in `.worktrees/feat/native-ui-redesign`. Commit each stage independently. When all stages are complete and the final verification passes, open a PR from `feat/native-ui-redesign` into the main branch and remove the worktree after merge.

---

# Design Brief — For Mobile Agents

This section records the design intent and constraints for the native mobile app redesign.

- **Look & Feel:** Scholarly, premium, digital Islamic library.
- **Styling Tech:** Use `react-native-unistyles` to resolve styling based on the shared design token system (`packages/design-tokens`).
- **Nomenclature:** Implement the listing system exactly as defined in `docs/nomenclature.md`. Completely remove `/lectures`, `/series`, and `/collections` route layouts. Introduce unified `/listing/[id].tsx` path mapping.
- **TDD Requirement:** Strict TDD. Write test files (`*.spec.tsx` or `*.spec.ts`) before implementing component or route changes.

---

# Progress

- **Done:** Target structure of mobile directories catalogued. Route directories identified in `apps/native/src/app`.
- **Blocked / Uncertain:** None.
- **Next step:** Create worktree, then execute Stage 1 (Global shell / Navigation).

---

# Staging Strategy

1. Global shell — Rename Account tab to Settings, update TabBar icons and active indicator states.
2. Global design polish — Unistyles typography configuration, spacing token adjustments, card/row consistency.
3. Feed screen — Redesign cards to unified podcast-style row components.
4. Scholar List screen — Vertical list layout matching the list directory aesthetic.
5. Scholar Detail screen — Scrollable mobile scholar view, header details, and list filtering.
6. Live screen — Tabbed sub-views (Now | Scheduled | Ended) using Tab navigation.
7. Library screen — Tabbed sub-views (Saved | In Progress | Completed).
8. Sign In screen — Polished login page with Google + Apple premium SSO buttons.
9. Settings screen (renamed from Account) — Grouped sub-menus (General, Profile, Legal).
10. Admin screens — [Cancelled] Removed admin dashboard from mobile app.
11. Unified Listing Detail page — Completely remove old `/lectures/[id]`, `/series/[id]`, `/collections/[id]` routes and create dynamic `/listing/[id]` router page.
12. MiniPlayer & Playback polish — Clean up padding, controls, and dark mode theme.

---

## Stage 1: Global shell — Rename Account to Settings, update navigation bar

- **Status:** Planned

### Why

The main navigation must reflect the renaming of "Account" to "Settings" to maintain consistency with the web app and properly describe the restructured options.

### Goal

Rename the bottom navigation tab "Account" to "Settings", update the active icon, and polish styling transitions on the TabBar.

### Files

- `apps/native/src/app/(tabs)/_layout.tsx`
- `apps/native/src/features/navigation/` (related navigation components)

### Changes

- Rename tab configuration from "Account" to "Settings".

* Update tab icon from generic avatar/user icon to settings gear.
* Update navigation labels and headers.

### Completion Criteria

- App compiles and runs cleanly on Android/iOS.

* Bottom navigation bar correctly displays "Settings" as the final tab.

---

## Stage 2: Global design polish — Unistyles tokens, typography, and card layouts

- **Status:** Planned

### Why

Mobile typography needs to feel premium. Headings should be bold (utilizing the Fraunces display font where supported or configured), line-heights must be expanded for readability, and card layouts must be unified.

### Goal

Integrate design tokens for card padding, borders, shadows, and row highlights. Remediate hardcoded colors.

### Files

- `apps/native/src/shared/components/ScreenView/ScreenView.tsx`
- `apps/native/src/shared/components/Button/`
- Global styles & Unistyles configurations

### Changes

- Map `ScreenView` background colors using design tokens (`var(--surface-canvas)` equivalent).

* Define unified row container styling class/style helper in `shared/styles` for reuse.

### Completion Criteria

- `pnpm --filter native test` passes.

* All audited screens show consistent spacing and border radius metrics.

---

## Stage 3: Feed screen — Podcast-style list layout

- **Status:** Planned

### Why

The current feed is a collection of various card variants that compete for visual attention. Shifting to a vertical list of podcast-style rows improves scannability.

### Goal

Replace card grid layouts in the feed with clean, full-width row items showing scholar avatar, lecture title, duration, date, and progress indicator.

### Files

- `apps/native/src/features/feed/screens/feed-recent.screen.tsx`
- `apps/native/src/features/feed/components/feed-content-card/feed-content-card.tsx`

### Changes

- Modify `FeedRecentScreen` layout to render dynamic full-width list items.

* Implement progress bar indicator for in-progress feed audios.

### Completion Criteria

- Feed scrolls smoothly and items render correctly with consistent padding.

---

## Stage 4: Scholar List screen — Vertical catalog rows

- **Status:** Planned

### Why

The portrait grid representation displays minimal information per scholar. A vertical catalog row layout allows showing bio snippets and lecture counts directly in the list.

### Goal

Update the scholar list to show large circle photos, scholar names (serif typography), bio snippets, and lecture counts.

### Files

- `apps/native/src/features/scholar/screens/scholar-list/scholar-list.screen.tsx`
- `apps/native/src/features/scholar/components/scholar-card/scholar-card.tsx`

### Changes

- Replace the 2-column grid layout with a single-column vertical list.

* Render photo circle, title, bio snippet (clamped), and chevron buttons.

### Completion Criteria

- Scholar list displays as a list with centered content (max-width aligned).

---

## Stage 5: Scholar Detail screen — Mobile profile polish

- **Status:** Planned

### Why

The scholar profile header is currently sparse. It needs expansion to support biography toggling, detailed stats, and clean tab filters for content.

### Goal

Expand `ScholarHeader` to support collapsable/expandable bio snippets, and add filter tabs (All | Series | Singles | Collections) above the content list.

### Files

- `apps/native/src/features/scholar/screens/scholar-detail/scholar-detail.screen.tsx`
- `apps/native/src/features/scholar/components/scholar-header/scholar-header.tsx`

### Changes

- Implement expandable text block for biographies.

* Add filter tab buttons. Connect filter state to content query hooks.

### Completion Criteria

- Profile detail screen correctly filters listed content categories when tabs are clicked.

---

## Stage 6: Live screen — Tabbed categories

- **Status:** Planned

### Why

Showing Live, Scheduled, and Ended sessions on a single scrollable page causes visual clutter. Introducing clean sub-tabs divides concerns logically.

### Goal

Create sub-tabs (Now | Scheduled | Ended) in the live features layout, displaying lists corresponding to active, upcoming, and recording-ended streams.

### Files

- `apps/native/src/features/live/screens/live.screen.tsx`

### Changes

- Implement top tab switcher or segmented control.

* Render lists conditionally based on active live category filter.

### Completion Criteria

- Live screen switches tabs smoothly. Empty states are displayed correctly when no sessions exist.

---

## Stage 7: Library screen — Sub-tab layout

- **Status:** Planned

### Why

Users want to quickly filter saved items, in-progress items, and completed listings.

### Goal

Add top tab switcher (Saved | In Progress | Completed) to the library, with clean row items featuring progress bars.

### Files

- `apps/native/src/features/library/screens/library.screen.tsx`

### Changes

- Refactor `SectionList` into tab-filtered `FlatList` elements.

* Display thin progress bars (4px, rounded) under in-progress items.

### Completion Criteria

- Library tabs work correctly. Progress bars display values matching database states.

---

## Stage 8: Sign In screen — Premium Auth card

- **Status:** Planned

### Why

The login page should present a high-quality interface that matches a scholarly digital catalog.

### Goal

Design a clean floating authentication panel featuring Google and Apple premium single-sign-on buttons.

### Files

- `apps/native/src/features/auth/screens/sign-in/sign-in.screen.tsx`

### Changes

- Polish spacing, logo placement, and typography.

* Style the SSO buttons to match the dark and light token presets.

### Completion Criteria

- Sign in screen renders cleanly. Button interaction states work correctly.

---

## Stage 9: Settings screen — Sub-sections configuration

- **Status:** Planned

### Why

The Account screen was a flat list mixing unrelated options. Grouping settings in sub-sections (General, Profile, Legal) provides better hierarchy.

### Goal

Re-style Settings as a multi-menu panel:

- General: Language preference, theme mode (System/Light/Dark), and master notification toggles.
- Profile: User name, email, display name editing, role permissions.
- Legal: Document links (Privacy Policy, Terms).

### Files

- `apps/native/src/features/account/screens/account.screen.tsx`
- `apps/native/src/features/account/screens/account-profile.screen.tsx`

### Changes

- Add segmented layout blocks or routing screens for each settings category.

* Implement local state notifications configuration toggles.

### Completion Criteria

- Segmented controls save configuration variables correctly.

---

## Stage 10: Admin screen — Unified dashboard screens [Cancelled]

- **Status:** Cancelled

### Why

The user decided to keep admin functionality web-only and remove all admin panels/routes from the mobile app.

### Goal

None (Stage is Cancelled).

### Files

None.

### Changes

None.

### Completion Criteria

None.

---

## Stage 11: Unified Listing Detail page — /listing/[id] and removal of legacy routes

- **Status:** Planned

### Why

As per the nomenclature authority, `/lectures/[id]`, `/series/[id]`, and `/collections/[id]` detail layouts must be completely removed. We must transition to a single, unified dynamic route `/listing/[id]` to represent any top-level content unit.

### Goal

Completely delete old route directories for collections, series, and lectures. Add the dynamic `/listing/[id].tsx` router page. Update `docs/nomenclature.md` to reflect this routing structure and prevent documentation drift.

### Files

- Delete: `apps/native/src/app/(content)/lectures/`
- Delete: `apps/native/src/app/(content)/series/`
- Delete: `apps/native/src/app/(content)/collections/`
- Add: `apps/native/src/app/(content)/listing/[id].tsx`
- Add screen component: `apps/native/src/features/listing/screens/listing-detail.screen.tsx`
- Documentation: `docs/nomenclature.md`

### Changes

- **Route Deletion:** Cleanly delete the legacy route files from the monorepo router.

* **Unified Routing:** In `/listing/[id].tsx`, resolve the listing parameters and pass them to the `ListingDetailScreen` component.
* **Dynamic Rendering:** Implement `ListingDetailScreen` to fetch the listing item. Differentiate layouts dynamically based on `ListingFormat` (Single, Series, Collection).
* **Nomenclature Document Update:** Edit `docs/nomenclature.md` (specifically line 59) to replace `/lectures/:id` with `/listing/:id` as the canonical route for Listings, noting that legacy routes are removed (this change is shared with the web plan).

### Blockers

None. Old routes will be completely deleted from the mobile codebase without redirects.

### Dependencies

Stages 2 and 3 (shared row styles). Scroll fix complete.

### Completion Criteria

- `pnpm --filter native typecheck` passes.

* Legacy routes are removed. Navigating to `/listing/[id]` fetches and displays listings.

---

## Stage 12: MiniPlayer & Playback polish

- **Status:** Planned

### Why

The audio mini-player should have unified controls, padding constraints, and dark/light color token compliance.

### Goal

Migrate playback components to token configurations and ensure responsive display constraints on all mobile viewports.

### Files

- `apps/native/src/features/audio/components/mini-player.tsx`

### Changes

- Remove hardcoded color styles.

* Refactor dimensions to adapt cleanly to navigation bar sizing.

### Completion Criteria

- MiniPlayer looks correct in both dark and light modes.

---

# Final Verification

After all stages are committed:

- `pnpm --filter native typecheck` passes.
- `pnpm --filter native test` passes.
- Verification checks:
  - Catalog list, Feed list, and Library lists scroll smoothly.
  - Legacy routes `/lectures`, `/series`, `/collections` do not compile or exist in router configuration.
  - Unified `/listing/[id]` loads and displays Single, Series, and Collection layouts properly.
  - Active and disabled states in settings configure correctly.

---

# Plan Completion

The plan is `Completed` when:

1. All stages are committed and merged from the `feat/native-ui-redesign` worktree branch.
2. All automated types and tests verify cleanly.
3. The worktree branch is removed after merge (`git worktree remove .worktrees/feat/native-ui-redesign`).

Move this file to `.agents/plans/completed/` and update `Status` to `Completed`.
