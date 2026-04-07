# Cross-Platform UI Color Integration Plan

## Goal

Finish and normalize the broader cross-platform theme system so that:

1. `@sd/design-tokens` remains the single source of truth for theme semantics and accent recipes,
2. web projects theme and recipe outputs into CSS variables without app-local theme logic,
3. native consumes the same logical theme model through Unistyles themes,
4. `@sd/core-styles` remains the stable styling bridge between design tokens and app/package consumption,
5. package entrypoints expose the theme types and surfaces that downstream packages actually need,
6. shared primitives and feature packages use the theme system consistently instead of ad hoc color treatments.

This plan updates the existing file in place to reflect the current repo state as of 2026-04-07.

## Scope

This merged plan now covers both:

1. the original accent/color integration intent, and
2. the broader cross-platform theme-system surface that now spans `@sd/design-tokens`, `@sd/core-styles`, web CSS projection, shared primitives, and package entrypoints.

It is intentionally wider than a color-only plan because the current repo architecture couples those concerns in practice.

## Design Standards

### Color role standards

- `primary` is for prominent actions, active states, and strong emphasis
- `secondary` is for supporting emphasis, chips, informational accents, and balance
- `neutral` remains the foundation for canvases, dense content, forms, and resting UI

### Gradient standards

- radial and layered gradient treatments are part of the accent language
- promoted surfaces may use stronger branded treatment
- standard surfaces should remain neutral or subtle
- one screen should not accumulate multiple competing promoted surfaces above the fold

### Accessibility standards

- color must not be the only signal for state
- selected, focused, destructive, success, and disabled states need supporting cues such as border, icon, shape, or label
- light and dark mode behavior must be reviewed independently

## External Guidance And Repo Fit

This plan is repo-specific, but the direction is also consistent with broader platform guidance:

- Material-style systems reserve primary for key actions and active emphasis
- Apple-style guidance favors hierarchy, restraint, and not relying on color alone
- React Native and web rendering constraints make it important to keep the semantic system shared while allowing platform-specific output shapes

For this repo, the correct implementation boundary remains:

- `@sd/design-tokens` owns token and recipe semantics
- `@sd/core-styles` owns styling bridge/bootstrap responsibilities
- web app code projects theme values into CSS variables
- `@sd/shared` owns reusable recipe-aware primitives
- feature packages compose surfaces without inventing their own color systems

## Current State

### What already exists

The foundational recipe and theme system is present.

Implemented areas:

- [`packages/design-tokens/src/recipes/shared.ts`](C:/dev/salafi-audios/packages/design-tokens/src/recipes/shared.ts)
- [`packages/design-tokens/src/recipes/web.ts`](C:/dev/salafi-audios/packages/design-tokens/src/recipes/web.ts)
- [`packages/design-tokens/src/recipes/native.ts`](C:/dev/salafi-audios/packages/design-tokens/src/recipes/native.ts)
- [`packages/design-tokens/src/theme/web.ts`](C:/dev/salafi-audios/packages/design-tokens/src/theme/web.ts)
- [`packages/design-tokens/src/theme/native.ts`](C:/dev/salafi-audios/packages/design-tokens/src/theme/native.ts)
- [`packages/core-styles`](C:/dev/salafi-audios/packages/core-styles)
- [`packages/shared/src/components/AccentGradientFill/AccentGradientFill.web.tsx`](C:/dev/salafi-audios/packages/shared/src/components/AccentGradientFill/AccentGradientFill.web.tsx)
- [`packages/shared/src/components/AccentGradientFill/AccentGradientFill.native.tsx`](C:/dev/salafi-audios/packages/shared/src/components/AccentGradientFill/AccentGradientFill.native.tsx)
- [`packages/shared/src/components/Button/Button.web.tsx`](C:/dev/salafi-audios/packages/shared/src/components/Button/Button.web.tsx)
- [`packages/shared/src/components/Button/Button.native.tsx`](C:/dev/salafi-audios/packages/shared/src/components/Button/Button.native.tsx)

Observed implemented theme/recipe base:

- `primaryCta`
- `primarySubtleSurface`
- `secondarySubtleSurface`
- `mixedHeroSurface`
- `dividerColor`
- `focusRingColor`

Observed implemented theme infrastructure:

- web themes exported from `@sd/design-tokens`
- native themes exported from `@sd/design-tokens`
- Unistyles bootstrap owned by `@sd/core-styles`
- web CSS projection owned by `apps/web/src/app/theme-css.ts`
- shared components consuming theme values through `@sd/shared`

