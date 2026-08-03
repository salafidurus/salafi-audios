# Metadata

- **Date**: 2026-08-03
- **Status**: In Progress
- **Scope**: Visual redesign of `apps/web` (public client) — new named accent themes (Manuscript / Midnight / Ember) plus a refreshed design language across the whole app surface (chrome, home, search, explore, listing, scholar, library, settings). Web-only. No backend, contract, or shared-package changes that could affect `apps/native`.
- **Summary**: The current web app ships a single light/dark token theme. We are adding three web-only accent palettes that layer on top of the existing CSS-variable token system (`data-accent-theme` attribute), and restyling screens/chrome to the design language of the approved prototype (gold/jade accent work, medallion avatars, sanad-chain progress dots, category chips, hero banner, theme-card picker in Settings). All behavior and data wiring stay identical — this is a presentational redesign expressed through the existing token CSS variables.
- **Dependencies**:
  - The accent-theme system (Stage 1) is the foundation — every later stage builds on it.
  - Screens restyle (Stages 4–5) reuse existing data hooks only (`@sd/domain-content`, `@sd/domain-search`, `@sd/domain-audio`, `@sd/core-contracts`). No new API endpoints.
  - `@sd/design-tokens` and `@sd/core-i18n` are touched **additively only, and preferably not at all** — new palettes live in `apps/web`, so `apps/native` Unistyles themes are unaffected.

# Progress

- Worktree `.worktrees/f-web-redesign` created on branch `f/web-redesign` (tracking `origin/main` at `e3ff5e5c`). `bun install` completed. No gitignored `.env` files exist to copy (only committed `.env.example` files).
- Explored current web implementation and confirmed:
  - Theme infra: `apps/web/src/app/theme-css.ts` emits CSS variables from `lightWebTheme`/`darkWebTheme` (`apps/web/src/core/styles/theme/index.ts` → `createThemeWeb(mode)`). `ThemeSync.tsx` sets `data-theme="light|dark"` and persists `theme-preference:v1`. All components consume tokens via CSS variables — this is what makes a value-only accent layer cheap and safe.
  - Settings appearance section currently offers `system|light|dark` via `SegmentedControl` in `settings-general.screen.tsx`.
  - Home already renders a hero, search bar, and `ContinueListeningCard`. Scholars medallions + category chips + a "recently added" grid do not exist yet, but the data hooks do (`useInfiniteScholarsList`, `useExploreRecentScreen`, `useContinueListening`).
  - Mini player is `position: sticky` inside `.appConsentMain`, already has a top progress bar; restyle only, do not move to `position: fixed`.
- No code changes yet. Immediate next step: Stage 1 (accent-theme foundation, TDD).

# Staging Strategy

Foundational change first (theme layer), then its UI control (settings picker), then the app-wide restyle (chrome/shared, then screens), then verification. Each stage is independently reviewable and committable. Stages 4 and 5 may be split further during execution if they grow too large.

**Working rules for every stage (TDD, per `.agents/rules/tdd-rules.md`):**

- Red → green → refactor → commit. Write the failing spec before the implementation.
- All new UI follows the repo conventions: CSS Modules + design-token CSS variables (never hardcoded colors/spacing/radius), named exports, no `Web`/`DesktopWeb` suffix, unified responsive pattern (`@media (max-width: 640px)` + `useIsDesktop()`), desktop-first.
- **Do not port the prototype's inline styles or `<style>` tag.** The prototype is a visual reference; its hex palettes become values in the web theme layer, its Tailwind utility soup becomes CSS Modules.
- Do not modify shared packages in a breaking way. If `@sd/core-i18n` needs new keys, add them additively (existing fallback-string pattern already covers new copy).
- After each stage, run the web workspace checks: `bun run --filter web test`, `bun run --filter web typecheck`, `bun run --filter web lint`.

---

## Stage 1: Web-only accent theme layer (foundation)

- **Status**: Pending
- **Goal**: Add three named accent palettes (Manuscript / Midnight / Ember) that re-declare the existing CSS color/chrome/accent variables under a new `data-accent-theme` attribute, plus a persisted preference store. `@sd/design-tokens` remains untouched.
- **Files**:
  - `apps/web/src/core/styles/theme/variants.ts` (new) — `AccentThemeId`, palette definitions, `applyAccentVariant(colors, id)` deep-merge.
  - `apps/web/src/core/styles/theme/index.ts` — extend `createThemeWeb(mode, variant = "default")`; keep `lightWebTheme`/`darkWebTheme` exports unchanged.
  - `apps/web/src/core/styles/theme/css.ts` (new) — pure, testable CSS-string builders: `getColorThemeProperties(theme)` (color-bearing props only) and `createAccentThemeCss(id)`.
  - `apps/web/src/app/theme-css.ts` — append accent selectors to the emitted `themeCss`; refactor to reuse the pure builders.
  - `apps/web/src/core/styles/theme/accent-theme.ts` (new) — `ACCENT_THEME_KEY`, `ACCENT_THEME_CHANGE_EVENT`, `getAccentThemePreference()`, `setAccentThemePreference(id)`, `useAccentTheme()`.
  - `apps/web/src/core/styles/ThemeSync.tsx` — also read accent preference and set `data-accent-theme` on `<html>`; keep existing `data-theme` logic intact.
