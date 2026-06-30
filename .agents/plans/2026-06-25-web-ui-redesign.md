# Metadata

- **Date:** 2026-06-25
- **Status:** Planned
- **Scope:** `apps/web` — all screens, shared components, navigation, routing
- **Summary:** Comprehensive UI redesign of the Salafi Durus web app. The app serves Muslim
  learners seeking authentic Islamic knowledge; the target mood is scholarly, calm, and
  trustworthy — like a premium digital Islamic library. The redesign does not change the colour
  palette. It addresses layout, typography, spacing, card consistency, navigation structure,
  new screens, route renaming, and inline style remediation across all major screens.
- **Dependencies:**
  - `2026-06-25-web-scroll-fix.md` must be completed first (Stage 1 at minimum), as several
    redesigned screens depend on `ScreenView` scrolling correctly.
  - Design spec reviewed and approved by user on 2026-06-25 (see conversation
    `7df52d9c-9c64-42d6-a46f-8a8746723c29`).

---

# Worktree Requirement

> **All implementation work for this plan must be done in a git worktree.**
>
> Do not implement directly on the main working tree. Create a worktree branch first:
>
> ```bash
> git worktree add .worktrees/feat/web-ui-redesign -b feat/web-ui-redesign
> ```
>
> Work exclusively in `.worktrees/feat/web-ui-redesign`. Commit each stage independently on
> that branch. When all stages are complete and the final verification passes, open a PR from
> `feat/web-ui-redesign` into the main branch and remove the worktree after merge.

---

# Design Brief — For Agents

This section records the design intent gathered in a deep interview with the product owner on
2026-06-25. Agents must read this section before implementing any stage.

## Who This App Is For

Salafi Durus is a digital audio library for Islamic knowledge. The audience is **Muslim learners
of all ages** seeking authentic Islamic knowledge. The mood should feel **scholarly, calm, and
trustworthy** — like a premium digital Islamic library, not a social media platform or a generic
media app.

## What Is Not Changing

- **Colours** — the existing design token palette is approved and unchanged.
- **Overall layout structure** — the left sidebar + content area shell is kept. No switch to a
  top navbar.
- **Mobile navigation** — the bottom tab bar structure on mobile is not part of this redesign.

## What Is Changing and Why

### Global Polish (affects all screens)

Three areas were called out as needing improvement across the board:

1. **Typography** — heading sizes are too small; the serif display typeface (Fraunces) is not
   being used boldly enough on titles; body text line-height is too tight.
2. **Spacing** — pages feel cramped; content needs more room to breathe.
3. **Card/row consistency** — cards and list rows across different screens look different from
   each other; they need a unified padding, border/shadow, and hover treatment.

### Sidebar

The current sidebar has search and sign-in tucked into a `TopAuthStrip` bar above the content
area, separate from the sidebar itself. The owner decided:

- **Remove `TopAuthStrip` entirely** — it is redundant chrome that takes up vertical space.
- **Move search into the sidebar** — a search icon at the top of the sidebar nav items,
  linking to `/search`.
- **Move sign-in state to the bottom of the sidebar** — unauthenticated users see a "Sign In"
  button; authenticated users see their name/avatar and can sign out. This is more elegant and
  feels more like a native app (similar to Notion, Linear, etc.).
- **"Account" renamed to "Settings"** — the section was renamed to better reflect its new
  tabbed content (General settings, Profile, Legal). The Settings link in the sidebar always navigates to `/account`, allowing unauthenticated users to change display and language preferences.
- **Admin section added below Settings** — separated by a visible divider and a non-clickable
  `ADMIN` section label, with five nav items: Home, Stats, Users, Contents, Scholars. Visible only to
  admin users.

### Feed Screen (`/feed`)

**Problem:** The grid card layout felt cramped, had no clear hero/featured section at the top,
and card typography was hard to read.

**Decision:** Switch to a **podcast-style list view** (inspired by Overcast, Pocket Casts) —
each lecture occupies one full-width row with rich metadata: scholar avatar, title (Fraunces
serif), scholar name, duration, date, play and save actions, and an in-progress bar. The
`FeedScholarRow` and `FeedTopicRow` editorial sections are retained as full-width breaks in the
list.

### Scholar List (`/scholars`)

**Problem:** The portrait card grid gave little information per scholar and looked like an
undifferentiated tile layout.

**Decision:** A **vertical list** — one scholar per row — with a large photo (~72px), name
(Fraunces), a 1–2 line bio snippet, and lecture count. Max-width 720px centred. More
information, better scannability.

### Scholar Detail (`/scholars/[slug]`)

**Decision:** Keep the existing two-panel concept (sticky left panel + scrollable right content)
but polish it properly: richer scholar header in the left panel (larger photo, bio expand
toggle, stats), and filter/sort tabs (All | Series | Singles | Collections) above the content
list on the right. Currently the sticky behaviour is broken because of the scroll bug — fixing
the scroll fix plan first unblocks this.

### Content Item Detail (Series, Collections, Singles)

**Important context:** What was called "lecture detail" in earlier code (`/lectures/[id]`) is
actually a _content container_ detail page — not a page for a single audio file. The three
container types are:

- **Series** — an ordered sequence of lectures by one scholar on one topic.
- **Collections** — a curated set of lectures, possibly across multiple scholars.
- **Singles** — a standalone lecture not belonging to a series.

The legacy routes `/lectures/[id]`, `/series/[id]`, and `/collections/[id]` will be completely removed from the router. In their place, we will introduce a single unified `/listing/[id]` route. This maps directly to the umbrella term "Listing" from the nomenclature guide. The page component at `/listing/[id]` will dynamically determine the listing format (Single, Series, or Collection) and render the appropriate format variant.

**Common layout for all three:**

- Full-width header: cover image/scholar photo, title (Fraunces `displayMd`), scholar link,
  type badge, expandable description, topic tags, Play All button, Save button, progress
  indicator ("3 of 10 listened").
- Ordered lecture list below (numbered for series, unordered for collections).
- Related content ("More from [Scholar]") at the bottom.

### Live Screen (`/live`)