Observed rollout areas already using accent-related primitives:

- `feature-auth`
- `feature-search`

### What is still misaligned

The current system is only partially normalized.

Main architecture gaps:

- [`apps/web/src/app/theme-css.ts`](C:/dev/salafi-audios/apps/web/src/app/theme-css.ts) still computes several chrome and screen-wash values locally instead of projecting them from recipe output.
- theme projection responsibility is split across `@sd/design-tokens`, `@sd/core-styles`, and web app code, but the current plan did not previously treat that split as first-class scope.

Concrete local computations still in app code:

- `chromeSurface`
- `chromeSurfaceStrong`
- `chromeBorder`
- `chromeBorderStrong`
- `hoverAccentSurface`
- `screenWashPrimary`
- `screenWashSecondary`
- `screenWashMixed`

Main recipe-model gaps:

- `selectedSurface`
- `selectedContent`
- `secondarySupportingBadge`
- `mixedPromotedPanel`

Main package-surface gaps:

- [`packages/design-tokens/src/index.native.ts`](C:/dev/salafi-audios/packages/design-tokens/src/index.native.ts) does not export recipe types
- [`packages/design-tokens/src/index.web.ts`](C:/dev/salafi-audios/packages/design-tokens/src/index.web.ts) also lacks explicit recipe type exports
- the current plan does not account for `@sd/core-styles` as a theme-distribution layer that also needs review when the theme surface changes

Main rollout gaps:

- `feature-navigation`
- `feature-account`
- `feature-legal`
- `feature-library`
- `feature-live`
- `feature-lecture`
- `feature-scholar`
- selected shared states such as auth-required and empty-state surfaces

## Confirmed Decisions

### Native gradient implementation

The native implementation uses `react-native-svg` for both linear and radial layers inside a single SVG surface.

Current source:

- [`packages/shared/src/components/AccentGradientFill/AccentGradientFill.native.tsx`](C:/dev/salafi-audios/packages/shared/src/components/AccentGradientFill/AccentGradientFill.native.tsx)

This is now the approved implementation.

Implications:

- no migration to `expo-linear-gradient` is planned,
- recipe shapes should continue to support the existing SVG-based layering model,
- any future convenience wrapper must map cleanly onto this implementation.

### Restraint model

This plan keeps the original restraint intent:

- strong promoted accent treatment should be limited to the most important surface in a viewport
- supporting accent treatment should remain subordinate to primary actions
- list-heavy, text-heavy, and form-heavy screens should prefer subtle surfaces over decorative emphasis

## Desired End State

### Architecture

- All accent/chrome/screen-wash semantics are defined in `@sd/design-tokens`.
- Theme projection responsibilities are explicit across `@sd/design-tokens`, `@sd/core-styles`, and app-level projection files.
- Web theme projection in `theme-css.ts` becomes reference-only.
- Native and web consume the same logical theme model, with platform-specific output types where needed.

### Package surface

- `@sd/design-tokens` exports recipe types from package entrypoints.
- `@sd/design-tokens` and `@sd/core-styles` expose a coherent theme surface for downstream packages.
- `@sd/shared` exposes one ergonomic recipe-aware gradient primitive for consumers that should not manually unpack gradient fields.

### Feature usage

- high-visibility UI surfaces use recipes intentionally,
- active/selected states are standardized,
- screens do not invent local accent logic,
- features use accent emphasis with restraint instead of applying branded treatment everywhere.

### Validation

- recipe outputs are covered by tests,
- accessibility checks are explicit,
- there is a visual review surface for light and dark mode on web and mobile.

## Non-Negotiable Architecture

- Base tokens and semantic recipes live in `@sd/design-tokens`.
- Theme bridging and styling bootstrap live in `@sd/core-styles`.
- `apps/web/src/app/theme-css.ts` must only project theme values, not invent recipe logic.
- Native consumes recipe data from the Unistyles theme.
- `@sd/shared` owns reusable accent-capable primitives.
- Feature packages compose recipe-aware screens; they do not define independent color systems.

## Workstreams

## Workstream 1: Move Web Chrome And Screen-Wash Values Into Recipe Output

### Objective

Remove app-local web color computation from [`theme-css.ts`](C:/dev/salafi-audios/apps/web/src/app/theme-css.ts).