- **Changes**:
  - Variants define color overrides (surface, content, border, action/accent, state, chrome, screen washes, focus ring) expressed as token-group overrides — Manuscript = ink-green/jade + gold leaf, Midnight = indigo + amber, Ember = charcoal + rust. All palettes are self-contained (dark-mood, matching the prototype), so an active accent theme fully supersedes the light/dark mode for color while typography/spacing/radius stay shared.
  - `themeCss` output gains blocks such as `[data-accent-theme="manuscript"] { …color properties… }`. Only color-bearing properties are re-declared to avoid bloat.
  - `ThemeSync` resolves accent + mode independently: `data-theme` (existing) and `data-accent-theme` (new). Default remains `default` → today's behavior byte-for-byte.
- **Blockers**: None currently identified.
- **Dependencies**: None.
- **Completion Criteria**:
  - New specs pass: `css.ts` pure builder emits every color property with non-empty values and no `undefined`/`NaN`; `accent-theme.ts` store persists/dispatches; `ThemeSync` sets/clears `data-accent-theme` from localStorage (jsdom).
  - `bun run --filter web test`, `bun run --filter web typecheck`, `bun run --filter web lint` pass.
  - Manual: adding `data-accent-theme="manuscript"` to `<html>` restyles the running app without layout breakage; removing it restores default.
  - `git diff` on `packages/` shows no changes.
- **Suggested Commit Message**:
  ```
  feat(web): add web-only accent themes (manuscript, midnight, ember)

  Layered on top of the existing design-token CSS variables via a new
  data-accent-theme attribute. No shared-package changes; native is unaffected.
  ```

---

## Stage 2: Settings appearance — accent theme picker

- **Status**: Pending
- **Goal**: Add the prototype's theme-card picker to Settings → Display, alongside the existing `system|light|dark` control. Persists via Stage 1's store.
- **Files**:
  - `apps/web/src/features/settings/components/accent-theme-picker/AccentThemePicker.tsx` (new) + `AccentThemePicker.module.css` (new) + `AccentThemePicker.spec.tsx` (new).
  - `apps/web/src/features/settings/screens/settings-general.screen.tsx` — add a Display row for the picker.
  - `apps/web/src/features/settings/screens/settings-general.screen.spec.tsx` — extend assertions.
- **Changes**:
  - Card list (Manuscript / Midnight / Ember / Default) with live swatch previews, active ring, and checkmark — modeled on the prototype's `ThemeCard`, built with tokens and `@sd/design-tokens`-safe styles.
  - Interaction rule (document in code + copy): when a non-default accent is active it fully defines the palette, so the `system|light|dark` `SegmentedControl` is hidden (a helper note explains the accent supersedes mode). When accent is `default`, the mode control works exactly as today.
  - New copy via i18n fallback strings (existing pattern); optionally add keys to `@sd/core-i18n` additively.
- **Blockers**: Stage 1 must be complete (picker needs the store + attribute).
- **Dependencies**: Stage 1.
- **Completion Criteria**:
  - `AccentThemePicker.spec.tsx` passes (renders cards, marks active, persists on click, dispatches event).
  - `settings-general.screen.spec.tsx` passes with new assertions; existing assertions unchanged.
  - `bun run --filter web test`, `typecheck`, `lint` pass.
  - Manual: switching accent in Settings restyles the whole app live; reload keeps the choice.
- **Suggested Commit Message**:
  ```
  feat(web): add accent theme picker to settings appearance

  Adds manuscript/midnight/ember cards with live preview; accent supersedes
  light/dark mode when active, matching the prototype.
  ```

---

## Stage 3: Chrome + shared design language refresh

