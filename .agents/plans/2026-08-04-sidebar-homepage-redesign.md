# Metadata

- **Date**: 2026-08-04
- **Status**: Planned
- **Scope**: Implement the sidebar navigation and homepage redesign from `salafi-durus-full-flow (2).jsx` prototype, flow by flow. Web-only (`apps/web`). No backend, contract, or shared-package changes.
- **Summary**: The prototype defines a new sidebar navigation and homepage layout. This plan implements them using the existing codebase conventions: CSS Modules + design-token CSS variables, named exports, unified responsive pattern (`@media (max-width: 640px)` + `useIsDesktop()`), and the existing accent theme system. The prototype's inline styles are translated to CSS Modules; its hardcoded data is replaced with existing API hooks.
- **Dependencies**: Stage 1 (accent theme layer) and Stage 3 (chrome + shared design language) from the parent plan must be complete. The accent theme system (`data-accent-theme` attribute) and shared design tokens are required for the new sidebar and homepage to pick up the correct visual treatment.

# Progress

- No code changes yet. This plan is the starting point for the sidebar and homepage implementation.
- Immediate next step: Stage 1 (sidebar redesign).

# Staging Strategy

Implement sidebar first, then homepage. Each stage is independently reviewable and committable. Both stages reuse existing data hooks and the existing accent theme system — no new API endpoints or shared-package changes.

---

## Stage 1: Sidebar navigation redesign

- **Status**: Pending
- **Goal**: Redesign the sidebar navigation to match the prototype's visual language (gold accent rail, medallion-style active indicators, refined spacing and typography) while preserving all existing behavior (collapse state, nav items, user profile, language switch, sign-out).
- **Files**:
  - `apps/web/src/features/navigation/components/sidebar/sidebar.module.css` — updated styles
  - `apps/web/src/features/navigation/components/sidebar/nav-items.tsx` — updated nav item rendering (accent rail, hover states)
  - `apps/web/src/features/navigation/components/sidebar/sidebar.tsx` — updated shell (brand row, collapse behavior)
  - `apps/web/src/features/navigation/components/sidebar/sidebar.spec.tsx` — new spec for sidebar rendering and collapse behavior
  - `apps/web/src/features/navigation/components/sidebar/nav-items.spec.tsx` — new spec for nav item active states and accessibility
- **Changes**:
  - Sidebar active indicator: replace the current left-border `box-shadow: inset 4px 0 0` with a gold accent rail using `--border-focus` (gold in accent themes, teal in default). This matches the prototype's gold left-border active state.
  - Nav item hover: add a subtle surface hover (`--surface-hover`) with a 150ms ease transition, matching the prototype's `hover:-translate-y-0.5` lift effect (translated to CSS `transform` + `transition`).
  - Sidebar collapse: ensure collapsed state shows only icons with proper spacing and tooltip-like `title` attributes, matching the prototype's compact sidebar behavior.
  - Brand section: refine the brand mark and text styling to use the prototype's font and spacing conventions (Fraunces display font for the brand name, gold accent dot).
  - Footer area: preserve the existing language switch, user profile, and sign-out button behavior. Add accent-themed styling to the profile row and sign-in button.
  - All changes are CSS-only or structural; no behavior changes to navigation routing, auth, or state management.
- **Blockers**: Stage 1 of the parent plan (accent theme layer) must be complete so that `--border-focus` resolves to gold in accent themes.
- **Dependencies**: Parent plan Stage 1 (accent theme layer).
- **Completion Criteria**:
  - New sidebar spec passes: renders all nav items, marks active item, collapse toggle works, profile/sign-out flow intact.
  - Existing nav-items spec passes unmodified.
  - `bun run --filter web test`, `typecheck`, `lint` pass.
  - Manual: sidebar renders correctly at desktop (>=901px), tablet (641-900px collapsed), and mobile (<=640px drawer) under all four accent themes.
  - `git diff` on `apps/native packages/` shows no changes.
- **Suggested Commit Message**:
  ```
  feat(web): redesign sidebar navigation with accent rail and refined chrome
  ```

---

## Stage 2: Homepage redesign

- **Status**: Pending
- **Goal**: Redesign the homepage to match the prototype's visual language (accent hero banner, category chips, scholar medallions, lecture cards with sanad-chain progress, featured lecture card) while reusing existing data hooks and not breaking any existing functionality.
- **Files**:
  - `apps/web/src/features/home/screens/home/home.screen.tsx` — updated screen composition
  - `apps/web/src/features/home/screens/home/home.screen.module.css` — updated styles
  - `apps/web/src/features/home/screens/home/home.screen.spec.tsx` — updated spec
  - `apps/web/src/features/home/components/hero-section/hero-section.tsx` — restyle (accent banner, gold leaf motif, eyebrow, Resume CTA)
  - `apps/web/src/features/home/components/hero-section/hero-section.module.css` — new styles
  - `apps/web/src/features/home/components/category-chips/category-chips.tsx` — restyle (accent chip treatment)
  - `apps/web/src/features/home/components/category-chips/category-chips.module.css` — new styles
  - `apps/web/src/features/home/components/scholar-medallions/scholar-medallions.tsx` — restyle (gold accent ring on medallions)
  - `apps/web/src/features/home/components/scholar-medallions/scholar-medallions.module.css` — new styles
  - `apps/web/src/features/home/components/recently-added-section/recently-added-section.tsx` — restyle (accent card treatment)
  - `apps/web/src/features/home/components/recently-added-section/recently-added-section.module.css` — new styles
  - `apps/web/src/features/home/components/continue-listening-card/continue-listening-card.tsx` — restyle (sanad-chain progress dots, accent play button)
  - `apps/web/src/features/home/components/continue-listening-card/continue-listening-card.module.css` — new styles
  - `apps/web/src/features/home/components/mobile-download-section/mobile-download-section.tsx` — restyle if needed
  - `apps/web/src/app/(main)/(consent)/page.tsx` — no changes expected (route wrapper stays minimal)
  - `apps/web/src/app/(main)/(consent)/page.spec.tsx` — update if structure changes