### Current issue

The file still performs color mixing and gradient construction directly. That is the largest remaining architecture violation in the current system.

### Plan

Add web-specific recipe output for:

- `screen.washPrimary`
- `screen.washSecondary`
- `screen.washMixed`
- `chrome.surface`
- `chrome.surfaceStrong`
- `chrome.border`
- `chrome.borderStrong`
- `chrome.hoverAccentSurface`

### Files to update

- [`packages/design-tokens/src/recipes/web.ts`](C:/dev/salafi-audios/packages/design-tokens/src/recipes/web.ts)
- [`packages/design-tokens/src/recipes/shared.ts`](C:/dev/salafi-audios/packages/design-tokens/src/recipes/shared.ts) if shared typing needs extension
- [`apps/web/src/app/theme-css.ts`](C:/dev/salafi-audios/apps/web/src/app/theme-css.ts)

### Notes

- These values are web-only in rendering form, but they still belong to the recipe layer.
- Shared typing should not force native to pretend it has screen-wash concepts if they are strictly web projection outputs.

### Validation

- `pnpm --filter @sd/design-tokens typecheck`
- `pnpm --filter web typecheck`
- `pnpm --filter web build`

## Workstream 2: Review Theme Surface Boundaries Across Design Tokens, Core Styles, And Web Projection

### Objective

Treat the broader theme system as an explicit architecture concern instead of limiting the plan to accent recipes.

### Current issue

The repo currently relies on three separate layers for theme delivery:

- `@sd/design-tokens` defines the theme and recipe data,
- `@sd/core-styles` bridges that data into Unistyles and web styling setup,
- `apps/web/src/app/theme-css.ts` projects theme values into CSS variables.

The previous version of this plan focused mainly on recipe additions and did not explicitly account for this split.

### Plan

Review and document the intended responsibility of each layer:

- what belongs in `@sd/design-tokens`
- what belongs in `@sd/core-styles`
- what remains acceptable in app-level projection code

### Files to review or update if implementation is needed later

- [`packages/design-tokens/src/theme/web.ts`](C:/dev/salafi-audios/packages/design-tokens/src/theme/web.ts)
- [`packages/design-tokens/src/theme/native.ts`](C:/dev/salafi-audios/packages/design-tokens/src/theme/native.ts)
- [`packages/core-styles/src/index.web.ts`](C:/dev/salafi-audios/packages/core-styles/src/index.web.ts)
- [`packages/core-styles/src/index.native.ts`](C:/dev/salafi-audios/packages/core-styles/src/index.native.ts)
- [`packages/core-styles/src/utils/unistyles.web.ts`](C:/dev/salafi-audios/packages/core-styles/src/utils/unistyles.web.ts)
- [`apps/web/src/app/theme-css.ts`](C:/dev/salafi-audios/apps/web/src/app/theme-css.ts)

### Validation

- no theme logic is duplicated across layers without an intentional reason
- package responsibilities are clear enough to document and maintain

## Workstream 3: Expand The Recipe Model

### Objective

Add the missing semantic surfaces needed by current feature packages.

### Missing recipes

- `selectedSurface`
- `selectedContent`
- `secondarySupportingBadge`
- `mixedPromotedPanel`

### Why these matter now

- `feature-navigation` needs standardized selected-state treatment
- informational panels and restrained promotional containers need something between neutral panels and `mixedHeroSurface`
- badge and chip treatments should not be improvised per feature

### Files to update

- [`packages/design-tokens/src/recipes/shared.ts`](C:/dev/salafi-audios/packages/design-tokens/src/recipes/shared.ts)
- [`packages/design-tokens/src/recipes/web.ts`](C:/dev/salafi-audios/packages/design-tokens/src/recipes/web.ts)
- [`packages/design-tokens/src/recipes/native.ts`](C:/dev/salafi-audios/packages/design-tokens/src/recipes/native.ts)
- [`apps/web/src/app/theme-css.ts`](C:/dev/salafi-audios/apps/web/src/app/theme-css.ts)

### CSS variables likely needed

- `--accent-selected-surface`
- `--accent-selected-content`
- `--accent-secondary-badge-surface`
- `--accent-secondary-badge-border`
- `--accent-secondary-badge-fg`
- `--accent-mixed-panel-surface`
- `--accent-mixed-panel-border`

### Validation

- `pnpm --filter @sd/design-tokens typecheck`
- `pnpm --filter web typecheck`