- **Status**: Pending
- **Goal**: Apply the new design language to app chrome and shared primitives purely through the token variables and CSS Modules, so every screen inherits the refreshed look.
- **Files** (CSS Modules only; behavior unchanged):
  - `apps/web/src/features/navigation/components/sidebar/*.module.css`, `mobile-header`, `sidebar-drawer` styles.
  - `apps/web/src/features/navigation/components/top-subnav-tabs/top-subnav-tabs.tsx` + styles.
  - `apps/web/src/features/navigation/components/footer/*.module.css`.
  - `apps/web/src/features/audio/components/mini-player.module.css`, `playback-controls.tsx`, `progress-bar.tsx` — gold accent play controls, keep `position: sticky` and the top progress bar layout.
  - Shared primitives: `Button`, `Badge`, `Toggle`, `Dropdown`, `Modal`, `EmptyState`, `ScreenView`, `PageHeader` module CSS where the accent treatment (gold highlight, medallion radii, sanad-chip motifs) applies.
  - `apps/web/src/core/styles/theme/recipes.ts` — if accent recipes need web-side tweaks for the new palettes (e.g. `primaryCta` gold mapping), adjust here, web-only.
- **Changes**:
  - Accent-first treatment: primary CTAs take the accent gold; selection/active states use `--accent-*` tokens; focus rings and screen washes follow the variant.
  - Keep DOM structure, a11y roles, keyboard behavior, and existing spec-asserted semantics identical.
  - Ensure default accent (`data-accent-theme="default"`) renders near-identically to today, so this is a refactor + enhancement, not a regression risk.
- **Blockers**: Stage 1 (tokens exist). Native parity not required — this is web CSS only.
- **Dependencies**: Stage 1.
- **Completion Criteria**:
  - Existing specs for shared components and navigation (e.g. `nav-items.spec.tsx`, `sidebar.desktop.spec.tsx`, `playback-controls.spec.tsx`, `Button.spec.tsx`, `Badge.spec.tsx`) still pass unmodified.
  - `bun run --filter web test`, `typecheck`, `lint` pass.
  - Manual: sidebar, top subnav, footer, and mini player render correctly at desktop (≥901px) and mobile (≤640px) with each accent theme.
- **Suggested Commit Message**:
  ```
  refactor(web): apply accent design language to chrome and shared components
  ```

---

## Stage 4: Home screen redesign

- **Status**: Pending
- **Goal**: Bring the home screen in line with the prototype — accent hero banner, category chips, "Study with a scholar" medallion row, "Recently added" grid — reusing existing data hooks.
- **Files**:
  - `apps/web/src/features/home/screens/home/home.screen.tsx` + `.module.css` + `home.screen.spec.tsx`.
  - `apps/web/src/features/home/components/hero-section/` (restyle: radial pattern + gold leaf motif + "As-Salamu 'alaykum" eyebrow + Resume CTA).
  - `apps/web/src/features/home/components/continue-listening-card/` (restyle; spec already exists).
  - New: `apps/web/src/features/home/components/category-chips/CategoryChips.tsx` + `.module.css` + spec; `apps/web/src/features/home/components/scholar-medallions/ScholarMedallions.tsx` + `.module.css` + spec; optionally `apps/web/src/features/home/components/sanad-chain/SanadChain.tsx` (dot + connector progress motif, promoted to `src/shared/` if reused by listing/library).
  - `apps/web/src/app/(main)/(consent)/page.spec.tsx` — keep passing; extend if structure changes.
- **Changes**:
  - Hero restyled to accent banner: radial dotted pattern, gold leaf ribbon accent, eyebrow label, Resume CTA from `ContinueListeningCard` state.
  - Category chips: horizontal scroll row built from `useTopicsList` (`@sd/domain-search`); selecting a chip filters the Recently Added grid client-side (fallback: navigates to `/search` with the topic) — no new endpoints.
  - Scholar medallion row: `useInfiniteScholarsList` (`@sd/domain-content`), avatar medallions with accent ring, name + lecture count, links to `/scholars/[slug]`.
  - Recently Added grid: `useExploreRecentScreen` (`@sd/domain-content`); `LectureCard`-style cards with sanad-chain progress + accent play button.
  - i18n copy via fallback strings.
- **Blockers**: None new; requires Stage 1 (and optionally Stage 3 for shared primitives).
- **Dependencies**: Stage 1; Stage 3 preferred (shared Button/card treatments).
- **Completion Criteria**:
  - New component specs pass; existing `home.screen.spec.tsx` and `page.spec.tsx` pass (updated only where structure changed).
  - `bun run --filter web test`, `typecheck`, `lint` pass; `bun run --filter web test:e2e -- e2e/home.e2e.ts` passes (update copy assertions only if the E2E references changed text).
  - Manual: home renders at desktop/mobile; chips filter the grid; medallions navigate to scholar detail; continue card resumes playback.
- **Suggested Commit Message**:
  ```
  feat(web): redesign home screen with accent hero, category chips, and scholar row
  ```

