# Metadata

- **Date:** 2026-04-07
- **Status:** Completed
- **Scope:** `packages/design-tokens`, `apps/web/src/app/theme-css.ts`, `apps/web/src/features/*`,
  `apps/mobile/src/features/*`, `apps/web/src/core/styles/unistyles.ts`,
  `apps/mobile/src/core/styles/unistyles.ts`, `apps/web/src/shared/`, `apps/mobile/src/shared/`
- **Summary:** Finish and normalise the cross-platform theme system. `packages/design-tokens`
  is the single source of truth for accent recipes. `apps/web/src/app/theme-css.ts` becomes a
  pure projector — it reads recipe values and writes CSS custom properties, computing nothing.
  Native consumes the same recipe objects through Unistyles themes. Feature code inside
  `apps/web/src/features/` and `apps/mobile/src/features/` uses the theme system consistently
  instead of ad hoc color treatments.
- **Dependencies:**
  - `packages/design-tokens` must be built before web/mobile apps consume updated types
  - Unistyles bootstrap already wired in `apps/web/src/core/styles/unistyles.ts` and
    `apps/mobile/src/core/styles/unistyles.ts`

---

# Progress

## Done

- `packages/design-tokens/src/recipes/shared.ts` — implemented
- `packages/design-tokens/src/recipes/web.ts` — implemented
- `packages/design-tokens/src/recipes/native.ts` — implemented
- `packages/design-tokens/src/theme/web.ts` — exists with recipe projections
- `packages/design-tokens/src/theme/native.ts` — exists with recipe projections
- `AccentGradientFill` web + native — in `apps/web/src/shared/` and `apps/mobile/src/shared/`
- Button primary variant web + native — in `apps/web/src/shared/` and `apps/mobile/src/shared/`
- `apps/web/src/core/styles/unistyles.ts` — Unistyles bootstrap for web
- `apps/mobile/src/core/styles/unistyles.ts` — Unistyles bootstrap for mobile
- `packages/design-tokens/src/index.web.ts` — exports `createAccentRecipesWeb` ✅
- `packages/design-tokens/src/index.native.ts` — exports `createAccentRecipesNative` ✅
- `apps/web/src/app/theme-css.ts` — pure projector, all recipe CSS vars emitted ✅
- Feature color audit complete — all ad hoc hex/rgba replaced with CSS vars / theme tokens ✅

## Blocked / Uncertain

- None.

## Immediate Next Step

Plan complete — all stages Done. File moved to `.agents/plans/completed/`.

---

# Design Standards

## Confirmed Decisions

- **No `expo-linear-gradient` migration.** Existing directional fills remain as-is.
- **SVG-based radial glow approved** — use `react-native-svg` for static radial overlay on native.
  Rules: static, low-opacity, ≤ 3 stops, no `fx`/`fy` (Android limitation).

## Color Role Standards

- `primary` — prominent actions, active states, strong emphasis
- `secondary` — supporting emphasis, chips, informational accents, balance
- `neutral` — foundation for canvases, dense content, forms, resting UI

## Gradient Standards

- Radial and layered gradient treatments are part of the accent language.
- Promoted surfaces may use stronger branded treatment.
- Standard surfaces remain neutral or subtle.
- One screen must not accumulate multiple competing promoted surfaces above the fold.

## Usage Constraints (all screens, all platforms)

- Max 1 promoted gradient surface per screen above the fold
- Max 2 secondary accent zones per screen
- Never stack multiple promoted gradients in the same viewport section
- Dense form shells, long text content, and list-heavy screens degrade to subtle fills

## Accessibility Standards

- Color must not be the only signal for state.
- Selected, focused, destructive, success, and disabled states need supporting cues (border,
  icon, shape, or label).
- Light and dark mode behavior must be reviewed independently.

## Semantic Recipe Names

```
accent.primary.cta               — prominent actions, elevated surfaces
accent.primary.ctaHover
accent.primary.ctaActive
accent.primary.subtleSurface     — active nav item, selected chip background
accent.primary.focusRing
accent.secondary.subtleSurface   — chips, badges, informational panels
accent.secondary.supportingBadge — NEW: badge fills on secondary surfaces
accent.mixed.heroSurface         — screen hero zones (auth, profile header)
accent.mixed.promotedPanel       — NEW: featured cards, promoted content zones
accent.selected.surface          — NEW: selected item background
accent.selected.content          — NEW: selected item foreground
accent.divider                   — branded rule/separator
chrome.surface                   — semi-transparent chrome fill
chrome.surfaceStrong             — stronger chrome fill
chrome.border                    — chrome edge
chrome.borderStrong              — stronger chrome edge
hover.accentSurface              — hover state on accent surfaces
screen.washPrimary               — full-screen primary wash (projected from recipe)
screen.washSecondary             — full-screen secondary wash
screen.washMixed                 — full-screen mixed wash
```