## Workstream 4: Export Theme And Recipe Types From Package Entrypoints

### Objective

Make theme and recipe typing available from package entrypoints instead of forcing internal-file imports.

### Current issue

Current files:

- [`packages/design-tokens/src/index.native.ts`](C:/dev/salafi-audios/packages/design-tokens/src/index.native.ts)
- [`packages/design-tokens/src/index.web.ts`](C:/dev/salafi-audios/packages/design-tokens/src/index.web.ts)

They export themes and typography types, but not recipe types.

This workstream should also verify whether any `@sd/core-styles` entrypoint types need to be made more explicit for downstream consumers.

### Plan

Export the relevant recipe types from both entrypoints for parity.

### Candidate exports from `@sd/design-tokens`

- `AccentRecipesShared`
- `AccentRecipesNative`
- `AccentRecipesWeb`
- `AccentPrimaryCtaRecipe`
- `AccentSurfaceRecipe`
- supporting web-only recipe type shapes if added in Workstream 1

### Additional review target

- confirm whether `@sd/core-styles` should re-export any stable theme-facing types, or whether all theme typing should remain sourced from `@sd/design-tokens`

### Validation

- `pnpm --filter @sd/design-tokens typecheck`

## Workstream 5: Add A Recipe-Aware Shared Gradient Wrapper

### Objective

Reduce repetitive unpacking of recipe fields in feature packages.

### Current issue

Consumers still have to manually pass `linear.*` and `radial.*` values to `AccentGradientFill`.

### Plan

Add a convenience wrapper such as `AccentGradientFillFromRecipe` inside `@sd/shared`.

### Files to update

- create `packages/shared/src/components/AccentGradientFill/AccentGradientFillFromRecipe.tsx`
- update [`packages/shared/src/index.web.ts`](C:/dev/salafi-audios/packages/shared/src/index.web.ts)
- update [`packages/shared/src/index.native.ts`](C:/dev/salafi-audios/packages/shared/src/index.native.ts)

### Scope

The wrapper should accept `AccentPrimaryCtaRecipe | AccentSurfaceRecipe` and map them to the existing primitive without changing the underlying primitive API.

### Additional consideration

If the wrapper is added, it should support the current native SVG-based implementation cleanly and not assume a future switch to another gradient primitive.

### Validation

- `pnpm --filter @sd/shared typecheck`
- targeted feature package typechecks for migrated consumers

## Workstream 6: Add A Visual Review Harness

### Objective

Create a stable manual review surface for recipe behavior in light and dark mode.

### Web surface

Proposed route:

- `apps/web/src/app/(main)/design/recipes/page.tsx`

Requirements:

- development-only behavior
- renders current and newly added recipes
- shows text, borders, hover-capable states, and disabled states
- should make it obvious when a surface is intended as CTA, subtle support, selected state, or promoted panel

### Mobile surface

Proposed route:

- `apps/mobile/src/app/design/recipes.tsx`

Requirements:

- development-only behavior
- renders the same recipe families
- uses current native theme consumption path
- should make light and dark review equally straightforward

### Validation

- web route renders in development
- mobile screen renders in development
- light and dark mode can both be reviewed intentionally

## Workstream 7: Roll Out Theme And Recipe Usage To Current Feature Surfaces

### Objective

Audit and complete adoption on the current repo surface, not the older subset.

### Immediate rollout targets

- `feature-navigation`
- `feature-library`
- `feature-scholar`
- `feature-lecture`
- `feature-account`
- `feature-legal`
- `feature-live`
- selected shared empty/auth-required states

### Focus by area

`feature-navigation`

- active sidebar state
- active tab indicator
- subsection selection states

`feature-library`

- empty states
- saved/completed affordances if they currently rely on neutral-only treatment

`feature-scholar`

- hero/header strip
- promoted contextual surfaces if needed

`feature-lecture`

- primary listening or save actions
- contextual metadata surfaces where promoted treatment is appropriate

`feature-account`

- account entry surfaces
- profile/status sections where selected or supporting-badge styles are useful

`feature-legal`

- likely lower priority for accents, but should still be audited to confirm neutral treatment is intentional

`feature-live`

- active/scheduled/ended states may benefit from recipe-backed promotional or selected treatments

### Rule

Do not force accent usage where neutral treatment is the better UX. This is an audit and normalization pass, not a blanket recoloring exercise.

### Screen intent guidance