- **Changes**:
  - Hero section: accent banner with radial dotted pattern background, gold leaf ribbon accent, "As-Salamu 'alaykum" eyebrow label, Resume CTA button with gold accent. Uses existing `useContinueListening` hook for the resume state.
  - Category chips: horizontal scroll row of accent-styled chips built from `useTopicsList` (`@sd/domain-search`). Chips link to `/search?topic=<slug>` (no new endpoint). Active chip uses gold accent background.
  - Scholar medallions: `useInfiniteScholarsList` (`@sd/domain-content`), avatar medallions with gold accent ring, name + lecture count, links to `/scholars/[slug]`.
  - Recently Added grid: `useExploreRecentScreen` (`@sd/domain-content`); lecture cards with sanad-chain progress dots and accent play button. Cards use `--surface-elevated` and `--border-focus` for the gold accent treatment.
  - Continue Listening card: restyled with sanad-chain progress dots, accent progress bar, and gold CTA. Preserves existing `onContinueListening` behavior.
  - Mobile download section: preserved as-is or restyled to match accent theme.
  - All copy uses existing i18n fallback strings; no new translation keys unless absolutely necessary.
  - All data fetching uses existing hooks — no new API calls or endpoints.
- **Blockers**: Stage 1 (sidebar redesign) preferred but not strictly required; Stage 1 of parent plan (accent theme layer) must be complete.
- **Dependencies**: Stage 1 of this plan (sidebar redesign) preferred; parent plan Stage 1 (accent theme layer) required.
- **Completion Criteria**:
  - All home component specs pass; existing `home.screen.spec.tsx` and `page.spec.tsx` pass (updated only where structure changed).
  - `bun run --filter web test`, `typecheck`, `lint` pass.
  - `bun run --filter web test:e2e -- e2e/home.e2e.ts` passes (update copy assertions only if the E2E references changed text).
  - Manual: home renders at desktop/mobile under all four accent themes; chips filter the grid; medallions navigate to scholar detail; continue card resumes playback.
  - `git diff` on `apps/native packages/` shows no changes.
- **Suggested Commit Message**:
  ```
  feat(web): redesign homepage with accent hero, category chips, and scholar row
  ```

---

## Stage 3: Verification and parity check

- **Status**: Pending
- **Goal**: Full verification that the sidebar and homepage redesign does not break any existing features and maintains parity across themes and breakpoints.
- **Files**: No new files; verification only.
- **Changes**:
  - Run full web test suite: `bun run --filter web test`
  - Run typecheck: `bun run --filter web typecheck`
  - Run lint: `bun run --filter web lint`
  - Run E2E: `bun run --filter web test:e2e`
  - Manual smoke test: sidebar collapse/expand, nav active states, home hero, category chips, scholar medallions, lecture cards, continue listening, search, library, settings — across all four accent themes and both light/dark modes at desktop and mobile breakpoints.
  - Verify `apps/native` and `packages/` are untouched: `git diff origin/main -- apps/native packages/`
- **Blockers**: Stages 1 and 2 must be complete.
- **Dependencies**: Stages 1 and 2.
- **Completion Criteria**:
  - All web tests pass (600+).
  - Typecheck and lint clean.
  - E2E passes.
  - Manual smoke test passes across all themes and breakpoints.
  - No native or shared-package changes.
- **Suggested Commit Message**:
  ```
  verify(web): sidebar and homepage redesign verified across themes
  ```

# Final Verification

Run in the worktree before pushing:

```bash
bun run build
bun run lint
bun run typecheck
bun run test
bun run test:e2e
```

Plus web-scoped rapid checks:

```bash
bun run --filter web test
bun run --filter web typecheck
bun run --filter web lint
bun run --filter web test:e2e -- e2e/home.e2e.ts
```

Manual smoke: sidebar collapse/expand, nav active states, home hero, category chips, scholar medallions, lecture cards, continue listening, search, library, settings — across all four accent themes and both light/dark modes at desktop (>=901px) and mobile (<=640px). Verify playback, save, progress, and TOC anchor behavior are unchanged.

# Plan Completion

The plan is `Completed` when:

- All three stages are done and committed on `f/web-redesign`.
- Final Verification passes in the worktree.
- `git diff origin/main -- packages/ apps/native` contains no breaking/shared changes.
- This file is moved to `.agents/plans/completed/` with status set to `Completed`.