## Package Boundary Conventions

- `packages/design-tokens` — token and recipe semantics (single source of truth)
- `apps/web/src/core/styles/unistyles.ts` — web Unistyles bootstrap
- `apps/mobile/src/core/styles/unistyles.ts` — mobile Unistyles bootstrap
- `apps/web/src/app/theme-css.ts` — projects recipe values to CSS custom properties (no logic)
- `apps/web/src/shared/` — reusable recipe-aware web primitives
- `apps/mobile/src/shared/` — reusable recipe-aware native primitives
- Feature code in `apps/web/src/features/` and `apps/mobile/src/features/` composes from
  shared primitives — does not define its own color systems

---

# Staging Strategy

1. **Stage 1** — Add missing recipes to `packages/design-tokens`
2. **Stage 2** — Export recipe types from `packages/design-tokens` index files
3. **Stage 3** — Refactor `apps/web/src/app/theme-css.ts` to project from recipes
4. **Stage 4** — Audit and update feature usage in `apps/web/src/features/` and
   `apps/mobile/src/features/`
5. **Stage 5** — Final verification

---

## Stage 1: Add Missing Recipes to design-tokens

**Status:** Done

**Goal:** Add the four missing semantic recipes — `selectedSurface`, `selectedContent`,
`secondarySupportingBadge`, and `mixedPromotedPanel` — to the existing recipe files in
`packages/design-tokens/src/recipes/`.

**Files:**

- `packages/design-tokens/src/recipes/shared.ts`
- `packages/design-tokens/src/recipes/web.ts`
- `packages/design-tokens/src/recipes/native.ts`

**Changes:**

- In `shared.ts`: add recipe definitions for `selectedSurface`, `selectedContent`,
  `secondarySupportingBadge`, and `mixedPromotedPanel` following the existing recipe pattern.
- In `web.ts`: project each new recipe to CSS-ready output fields (`background`, `borderColor`,
  `textColor`, `shadow`, `radial`, `linear` as appropriate).
- In `native.ts`: project each new recipe to composition-ready output fields (`baseColorToken`,
  `borderColorToken`, `linearGradient`, `radialGlow` as appropriate).

**Blockers:** None currently identified.

**Dependencies:** None — foundational change.

**Completion Criteria:**

- `pnpm --filter design-tokens typecheck` passes with no errors.
- All four new recipe names are exported from `packages/design-tokens/src/recipes/web.ts` and
  `packages/design-tokens/src/recipes/native.ts`.

**Suggested Commit Message:**

```
feat(design-tokens): add selectedSurface, selectedContent, secondarySupportingBadge,
mixedPromotedPanel recipes

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

---

## Stage 2: Export Recipe Types from design-tokens Index Files

**Status:** Done

**Goal:** Ensure `packages/design-tokens/src/index.native.ts` and `index.web.ts` export the
recipe types so consuming packages can import them without drilling into internal paths.

**Files:**

- `packages/design-tokens/src/index.web.ts`
- `packages/design-tokens/src/index.native.ts`

**Changes:**

- In `index.web.ts`: add named exports for all web recipe types and the recipe object itself.
- In `index.native.ts`: add named exports for all native recipe types and the recipe object.
- Verify that `theme/web.ts` and `theme/native.ts` recipe projections are accessible via the
  exported theme type (so `useUnistyles().theme.recipes.*` is fully typed).

**Blockers:** Depends on Stage 1 (new recipes must exist before they can be exported).

**Dependencies:** Stage 1 complete.

**Completion Criteria:**

- `pnpm --filter design-tokens typecheck` passes.
- A consuming package can import recipe types from `@sd/design-tokens` without internal paths.
- `pnpm --filter web typecheck` and `pnpm --filter mobile typecheck` pass.

**Suggested Commit Message:**

```
feat(design-tokens): export recipe types from index.web.ts and index.native.ts

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

---

## Stage 3: Refactor theme-css.ts to Project from Design-Token Recipes

**Status:** Done

**Goal:** Remove all local color computations from `apps/web/src/app/theme-css.ts`. The file
becomes a pure projector: it imports recipe values from `@sd/design-tokens` and writes CSS
custom properties. It computes nothing.

**Files:**

- `apps/web/src/app/theme-css.ts`

**Changes:**

- Remove all local computations for `chromeSurface`, `chromeSurfaceStrong`, `chromeBorder`,
  `chromeBorderStrong`, `hoverAccentSurface`, `screenWashPrimary`, `screenWashSecondary`,
  `screenWashMixed` — these must instead be projected from the design-token recipe objects.
- Import the appropriate web recipe object from `@sd/design-tokens`.
- For each CSS custom property, read the value directly from the recipe projection and write
  it as a CSS variable. No intermediate computation.