Auth:

- strong primary emphasis belongs on the main submit path
- secondary or mixed surfaces can support the shell, but should not compete with the CTA

Search:

- selected chips, entry points, and promoted discovery affordances can use accent recipes
- results-heavy surfaces should stay mostly neutral

Navigation:

- active state should be branded
- navigation shell should remain mostly neutral

Empty and informational states:

- one promoted action zone is acceptable
- supporting panels should use subtle or mixed restrained treatment

Legal and dense reading screens:

- default assumption is neutral-first unless there is a clear UX reason for accent treatment

## Workstream 8: Accessibility Verification

### Objective

Ensure accent adoption does not reduce usability.

### Checklist

- selected and focused states have a non-color cue where needed
- CTA foreground/background contrast is verified in light mode
- CTA foreground/background contrast is verified in dark mode
- focus ring treatment remains visible and consistent
- promoted gradient usage stays visually restrained

### Validation surface

Use the review harness from Workstream 5 plus targeted spot checks in feature screens.

### Additional checks

- selected states still read clearly in monochrome or reduced-color conditions
- focus treatment is not visually lost against promoted surfaces

## Workstream 9: Theme And Recipe Layer Tests

### Objective

Add explicit regression coverage for the theme and recipe layer.

### Proposed test file

- `packages/design-tokens/src/recipes/recipes.spec.ts`

### Coverage targets

- web recipe creation returns all expected fields
- native recipe creation returns all expected fields
- theme entrypoint exports remain valid for both web and native consumption
- web theme projection continues to receive all expected values
- `primaryCta` web backgrounds differ across rest/hover/active
- native gradient payloads are structurally valid
- light and dark themes differ meaningfully
- screen/chrome recipe outputs from Workstream 1 are defined
- selected and promoted-panel recipes from Workstream 2 are defined
- review-harness-facing recipe families remain structurally complete

### Notes

- This plan should reference the current dated test plan file if cross-linking is needed:
  - [`2026-04-07-test-plan.md`](C:/dev/salafi-audios/.agents/plans/2026-04-07-test-plan.md)

## Recommended Execution Order

1. Workstream 1: move web-local chrome/screen-wash logic into recipes
2. Workstream 2: review broader theme-surface boundaries across design-tokens, core-styles, and web projection
3. Workstream 3: add missing recipe semantics
4. Workstream 4: export theme and recipe types
5. Workstream 5: add the shared recipe-aware wrapper
6. Workstream 9: add theme/recipe tests in parallel with 1 through 4
7. Workstream 6: add the review harness
8. Workstream 7: complete feature rollout audit
9. Workstream 8: accessibility verification before final signoff

## Review Surface Expectations

Before implementation is considered complete, the merged system should be reviewable at three levels:

1. token/recipe level
2. shared primitive level
3. screen-composition level

That means this plan is not complete if the recipe model exists only in code but cannot be inspected coherently in a dedicated review surface.

## Validation Criteria

The plan is complete when:

1. `theme-css.ts` no longer computes accent/chrome/screen-wash recipe logic locally
2. theme-surface responsibilities between `@sd/design-tokens`, `@sd/core-styles`, and web projection are clear and stable
3. recipe gaps required by current feature surfaces are closed
4. theme and recipe types are exported from the right package entrypoints
5. shared consumers have an ergonomic recipe-aware gradient API
6. theme/recipe tests exist
7. a visual review harness exists on web and mobile
8. current feature packages have been audited and intentionally updated or intentionally left neutral
9. the resulting system is understandable as a theme-system boundary, not just a collection of accent values

## Risks

1. Over-expanding recipe or theme types can create a bloated semantic surface that features do not actually need
2. Blurring the boundary between `@sd/design-tokens` and `@sd/core-styles` can make theme ownership less clear
3. Forcing screen-wash concepts into shared native typing may weaken the platform model
4. Broad rollout without a review harness may produce inconsistent visual treatment
5. Accent adoption without accessibility checks may create contrast regressions
6. Treating all packages as accent candidates may lead to decorative overuse instead of intentional hierarchy

## Non-Goals

- This plan does not change the base token categories in `@sd/design-tokens`
- This plan does not replace the underlying `AccentGradientFill` primitive API
- This plan does not require every screen to use accent recipes
- This plan does not attempt a full visual redesign of the product
- This plan does not reopen unrelated token categories unless they are directly needed to stabilize the theme system surface