**Problem:** The current two-column layout (Live Now on the left, Upcoming + Ended on the
right) feels wrong — the two sections compete for attention and the layout is awkward.

**Decision:** A **tabbed layout** — Now | Scheduled | Ended — each tab shows one focused
full-width list. The sub-tabs are already wired to `TopSubnavTabs` via existing routing
(`/live`, `/live/scheduled`, `/live/ended`); the layout change is a CSS/structure change only.

### Sign In (`/sign-in`)

**Problem:** The existing sign-in card feels plain.

**Decision:** Two separate sign-in surfaces:

1. **`AuthModal` component** — for _action-triggered_ sign-in (e.g. tapping Save, Follow, or
   accessing Library). Shows an in-context modal with a contextual message (e.g. "Sign in to
   save lectures to your library"). After auth success, the modal dismisses and the action
   completes in place — no page redirect.
2. **`/sign-in` page** — for navigation-triggered sign-in (e.g. the "Sign In" button at the
   bottom of the sidebar). Gets a premium floating card design: brand logo, tagline, polished
   Apple and Google auth buttons.

The key insight from the owner: the sign-in experience should know _why_ you're being asked to
sign in and should not interrupt the user's flow unnecessarily.

### Library (`/library`)

**Problem:** The current library screens look basic and do not use `ScreenView` (causing the
scroll bug).

**Decision:** A **tabbed layout** — Saved | In Progress | Completed. Each tab shows a 720px
centred list of content rows with progress bars (for in-progress items), duration, timestamps,
and action buttons. Wrap all screens in `ScreenView`.

### Settings (renamed from Account)

**Problem:** The old Account page was structured incorrectly — it mixed unrelated things (legal
content, language, profile editing) into a single flat list of action buttons.

**Decision:** Rename to **Settings** (sidebar label only; URL stays `/account`). Restructure
into three tabs:

1. **General** — three grouped sections:
   - Language: app language and content language preference.
   - Display: theme mode (System | Light | Dark) via segmented control.
   - Notifications: master on/off toggle; if on, sub-toggles for Live sessions, Followed
     scholars, New lectures. Sub-toggle state persists when master is toggled off.
2. **Profile** — non-editable avatar, name, email; editable display name; user role/access
   display; permission request CTA (e.g. a scholar can request scholar access).
3. **Legal** — a summary blurb per document + links to Privacy Policy and Terms of Use. Legal
   does NOT live in the main app navigation; it is accessed through Settings.

### Admin Section

**Problem:** The existing admin pages used a card grid dashboard and were structured around
individual content types (scholars, lectures, topics, permissions).

**Decision:** Add an **ADMIN section in the sidebar** (visible to admin users only) with four
nav items: Home, Stats, Users, Contents. The existing `/admin/scholars`, `/admin/lectures`,
etc. routes need to be mapped to the new structure — this is an open architectural decision to
resolve before Stage 10 executes.

### MiniPlayer

The MiniPlayer stays as a bottom-docked bar (no position change). The fix is to replace its
hardcoded inline colours (`#1e293b`, `#64748b`) with CSS custom property tokens so it respects
dark mode correctly.

---

# Progress

- **Done:** Deep user interview completed. Design spec written and approved. Root cause of
  scroll bug documented in a separate plan (`2026-06-25-web-scroll-fix.md`).
- **Blocked / Uncertain:**
  - Notification settings (Stage 9 — Settings/General): persistence requires backend support.
    May need a feature flag or local-only implementation initially.
- **Next step:** Ensure scroll fix plan is complete (Stage 1 at minimum), create the worktree,
  then begin Stage 1 of this plan.

---

# Staging Strategy

Stages are ordered by dependency: foundational/shared first, then screen by screen, then
routing and new screens last. Each stage is independently committable.

_Note: The `/search` screen is out of scope for this redesign and remains unchanged._

1. Global shell — sidebar, remove TopAuthStrip, sign-in at sidebar bottom, useAdminPermissions hooks
2. Global polish — typography, spacing tokens, card/row design system, inline style remediation (including MiniPlayer tokens)
3. Feed screen — list view layout
4. Scholar List screen — vertical list layout
5. Scholar Detail screen — sticky two-panel polish
6. Live screen — tabbed layout (Now | Scheduled | Ended)
7. Library screen — tabbed layout (Saved | In Progress | Completed) + ScreenView wrap
8. Sign In — AuthModal component + updated `/sign-in` page
9. Settings screen (renamed from Account) — 3 tabs: General | Profile | Legal
10. Admin section — backend User List endpoint, new sidebar entries + new sub-pages (Stats, Users, Contents, Scholars)
11. Unified Listing Detail page — /listing/[id] (ListingViewDto union, routes.ts update, contentHref updates, remove older routes)
12. TopSubnavTabs polish

---

## Stage 1: Global shell — sidebar, TopAuthStrip removal, sign-in placement

- **Status:** Planned

### Why

The `TopAuthStrip` is redundant chrome — it duplicates auth controls that belong in the sidebar.
Consolidating everything into the sidebar makes the layout cleaner and the auth state more
discoverable (bottom of sidebar, always visible). Moving search into the sidebar removes the
one remaining reason to have a top bar at all. The Admin section in the sidebar was added
because admin users need a distinct navigation section, not a dashboard page they have to
navigate to first.

### Goal

- Rename "Account" nav item → "Settings" in the sidebar.
- Remove `<TopAuthStrip>` from the main layout entirely.
- Move search into the sidebar (search icon that navigates to `/search`).
- Move auth state (sign-in button / user name + sign-out) to the **bottom** of the sidebar.
- Add Settings nav item to sidebar, always linking to `/account` regardless of auth status.
- Add Admin section to sidebar (visible divider + non-clickable `ADMIN` label + five nav items:
  Home `/admin`, Stats `/admin/stats`, Users `/admin/users`, Contents `/admin/contents`,
  Scholars `/admin/scholars`), rendered only when `useAdminPermissions()` returns true.
- Polish: active state, hover transitions, brand row typography.

### Files

- `apps/web/src/app/(main)/layout.tsx` — remove `<TopAuthStrip>`
- `apps/web/src/features/navigation/components/sidebar/sidebar.desktop.tsx`
- `apps/web/src/features/navigation/components/sidebar/sidebar.module.css`
- `apps/web/src/features/navigation/components/top-auth-strip/` — can be deleted or left unused
- `apps/web/src/features/admin/hooks/use-admin-permissions.ts` — accept options param
- New component: `SectionLabel` (non-clickable sidebar section header — uppercase, muted/caption
  style)

### Changes

- Remove `<TopAuthStrip />` from `MainLayout`.
- Modify `useAdminPermissions()` hook:
  - Add optional TanStack Query options parameter:
    ```typescript
    export function useAdminPermissions(
      options?: Omit<
        UseQueryOptions<MyPermissionsDto, Error, MyPermissionsDto, QueryKey>,
        "queryKey" | "queryFn"
      >,
    );
    ```
- Update `SidebarDesktop`:
  - Add search icon button at top of nav items linking to `/search`.
  - Rename "Account" nav item label to "Settings" and change it to always point to `/account`.
  - Add bottom slot: if unauthenticated → "Sign In" button; if authenticated → user avatar +
    name + sign-out action.
  - Query admin permissions with `useAdminPermissions({ enabled: isAuthenticated })` to avoid fetching when logged out.
  - Derive admin check: `const hasAdminAccess = (adminPermissionsData?.permissions ?? []).length > 0;`.
  - Add admin nav section: divider line + `<SectionLabel>ADMIN</SectionLabel>` + five nav
    items (Home, Stats, Users, Contents, Scholars), rendered only when `hasAdminAccess` is true.
- Improve active item: richer `--surface-selected` background + smoother hover transition.

### Blockers

None currently identified.

### Dependencies

None. Can execute as the first implementation stage.

### Completion Criteria

- `pnpm --filter web typecheck` passes.
- `pnpm --filter web test` passes.
- Run tests: `pnpm --filter web test apps/web/src/features/navigation/components/sidebar`
- Manual: sidebar renders correctly with sign-in at bottom; TopAuthStrip absent; admin section
  visible for admin user, hidden for regular user; search icon navigates to `/search`.

### Suggested Commit Message

```
feat(web): redesign sidebar — remove TopAuthStrip, add search + admin section

- Remove TopAuthStrip from main layout
- Move search (icon → /search) into sidebar top area
- Move auth state (sign-in / user + sign-out) to sidebar bottom
- Rename "Account" nav item to "Settings"
- Add admin sidebar section (ADMIN label + Home/Stats/Users/Contents/Scholars)
  visible only to admin users
- Polish active state hover transitions and brand row typography
```

---

## Stage 2: Global design polish — typography, spacing, card consistency, inline style remediation

- **Status:** Planned

### Why

Three issues were identified as applying to every screen. The owner confirmed all three must
be fixed as part of the redesign:

1. **Typography** — display headings are not prominent enough; the Fraunces serif typeface
   should be used more boldly on page titles and card titles; body line-height is too tight for
   comfortable reading.
2. **Spacing** — pages feel cramped across the board; more generous padding is needed.
3. **Card/row consistency** — different screens use different padding, border treatment, and
   hover states for similar content rows, making the app feel inconsistent.

Additionally, several components use hardcoded inline colour values (`#1e293b`, `#64748b`,
`#eee`, `#666`, `#2563eb`, etc.) that don't respect dark mode and are not using the design
token system. This must be cleaned up.

### Goal

- **Typography:** Page titles → `displayMd`; card/row titles → `titleMd` (Fraunces); body
  line-height → `1.6`; section headers → `labelMd` with `letter-spacing: 0.08em`.
- **Spacing:** Audit `--space-layout-page-x/y` token values; increase if too cramped.
- **Card/row design system:** Shared list-row CSS — `1rem 1.5rem` padding,
  `--surface-hover` hover state, `150ms ease` transition, `--border-subtle` border.
- **Inline style remediation:** Replace all hardcoded colour values with CSS tokens (including the MiniPlayer bar).

### Files

- `apps/web/src/app/theme-css.ts` — review/adjust spacing token values if needed
- `apps/web/src/features/audio/components/mini-player/mini-player.tsx` — inline colour fix
- `apps/web/src/features/audio/components/mini-player/mini-player.module.css` — move styles to CSS module
- `apps/web/src/features/library/screens/library-saved.screen.desktop.tsx`
- `apps/web/src/features/library/screens/library-completed.screen.desktop.tsx`
- `apps/web/src/features/scholar/screens/scholar-list/scholar-list.screen.desktop.tsx`
- `apps/web/src/features/admin/` — any inline styles in admin screens
- `apps/web/src/app/globals.css` — add shared `.listRow` utility class

### Changes

- `MiniPlayer` Inline Style Cleanup (Merged from Stage 12):
  - Replace hardcoded colors `#1e293b` → `var(--content-default)` and `#64748b` → `var(--content-muted)`.
  - Move styles to a CSS module `mini-player.module.css` for clean layout classes and dark mode adaptability.
- Library screens: `borderBottom: "1px solid #eee"` → `var(--border-subtle)`,
  `color: "#666"` → `var(--content-muted)`, `color: "#999"` → `var(--content-subtle)`,
  progress bar `background: "#2563eb"` → `var(--action-primary)`.
- Scholar list: convert inline styles to a CSS module.
- Add shared `.listRow` CSS class to `globals.css` for use across Feed, Library, Scholar List.

### Blockers

None currently identified.

### Dependencies

Stage 1 should be complete (TopAuthStrip may be deleted, making its inline style issue moot).

### Completion Criteria

- `pnpm --filter web typecheck` passes.
- `pnpm --filter web lint` passes with no new violations.
- Run tests: `pnpm --filter web test apps/web/src/features/audio/components/mini-player`
- MiniPlayer renders correctly in both light and dark mode.
- No hardcoded colour strings (`#xxx` or `rgb(...)`) remain in the listed files.

### Suggested Commit Message

```
style(web): replace inline hardcoded colours with CSS tokens; polish typography/spacing

- MiniPlayer: replace #1e293b/#64748b with --content-default/--content-muted
- Library screens: replace hardcoded border/text colours with design tokens
- Scholar list: convert inline styles to CSS module
- Increase body line-height to 1.6 globally
- Add shared listRow utility class for consistent row hover treatment
```

---

## Stage 3: Feed screen — list view

- **Status:** Planned

### Why

The owner identified three problems with the current feed:

- Grid columns/spacing felt off — too cramped or too loose.
- No clear hero or featured section at the top.
- Typography on the cards was hard to read and did not feel premium.

The decision was to switch to a **podcast-style list view** (like Overcast or Pocket Casts) —
a vertical list where each lecture row contains richer metadata. This gives more breathing room
per item, better scannability, and a cleaner reading experience. The `FeedScholarRow` and
`FeedTopicRow` editorial sections are kept, as they serve a distinct browsability purpose.

### Goal

Replace the current card grid with a clean, full-width list view. Each lecture is one row with
scholar avatar, title, scholar name, duration/date, play and save actions, and an optional
in-progress bar.

### Files

- `apps/web/src/features/feed/screens/feed-recent.screen.desktop.tsx`
- `apps/web/src/features/feed/screens/feed-recent.screen.desktop.module.css`
- `apps/web/src/features/feed/screens/feed-recent.screen.mobile.tsx`
- `apps/web/src/features/feed/screens/feed-recent.screen.mobile.module.css`
- `apps/web/src/features/feed/components/feed-content-card/` — replace or repurpose as
  `FeedListRow`
- New component: `FeedListRow`

### Changes

- Replace `FeedContentCard` (card format) with `FeedListRow` (full-width row):
  - Left: scholar avatar circle (~48px).
  - Centre: lecture title (`titleMd`, Fraunces), scholar name (`bodyMd`, muted), duration +
    date (`caption`, muted).
  - Right: play button (circle icon) + save/bookmark icon.
  - Hover: `--surface-hover` background, `150ms ease` transition.
  - Progress bar: 4px thin bar below the row if lecture is in progress.
- Remove `.grid` CSS class; replace with `.list` (flex column, `gap: 0`).
- Retain `FeedScholarRow` and `FeedTopicRow` as full-width editorial blocks with a labelled
  header and clear spacing.
- Page header: upgrade `heroTitle` to `displayMd` Fraunces.

### Blockers

None currently identified.

### Dependencies

Stage 2 (shared list row styles and token fixes).

### Completion Criteria

- `pnpm --filter web typecheck` passes.
- `pnpm --filter web test` passes.
- Manual: `/feed` and `/feed/recent` render as a list; rows are readable and hover correctly;
  scholar and topic rows still appear as full-width editorial sections.

### Suggested Commit Message

```
feat(web/feed): replace card grid with podcast-style list view

Replace FeedContentCard grid with FeedListRow list. Each row shows
scholar avatar, title (Fraunces titleMd), scholar name, duration/date,
play button, and a progress bar when in progress. Scholar/topic editorial
rows remain full-width with labelled headers.
```

---

## Stage 4: Scholar List screen — vertical list

- **Status:** Planned

### Why

The current portrait card grid (`repeat(auto-fill, minmax(180px, 1fr))`) gives very little
information per scholar — just a photo and a name — and doesn't feel organised. The owner
wanted a layout that communicates more per scholar (bio, lecture count) and feels more like a
curated directory than a photo wall.

### Goal

Replace the portrait card grid with a vertical list — one scholar per row with a larger photo,
name, bio snippet, and lecture count. Max-width 720px centred.

### Files

- `apps/web/src/features/scholar/screens/scholar-list/scholar-list.screen.desktop.tsx`
- New or updated: `apps/web/src/features/scholar/components/scholar-card/scholar-card.tsx` →
  renamed/replaced with `ScholarListRow`
- New CSS module for the list screen

### Changes

- Replace CSS grid with a flex column list.
- Each `ScholarListRow`:
  - Left: scholar photo (large circle or rounded square, ~72px).
  - Centre: name (`titleMd`, Fraunces), bio snippet (1–2 lines, `bodyMd`, muted, clamped),
    lecture count (`caption`, e.g. "42 lectures").
  - Right: follow button (if authenticated) or chevron icon.
  - Hover: `--surface-hover` row highlight.
- Page header: `displayMd` "Scholars" + count tagline.
- Max-width: `720px` centred.
- Convert inline styles to CSS module (follows Stage 2).

### Blockers

None currently identified.

### Dependencies

Stage 2 (shared row styles, inline style removal from this screen).

### Completion Criteria

- `pnpm --filter web typecheck` passes.
- `pnpm --filter web test` passes.
- Manual: `/scholars` renders as a vertical list with photo, name, bio, and count; max-width
  centred; hover state visible.

### Suggested Commit Message

```
feat(web/scholars): replace portrait card grid with vertical list view

Each scholar now appears as a full-width list row with a larger photo
(72px), name (Fraunces titleMd), bio snippet (clamped 2 lines), lecture
count, and follow/chevron action. Max-width 720px centred.
```

---

## Stage 5: Scholar Detail screen — polish sticky two-panel

- **Status:** Planned

### Why

The two-panel structure (sticky left sidebar + scrollable right content) already exists and was
the correct decision — the owner confirmed it. The problems are:

1. The left panel is too sparse (small photo, not enough info).
2. The sticky behaviour is currently broken because of the scroll bug (fixed in the scroll fix
   plan — that must be done first).
3. The right content list uses ad-hoc styling rather than the shared list row pattern.
4. There is no way to filter the scholar's content by type (Series, Singles, Collections).

### Goal

Polish the existing two-panel layout: richer left panel, correct sticky positioning, shared
list row component on the right, filter/sort tabs above the content list.

### Files

- `apps/web/src/features/scholar/screens/scholar-detail/scholar-detail.screen.desktop.tsx`
- `apps/web/src/features/scholar/screens/scholar-detail/scholar-detail.screen.desktop.module.css`
- `apps/web/src/features/scholar/components/scholar-header/scholar-header.tsx`
- `apps/web/src/features/scholar/components/scholar-content-list/scholar-content-list.tsx`

### Changes

- `ScholarHeader`: increase photo size, use `titleLg` (Fraunces) for name, add bio clamp +
  expand toggle, add lecture count + total duration stats row.
- `ScholarContentList`: use shared list row component from Stage 3/4; add filter/sort tabs
  (All | Series | Singles | Collections) above the list.
- CSS: confirm `position: sticky; top: 0; align-self: flex-start` on `.sidebar` with correct
  `top` offset relative to `TopSubnavTabs` height (approx `3.5rem`).
- Mobile: left panel collapses to a compact header bar at the top.

### Blockers

Scroll fix plan Stage 1 must be complete first — `position: sticky` inside `.appContent`
requires the scroll chain to be working.

### Dependencies

- Scroll fix plan Stage 1 complete.
- Stages 2, 3, 4 for shared row component.

### Completion Criteria

- `pnpm --filter web typecheck` passes.
- Manual: `/scholars/[slug]` — left panel sticks on scroll; photo, name, bio visible; right
  content list scrolls; filter tabs functional.

### Suggested Commit Message

```
feat(web/scholar): polish scholar detail — sticky panel, bio expand, filter tabs

Enrich ScholarHeader (larger photo, Fraunces titleLg, bio clamp/expand,
stats). Add filter/sort tabs to ScholarContentList. Confirm sticky panel
positioning relative to TopSubnavTabs.
```

---

## Stage 6: Live screen — tabbed layout

- **Status:** Planned

### Why

The current two-column layout (Live Now on the left, Upcoming + Ended on the right) was
identified by the owner as feeling wrong. The two sections compete for attention visually and
the layout makes it hard to focus on what matters. The sub-tab routing (Now / Scheduled / Ended)
already exists — the fix is to embrace it fully rather than trying to show all three states at
once on the same screen.

### Goal

Replace the two-column layout with a tabbed layout. Each tab (Now | Scheduled | Ended) shows
one focused full-width list.

### Files

- `apps/web/src/features/live/` — screens and components
- Sub-tab routing: Now = `/live`, Scheduled = `/live/scheduled`, Ended = `/live/ended`

### Changes

- Remove two-column `styles.twoColumn` layout from the desktop screen.
- Each tab renders a full-width list of sessions:
  - "Now" tab: pulsing `● LIVE` badge + session title + scholar + join button; or empty state
    ("No live sessions right now — check back soon").
  - "Scheduled" tab: list with date/time chips.
  - "Ended" tab: list with recording-available indicator.
- Session title: `titleMd` (Fraunces).
- Sub-tabs already wired to `TopSubnavTabs` — no routing change needed.

### Blockers

None currently identified.

### Dependencies

Stage 2 (shared list row styles).

### Completion Criteria

- `pnpm --filter web typecheck` passes.
- Manual: `/live`, `/live/scheduled`, `/live/ended` each render a focused list; no two-column
  remnant on any viewport.

### Suggested Commit Message

```
feat(web/live): replace two-column layout with tabbed Now/Scheduled/Ended views

Each tab (Now, Scheduled, Ended) now shows a single focused full-width
list. Removes the two-column split layout. Live sessions display a
pulsing LIVE badge.
```

---

## Stage 7: Library screen — tabbed layout + ScreenView wrap

- **Status:** Planned

### Why

The library screens have two problems:

1. They look basic — the owner described them as plain, with low visual quality.
2. They use bare `<div>` roots instead of `<ScreenView>`, causing the scroll bug (documented
   in `2026-06-25-web-scroll-fix.md`).

The owner chose a tabbed layout (Saved | In Progress | Completed) because it matches the
existing sub-tab routing and gives each state its own focused view rather than a combined
scroll with section headers.

### Goal

Restructure Library to a tabbed layout. Wrap all bare library screens in `ScreenView`. Apply
shared list row styles.

### Files

- `apps/web/src/features/library/screens/library-saved.screen.desktop.tsx`
- `apps/web/src/features/library/screens/library-saved.screen.mobile.tsx`
- `apps/web/src/features/library/screens/library-completed.screen.desktop.tsx`
- `apps/web/src/features/library/screens/library-completed.screen.mobile.tsx`
- Possibly a new `library.screen.desktop.tsx` if tab routing changes

### Changes

- Wrap all library screen root elements in `<ScreenView>`.
- Each tab: full-width list using shared `ListRow` pattern:
  - Left: content type icon or scholar avatar.
  - Centre: title (`titleMd`) + scholar name (`bodyMd`, muted) + progress bar (4px,
    `--action-primary`) if in-progress.
  - Right: duration + last-listened timestamp + action button.
- Empty state: friendly copy + call to action.
- Max-width: `720px` centred.
- Replace all hardcoded inline colours (see Stage 2).

### Blockers

This stage overlaps with Stage 2 of the scroll fix plan (`2026-06-25-web-scroll-fix.md`),
which also wraps the Library screens in `<ScreenView>`. Coordinate before executing: if the
scroll fix plan Stage 2 is already done, skip the `ScreenView` wrap here and focus only on
the layout redesign.

### Dependencies

Stage 2 of this plan (inline style removal). Scroll fix plan Stage 1 must be complete.

### Completion Criteria

- `pnpm --filter web typecheck` passes.
- `pnpm --filter web test` passes.
- Manual: `/library/saved` and `/library/completed` scroll; list rows render correctly in
  light and dark mode; empty states show correct copy.

### Suggested Commit Message

```
feat(web/library): tabbed layout, ScreenView wrap, shared list rows

Wrap bare library screens in ScreenView. Apply shared list row styles.
Replace all hardcoded inline colours with CSS tokens. Each tab (Saved,
In Progress, Completed) shows a focused 720px-wide list.
```

---

## Stage 8: Sign In — AuthModal component + updated page

- **Status:** Planned

### Why

The current sign-in experience redirects the user to `/sign-in` regardless of what triggered
the sign-in prompt. This is disruptive: the user loses context of what they were doing (e.g.
trying to save a lecture), and must navigate back after signing in.

The owner's preferred model: **in-context sign-in for action-triggered prompts** (Save, Follow,
Library access) via a modal, so the user stays on the page. The `/sign-in` page remains for
navigation-triggered prompts (the "Sign In" button at the bottom of the sidebar). The modal
and the page both use the same sign-in UI.