- Verify `--screen-wash-primary` still works correctly on the auth page and search home after
  the change.

**Blockers:** Depends on Stage 2 (recipe types must be exported before they can be imported).

**Dependencies:** Stage 2 complete.

**Completion Criteria:**

- `apps/web/src/app/theme-css.ts` contains no inline color formulas or gradient computations.
- `pnpm --filter web typecheck` passes.
- `pnpm dev:web` — auth page and search home render without visual regressions in light and
  dark mode.

**Suggested Commit Message:**

```
refactor(web): make theme-css.ts a pure projector — remove all local color computations

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

---

## Stage 4: Audit and Update Feature Usage

**Status:** Done

**Goal:** Audit all feature code in `apps/web/src/features/` and `apps/mobile/src/features/`
for ad hoc color treatments that should instead use the theme system. Update any violations.

**Files:**

- `apps/web/src/features/navigation/` — all relevant component files
- `apps/web/src/features/account/` — all relevant component files
- `apps/web/src/features/library/` — all relevant component files
- `apps/web/src/features/live/` — all relevant component files
- `apps/web/src/features/lecture/` — all relevant component files
- `apps/web/src/features/scholar/` — all relevant component files
- `apps/mobile/src/features/navigation/` — all relevant component files
- `apps/mobile/src/features/account/` — all relevant component files
- `apps/mobile/src/features/library/` — all relevant component files
- `apps/mobile/src/features/live/` — all relevant component files
- `apps/mobile/src/features/lecture/` — all relevant component files
- `apps/mobile/src/features/scholar/` — all relevant component files

**Changes:**

- Replace any hardcoded hex/rgba colors that should be semantic recipe values with the
  appropriate CSS variable reference (web) or `useUnistyles().theme.recipes.*` lookup (native).
- Replace any local gradient definitions with shared primitives from `apps/web/src/shared/`
  or `apps/mobile/src/shared/` (e.g. `AccentGradientFill`, future `AccentPanel`).
- Features must not define their own color systems — they compose from shared primitives.

**Blockers:** Depends on Stage 3 (theme-css.ts must be the projector before features align to
it). This stage should be executed after Stage 3 is committed.

**Dependencies:** Stage 3 complete.

**Completion Criteria:**

- `grep -r "rgba\|#[0-9a-fA-F]\{3,6\}" apps/web/src/features apps/mobile/src/features` returns
  only intentional exceptions (if any), none that override semantic recipe slots.
- `pnpm --filter web typecheck` and `pnpm --filter mobile typecheck` pass.
- `pnpm lint` passes with no new violations.

**Suggested Commit Message:**

```
refactor(features): replace ad hoc color treatments with design-token recipe values

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

---

## Stage 5: Final Verification

**Status:** Done

**Goal:** Run all validation commands across the full monorepo and confirm no regressions.

**Files:** No file changes — verification only.

**Changes:** None.

**Blockers:** Depends on Stage 4 complete.

**Dependencies:** Stages 1–4 complete.

**Completion Criteria:**

- `pnpm typecheck` passes across all workspaces.
- `pnpm test` passes with no regressions.
- `pnpm lint` passes with no new violations.
- `pnpm build` succeeds for `packages/design-tokens`, `apps/web`, `apps/mobile`.
- `pnpm dev:web` — visual smoke: auth page, search home, nav active state all render correctly
  in light and dark mode.
- `pnpm dev:mobile` — visual smoke: no visual regressions on any native screen.
- No remaining references to `@sd/core-styles`, `@sd/shared` (dissolved), `packages/shared`,
  `feature-navigation` (as a package), or `feature-account` (as a package) in source files.

**Suggested Commit Message:**

```
chore: final verification pass — cross-platform UI color integration complete

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

---

# Final Verification

After Stage 5 is complete, confirm all of the following:

- `pnpm typecheck` — passes across all workspaces
- `pnpm test` — passes with no regressions
- `pnpm lint` — passes with no new violations
- `pnpm build` — succeeds for `packages/design-tokens`, `apps/web`, `apps/mobile`
- Visual smoke test: auth page, search home, nav active states, accent surfaces — light + dark
- No `@sd/core-styles`, dissolved `@sd/shared`, or dissolved feature package imports in source

---

# Plan Completion

This plan is `Completed` when:

1. All five stages are marked `Done`.
2. The Final Verification section passes in full.
3. `packages/design-tokens` is the single source of truth for all recipe semantics.
4. `apps/web/src/app/theme-css.ts` is a pure projector with no local color computations.
5. All feature code in `apps/web/src/features/` and `apps/mobile/src/features/` uses the
   theme system consistently.

On completion, move this file to `.agents/plans/completed/` and update status to `Completed`.