---

## Stage 5: Redesign catalog, search, and library screens

- **Status**: Pending
- **Goal**: Extend the design language to the remaining main surfaces — search, explore, listing detail, scholar detail, library — with zero behavior/data changes.
- **Files**:
  - `apps/web/src/features/search/screens/search-processing/search-processing.screen.tsx` + styles + spec — accent result rows, filter chips, empty state; add popular-searches chips (client-side, reuse suggestions copy) to match prototype.
  - `apps/web/src/features/explore/screens/*` — feed cards/rows restyle (specs exist: `curation.screen.spec.tsx`, `explore-scholar.screen.spec.tsx`, `ExploreListRow.spec.tsx`).
  - `apps/web/src/features/listing/screens/listing-detail/listing-detail.screen.tsx` + styles + spec — accent hero/meta panel, content rows with sanad-chain progress, TOC panel restyle.
  - `apps/web/src/features/listing/screens/scholar-detail/scholar-detail.screen.tsx` + styles + spec — medallion header, content list restyle.
  - `apps/web/src/features/library/screens/{library,library-saved,library-completed}.screen.tsx` + styles + specs — accent rows, progress treatment.
  - Shared row/card components touched by the above (`ContentListItem`, `ContentRow`, `LibraryListRow`, `ExploreListRow`, `SearchResultItem`) — styles only.
- **Changes**:
  - Restyle to the accent design language: medallion avatars, gold play buttons, sanad-chain progress dots, accent chip/badge treatments, consistent card surfaces via tokens.
  - Preserve all data fetching, navigation, save/progress/play behavior, RTL handling, and a11y semantics.
  - Update colocated specs only where visual-affecting markup changed (e.g. added chip/medallion elements, changed labels).
- **Blockers**: Stage 4 completion is preferred (shared home components — sanad chain, medallion — may be promoted to `src/shared/` and reused here).
- **Dependencies**: Stage 1; Stages 3–4 preferred.
- **Completion Criteria**:
  - All existing specs under `features/search`, `features/explore`, `features/listing`, `features/library` pass (updated where needed).
  - `bun run --filter web test`, `typecheck`, `lint` pass.
  - Manual: search filters, listing TOC anchors, scholar topics filters, library tabs, save/play/progress all behave as before under every accent theme.
- **Suggested Commit Message**:
  ```
  feat(web): apply accent design language to catalog, search, and library screens
  ```

---

## Stage 6: Verification, docs, and parity checks

- **Status**: Pending
- **Goal**: Full pre-push verification; confirm the native app and shared packages are unaffected; update docs.
- **Files**:
  - `docs/web.md` (web theming/accent themes section, if not already covered).
  - `docs/AGENT.md` only if the web feature table needs a status note.
- **Changes**:
  - Run the full worktree verification suite (see Final Verification).
  - Diff check: `git diff origin/main -- packages/` must show no `@sd/design-tokens` or `@sd/core-i18n` breaking changes (additive-only, or none).
  - Confirm `apps/native` is untouched: `git diff origin/main -- apps/native` empty.
  - Optionally smoke-test that `bun run --filter native test` still passes (it should, since no shared changes).
- **Blockers**: All prior stages must be complete.
- **Dependencies**: Stages 1–5.
- **Completion Criteria**:
  - Full verification suite passes (below).
  - No unexpected diffs in `packages/` or `apps/native`.
  - Branch pushed and PR opened against `origin/main`.
- **Suggested Commit Message**:
  ```
  docs(web): document accent theme system and redesign
  ```

# Final Verification

Run in the worktree before pushing, and confirm failures are not pre-existing:

```bash
bun run build
bun run lint
bun run typecheck
bun run test
bun run test:e2e
bun run doctor
```

Plus web-scoped rapid checks during execution:

```bash
bun run --filter web test
bun run --filter web typecheck
bun run --filter web lint
bun run --filter web test:e2e -- e2e/home.e2e.ts
```

Manual smoke: home, search, listing, scholar, library, settings across desktop (≥901px) and mobile (≤640px), under all four accent settings (default/manuscript/midnight/ember) and both light/dark modes for default. Verify playback, save, progress, and TOC anchor behavior are unchanged.

# Plan Completion

The plan is `Completed` when:

- All six stages are done and committed on `f/web-redesign`.
- Final Verification passes in the worktree.
- `git diff origin/main -- packages/ apps/native` contains no breaking/shared changes affecting other apps.
- PR merged to `origin/main`, then `git checkout main && git pull`, `git worktree remove .worktrees/f-web-redesign`, `git branch -d f/web-redesign`.
- This file is moved to `.agents/plans/completed/` with status set to `Completed`.