### Goal

Introduce `AuthModal` for action-triggered sign-in. Update the `/sign-in` page with a premium
card design.

### Files

- New: `apps/web/src/features/auth/components/auth-modal/auth-modal.tsx`
- New: `apps/web/src/features/auth/components/auth-modal/auth-modal.module.css`
- `apps/web/src/features/auth/screens/sign-in/` — update page UI
- Update callers: Save button, Follow button, Library access gate, Following feed gate

### Changes

- `AuthModal`:
  - Accepts `message?: string` prop (contextual copy, e.g. "Sign in to save lectures to your
    library").
  - Renders Apple + Google sign-in buttons.
  - After auth success, dismisses and continues in place.
  - Accessible: focus-trapped dialog, `role="dialog"`, `aria-modal`.
- `/sign-in` page:
  - Centred floating card, `--shadow-lg`, `--accent-mixed-surface` background.
  - Brand logo + "Salafi Durus" above buttons.
  - Tagline: "Join the community of learners".
  - Apple + Google buttons: larger, properly rounded, correct icon treatment.
- Wire `AuthModal` into all `AuthRequiredState` usages that currently redirect to `/sign-in`.

### Blockers

None currently identified.

### Dependencies

Stage 1 (sidebar sign-in placement changes must be stable first).

### Completion Criteria

- `pnpm --filter web typecheck` passes.
- `pnpm --filter web test` passes.
- Manual: clicking Save on a lecture while unauthenticated shows modal (not redirect); after
  sign-in the save action completes in place; direct nav to `/sign-in` shows the updated page.

### Suggested Commit Message

```
feat(web/auth): add AuthModal for in-context sign-in; polish /sign-in page

Introduce AuthModal with contextual message prop. Wire into Save, Follow,
Library access, and Following feed. Update /sign-in page with premium
card layout: brand logo, tagline, polished OAuth buttons.
```

---

## Stage 9: Settings screen — rename Account, 3 tabs

- **Status:** Planned

### Why

The old Account page mixed unrelated concerns into a flat list of action buttons — it had
"Edit Profile", "Legal", "Sign Out", and language settings all on one screen, with no
hierarchy. The owner described this as "completely wrong" and specified a proper restructure:

- **Legal does not belong in the main navigation** — it should be a tab within Settings.
- **General settings** should be grouped into three clear sections: Language, Display, and
  Notifications.
- **Notifications** should have a master toggle; when off, sub-settings are hidden but their
  state is preserved so they don't have to be re-configured when re-enabled.
- **Profile** is mostly read-only (name and email cannot be edited here) but allows editing
  the display name and viewing/requesting access roles.
- The sidebar label was changed to "Settings" to better reflect this structure.

### Goal

Rename Account to Settings (sidebar only; URL stays `/account`). Restructure the page into
three tabs: General | Profile | Legal. Allow unauthenticated users to access this page; they can modify General settings and view Legal documents, but the Profile tab will present a Sign-In CTA.

### Files

- `apps/web/src/features/account/screens/` — all account screen files
- Route: `/account` → keep URL
- Possibly rename files to `settings.screen.*` for clarity

### Changes

**General tab** — three grouped sections:

- Section A — Language: app language selector, content language preference.
- Section B — Display: theme mode segmented control (System | Light | Dark).
- Section C — Notifications: master toggle on/off; if on → sub-toggles for Live sessions,
  Followed scholars, New lectures. Sub-toggle state persists when master is off.

**Profile tab:**

- If unauthenticated: display a clean Sign-In card/CTA directing the user to sign in to access their profile and roles.
- If authenticated:
  - Avatar circle (non-editable — initials or photo), name, email (read-only).
  - Display name — editable input.
  - User role/access display.
  - Permission request CTA (e.g. scholar access request for eligible users).

**Legal tab:**

- Summary blurb per document.
- Link → Privacy Policy (`/privacy`).
- Link → Terms of Use (`/terms-of-use`).

New components: `SettingsSection`, `SettingsRow`, `SegmentedControl` (for theme mode).

Layout: single column, `640px` max-width centred, sections separated by `--accent-divider`.

### Blockers

Notification preferences persistence requires backend support. If the API is not ready, render
the Notifications section as UI-only with local state, or defer behind a feature flag. Do not
block this stage on the backend — ship the UI first.

### Dependencies

Stage 1 (sidebar label updated). No other plan dependencies.

### Completion Criteria

- `pnpm --filter web typecheck` passes.
- `pnpm --filter web test` passes.
- Manual: `/account` renders three tabs; General settings update; Profile tab shows correct
  user data; Legal tab links work.

### Suggested Commit Message

```
feat(web/account): redesign as Settings with General/Profile/Legal tabs

Rename Account to Settings (sidebar label only). Add General tab
(Language, Display theme, Notifications), Profile tab (read-only user
info + editable display name + role/access), Legal tab (summaries +
links). New components: SettingsSection, SettingsRow, SegmentedControl.
```

---

## Stage 10: Admin section — backend User List endpoint, new sub-pages and sidebar entries

- **Status:** Planned

### Why

The owner decided that admin functionality should live in the sidebar as a distinct section
(after Account/Settings) — not as a separate dashboard page. This matches how the rest of the
app is structured (sections in sidebar, not nested pages). The new admin section has five items:

- **Home** — overview / recent activity.
- **Stats** — key metrics dashboard.
- **Users** — user management (roles, access).
- **Contents** — content management (lectures, series, collections, topics).
- **Scholars** — scholar management.

Because lookup-by-ID is a poor user experience for user management, we will introduce backend API endpoints to list and search users and their permissions. The architectural mapping has been resolved: we will create entirely new separate admin pages at `/admin/stats`, `/admin/users`, `/admin/contents`, and `/admin/scholars`. The old routes (`/admin/lectures`, `/admin/live`, `/admin/topics`, `/admin/permissions`) will be completely deleted and return 404.

### Goal

Implement backend search/list APIs for users, add new admin sub-pages, and wire the sidebar entries added in Stage 1.

### Files

- **Backend / Shared Contracts:**
  - `packages/core-contracts/src/endpoints.ts` — add `admin.users.list` endpoint
  - `packages/core-contracts/src/types/admin.types.ts` — add response types (`AdminUserListItemDto`, `AdminUserListDto`)
  - `apps/api/src/modules/admin-permissions/admin-permissions.controller.ts` — add `GET /admin/users` or `GET /admin/permissions` listing endpoint
  - `apps/api/src/modules/admin-permissions/admin-permissions.service.ts` — add user listing and query logic
- **Frontend:**
  - `apps/web/src/features/admin/api/admin.api.ts` — add `fetchAdminUsers()`
  - `apps/web/src/features/admin/hooks/use-admin-users.ts` — React Query list users hook
  - `apps/web/src/features/admin/screens/admin-users/admin-users.screen.desktop.tsx` — new screen components (searchable/sortable table)
  - `apps/web/src/app/(main)/(admin)/admin/` — new page files
  - Delete old legacy admin routes in `apps/web/src/app/(main)/(admin)/admin/` (except scholars which is redesigned)

### Changes

- **Backend Implementation:**
  - In `core-contracts`, register `GET /admin/permissions` as the users and permissions list endpoint.
  - In NestJS `AdminPermissionsController`, expose `@Get()` method. Secure it with `@RequiresPermission('manage:admin')`.
  - In NestJS `AdminPermissionsService`, query all users (with optional query filter for name/email matching `contains` case-insensitive) and join their granted `adminPermissions`.
- **Frontend Implementation:**
  - Implement `fetchAdminUsers()` API fetch and custom react-query hook `useAdminUsers()`.
  - Build `AdminUsersDesktopScreen` and `/admin/users/page.tsx` rendering a table of users (showing name, email, roles/permissions list, and a "Manage" button triggering the modal or inline role editing).
  - `/admin` (Home): overview page with quick navigation links and recent activity summary.
  - `/admin/stats`: key metrics dashboard (total lectures, scholars, users, sessions).
  - `/admin/contents`: searchable/sortable table for lectures/series/collections; add, edit, delete; manage topics taxonomy. (Handles old `/admin/lectures`, `/admin/live`, `/admin/topics` routes).
  - `/admin/scholars`: dedicated scholar manager screen (redesigned separately from `/admin/contents`).
  - Delete all unused legacy route folders (e.g. `lectures`, `live`, `topics`, `permissions` under `/admin/`).

### Blockers

None.

### Dependencies

Stage 1 (admin sidebar nav items must be wired first).

### Completion Criteria

- `pnpm --filter api test` passes (including new integration tests for NestJS controller).
- `pnpm --filter web typecheck` passes.
- `pnpm --filter web test` passes.
- Run tests: `pnpm --filter web test apps/web/src/features/admin`
- Manual: `/admin/users` fetches all registered users from the backend; search filter functions correctly.
- Manual: `/admin/stats`, `/admin/contents`, and `/admin/scholars` all render for an admin user; non-admin users are redirected or shown an access-denied state.
- Manual: Legacy routes return 404.

### Suggested Commit Message

```
feat(web/admin): add Stats, Users, Contents, and Scholars admin sub-pages

Create dedicated admin sub-pages at /admin/stats, /admin/users,
/admin/contents, and /admin/scholars, deleting the legacy admin routes
(/admin/lectures, /admin/live, /admin/topics, /admin/permissions).
```

---

## Stage 11: Unified Listing Detail page — /listing/[id] (remove older routes)

- **Status:** Planned

### Why

**Critical context:** What was historically called "lecture detail" (`/lectures/[id]`) is not a page for a single audio file. It is a _content container_ detail page. The owner clarified that there are three types of content containers:

- **Series** — an ordered sequence of lectures by one scholar on one topic.
- **Collections** — a curated set of lectures, possibly across multiple scholars.
- **Singles** — a standalone lecture not belonging to a series.

All three container types are top-level "Listings" (as defined in [nomenclature.md](file:///C:/dev/salafi-audios/docs/nomenclature.md)). To simplify routing and align cleanly with this nomenclature, we will route all three container formats under a unified dynamic path: `/listing/[id]`. This prevents route clutter, simplifies link handling, and allows a single entry point for any listing layout.

### Goal

Build a unified `/listing/[id]` page that dynamically handles Series, Collections, and Singles. Declare unified type and route contracts in `core-contracts`. Remove the legacy `/lectures/[id]`, `/series/[id]`, and `/collections/[id]` routes completely. Update `docs/nomenclature.md` to reflect this routing structure and prevent documentation drift.

### Files

- **Core Contracts & Shared Types:**
  - `packages/core-contracts/src/types/listing.types.ts` — add `ListingViewDto`
  - `packages/core-contracts/src/routes.ts` — update route configuration details
- **Frontend Components & Routing:**
  - New route: `apps/web/src/app/(main)/listing/[id]/page.tsx`
  - Modify: `apps/web/src/features/scholar/components/scholar-content-list/scholar-content-list.tsx` — update route builder `contentHref()`
  - Delete routes:
    - `apps/web/src/app/(main)/lectures/` — remove
    - `apps/web/src/app/(main)/series/` — remove
    - `apps/web/src/app/(main)/collections/` — remove
  - New feature: `apps/web/src/features/content-detail/` — shared dynamic `ContentItemDetail` component
- **Documentation:**
  - `docs/nomenclature.md` — update reference

### Changes

- **Contracts Registration:**
  - Declare `ListingViewDto` union in `listing.types.ts`:
    ```typescript
    export type ListingViewDto = LectureViewDto | SeriesViewDto | CollectionViewDto;
    ```
  - In `routes.ts`, replace the old detail routes (`lectures.detail`, `series.detail`, `collections.detail`) with the unified listings route constant:
    ```typescript
    listings: {
      detail: (id: string) => `/listing/${id}` as const,
    }
    ```
- **Unified Listing Page Routing:** In `/listing/[id]/page.tsx`, resolve the listing data from the API. Since there is no unified backend `/listing/:id` endpoint yet, the page will query `/lectures/${id}`, `/series/${id}`, or `/collections/${id}` sequentially (or use a helper resolver function) to retrieve the correct payload. Pass the resolved data and format to the `ContentItemDetail` component.
- **Client links update:** Modify `scholar-content-list.tsx`'s `contentHref` method to return `/listing/${item.id}` for all content types.
- **Common layout for Series, Collections, Singles:**
  - Top header: cover image/scholar photo + title (`displayMd`, Fraunces) + scholar link + type badge (Series/Collection/Single) + description (expandable) + topic tags + Play All button + Save button + progress indicator ("3 of 10 listened").
  - Lecture list: numbered (series) or unordered (collections); each row: track number/index + title + duration + play icon + "listened" checkmark.
  - Currently playing row: highlighted with primary color.
  - Related content: "More from [Scholar]" horizontal scroll row at the bottom.
- **Legacy Route Removal:** Completely delete the directories `apps/web/src/app/(main)/lectures`, `apps/web/src/app/(main)/series`, and `apps/web/src/app/(main)/collections`.
- **Nomenclature Document Update:** Edit `docs/nomenclature.md` (specifically the last sentence of the document) to replace `/lectures/:id` with `/listing/:id` as the canonical route for Listings, noting that legacy routes are removed.

### Blockers

- Depends on API support for listing retrieval endpoints.

### Dependencies

Stages 2 and 3 (shared list row styles). Scroll fix complete.

### Completion Criteria

- `pnpm --filter web typecheck` passes.
- `pnpm --filter web test` passes (add/run tests for dynamic layout branching).
- Run tests: `pnpm --filter web test apps/web/src/features/scholar` (verifies scholar-content-list route links)
- Manual: Navigating to `/listing/[id]` for a Series, Collection, or Single renders the correct layout.
- Manual: Confirm that legacy routes `/lectures/[id]`, `/series/[id]`, and `/collections/[id]` are removed and return 404.

### Suggested Commit Message

```
feat(web): build unified /listing/[id] page and delete legacy routes

Create unified /listing/[id] route that resolves listing format and
renders dynamic content detail layout (Series, Collections, Singles).
Delete legacy route directories for lectures, series, and collections.
```

---

## Stage 12: TopSubnavTabs polish

- **Status:** Planned

### Why

The `TopSubnavTabs` was not flagged as broken by the owner, but it is part of the global
polish goal — the active tab indicator needs to be bolder and more legible, tab padding needs
to be more generous, and typography should use the token system consistently. This is a small
final-pass stage.

### Goal

Polish `TopSubnavTabs`: better typography, bolder active tab indicator, more padding, smooth
transitions.

### Files

- `apps/web/src/features/navigation/components/top-subnav-tabs/top-subnav-tabs.tsx`
- `apps/web/src/features/navigation/components/top-subnav-tabs/top-subnav-tabs.module.css`

### Changes

- Tab labels: use `--typo-label-*` tokens consistently.
- Active tab: `--content-primary` + 2px bottom border, bolder font-weight.
- Padding: `0.75rem 1rem` or similar (more generous than current).
- Smooth `color` and `border-color` transitions on hover/active.

### Blockers

None currently identified.

### Dependencies

Stage 1 (sidebar + layout changes must be stable).

### Completion Criteria

- `pnpm --filter web typecheck` passes.
- Run tests: `pnpm --filter web test apps/web/src/features/navigation/components/top-subnav-tabs`
- Manual: `TopSubnavTabs` renders with improved typography and clear active state on all
  section pages.

### Suggested Commit Message

```
style(web/nav): polish TopSubnavTabs typography, active state, padding

Use typo-label tokens consistently. Bolder active tab with 2px border.
More generous padding. Smooth hover/active transitions.
```

---

# Final Verification

After all stages are committed:

- `pnpm --filter web typecheck` passes with no new errors.
- `pnpm --filter web test` passes with no regressions.
- `pnpm --filter web lint` passes with no new violations.
- `pnpm --filter web build` succeeds.
- Manual smoke test across all redesigned screens (desktop and mobile viewports):
  - `/feed` — list view renders and scrolls.
  - `/scholars` — vertical list renders and scrolls.
  - `/scholars/[slug]` — sticky left panel works; right content scrolls; filter tabs work.
  - `/live`, `/live/scheduled`, `/live/ended` — tabbed layout works; no two-column remnant.
  - `/library/saved`, `/library/completed` — tabbed layout, scrolls, list rows look correct.
  - `/account` (Settings) — all three tabs render; General settings persist; Legal links work.
  - `/sign-in` — premium card layout renders correctly.
  - `AuthModal` — shows for Save/Follow/Library access; dismisses after sign-in.
  - `/admin/stats`, `/admin/users`, `/admin/contents` — admin-gated pages render.
  - `/listing/[id]` (along with redirects from `/series/[id]`, `/collections/[id]`, and `/lectures/[id]`) — detail page renders with full layout.
  - Sidebar — sign-in at bottom; admin section for admin users; search navigates to `/search`.
  - MiniPlayer — correct colours in both light and dark mode.
- `position: sticky` on scholar detail left panel is working (confirms scroll chain is intact).
- Dark mode: every redesigned screen verified in dark mode.
- RTL: spot-check at least one screen (Feed or Scholars) in Arabic locale.

---

# Plan Completion

The plan is `Completed` when:

1. All 12 stages are committed and merged from the `feat/web-ui-redesign` worktree branch.
2. All final verification checks pass.
3. No regressions observed during the full manual smoke test.
4. The worktree is removed after merge (`git worktree remove .worktrees/feat/web-ui-redesign`).

Move this file to `.agents/plans/completed/` and update `Status` to `Completed`.
