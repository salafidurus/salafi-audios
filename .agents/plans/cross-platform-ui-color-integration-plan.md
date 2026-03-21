# Cross-Platform UI Color Integration Plan

## Goal

Integrate the product's primary and secondary colors into the UI across desktop web, mobile web, and native mobile without reducing clarity, accessibility, or platform fit.

The current issue is not isolated to one button. Most screens lean almost entirely on white, black, and neutral surfaces, so the product palette is not doing enough work in visual hierarchy, emphasis, focus states, or brand recognition.

This plan defines how to introduce color systematically rather than through one-off overrides.

## Core Principles

- Keep the base UI readable and calm. Neutral surfaces remain the default foundation.
- Use primary color for main actions, active states, and promoted emphasis.
- Use secondary color as a supporting accent, not a competing CTA color.
- Use radial and linear gradients as a deliberate part of the brand language, especially on promoted surfaces and primary actions.
- Favor radial-led compositions for visual warmth and depth, with linear gradients as structural support rather than the only effect.
- Prefer subtle tinted surfaces and borders over large saturated fills.
- Keep Apple and Google provider buttons brand-authentic.
- Encode reusable patterns in theme tokens and shared components before touching many screens.
- Preserve parity in intent across desktop web, mobile web, and native mobile even if the exact implementation differs by platform.

## Gradient Direction

Gradients should be treated as a first-class visual pattern in the system, not as an isolated button effect.

### Preferred gradient language

- radial gradients provide the most distinctive and appealing branded feel
- linear gradients provide directional structure and help anchor the composition
- the strongest branded surfaces should usually combine both:
  - a radial highlight or glow layer
  - a linear base gradient underneath

### Where gradients should appear

- primary CTAs
- promoted cards and hero panels
- highlighted empty and error state actions
- selected or featured surfaces where we want stronger brand presence

### Where gradients should not dominate

- long reading surfaces
- dense forms and data-heavy panels
- default list rows and generic containers
- provider-auth buttons

The visual goal is to make gradients feel intentional and premium, not decorative for decoration's sake.

## Color Usage Model

### Primary

Use primary for:

- primary CTAs
- focused inputs and active form controls
- selected states
- promoted links
- subtle highlighted surfaces
- branded section kickers and emphasis labels

Do not use primary for:

- long body text
- full-screen backgrounds
- default borders on neutral UI

### Secondary

Use secondary for:

- supportive highlights
- badges and informational accents
- decorative counterbalance in hero or panel backgrounds
- secondary emphasis surfaces

Do not use secondary for:

- the main submit path on auth and core flows unless intentionally designed
- generic hover states across the whole app

### Neutral

Keep neutral for:

- page canvases
- default cards and panels
- standard inputs at rest
- long-form reading surfaces
- provider button containers

## Phase 1: Theme Foundation

Create reusable semantic accent variables and theme fields first so color usage is consistent across all platforms.

### Web theme additions

Extend `apps/web/src/app/theme-css.ts` with semantic custom properties derived from existing design tokens.

Add or formalize variables for:

- `--accent-primary-bg`
- `--accent-primary-bg-hover`
- `--accent-primary-bg-active`
- `--accent-primary-radial`
- `--accent-primary-linear`
- `--accent-primary-border`
- `--accent-primary-border-hover`
- `--accent-primary-text`
- `--accent-primary-subtle-bg`
- `--accent-secondary-radial`
- `--accent-secondary-linear`
- `--accent-secondary-subtle-bg`
- `--accent-secondary-border`
- `--accent-secondary-text`
- `--accent-mixed-surface`
- `--accent-mixed-radial`
- `--accent-mixed-linear`
- `--accent-focus-ring`

These should be derived only from theme token values, never raw hex literals.

### Native theme additions

Expose equivalent semantic values from `packages/design-tokens` for native consumption, likely via theme helpers rather than CSS variables.

Add semantic fields or helpers for:

- promoted CTA background
- promoted CTA pressed background
- promoted CTA radial highlight
- promoted CTA linear base
- promoted CTA border
- subtle primary surface
- subtle secondary surface
- mixed accent surface
- mixed accent radial overlay
- mixed accent linear fill
- branded focus or active ring equivalent

If adding new token groups feels too heavy, add a small semantic helper layer that composes existing tokens into reusable visual treatments.

## Phase 2: Shared Cross-Platform Patterns

Before updating many screens, define a small set of reusable color recipes.

### Required shared recipes

- Primary CTA
- Secondary CTA or supporting action
- Tinted panel
- Mixed accent hero surface
- Selected pill or chip
- Focused input
- Branded kicker or section label
- Accent divider
- Highlight banner
- Gradient surface recipe
- Gradient overlay recipe

### Web implementation

Implement these through shared CSS classes or shared primitives in `packages/shared`.

For web, the default promoted recipe should support layered backgrounds such as:

- radial highlight layer
- optional secondary radial support layer
- linear gradient base layer

Shared primitives should expose these recipes so features can opt into them without recreating gradient strings.

### Native implementation

Implement these through shared style helpers or component variants in `packages/shared` using the theme object.

For native, gradients should be supported through a shared abstraction rather than ad hoc per-screen code. The implementation may use:

- Expo `LinearGradient` for directional fills
- a radial-like highlight approximation using layered translucent shapes, masked overlays, image assets, or a supported gradient solution already accepted by the codebase

Native does not need pixel-identical parity with web. It should preserve the same visual intent:

- soft radial emphasis
- directional base fill
- restrained saturation

The goal is to avoid every screen hardcoding its own accent treatment.

## Phase 3: Button Strategy

Buttons are the most visible place where brand color should appear consistently.

### Desktop web

- Keep `ButtonDesktopWeb` as the primary source of truth for generic actions.
- Ensure `primary`, `danger`, `ghost`, `outline`, and `surface` all use semantic tokens rather than local color mixes.
- Apply the branded gradient or promoted accent treatment only to `primary`, not to all variants.
- The primary button recipe should continue to use a radial highlight over a linear base, with hover and active states preserving that layered feel.

### Mobile web

- Audit inline button styles in mobile web feature screens.
- Replace flat `action.primary` fills with the same semantic accent treatment used on desktop web where appropriate.
- Where screens use local inline style objects, migrate button visuals into reusable constants or CSS modules if repetition grows.
- Keep the gradient treatment lighter than desktop where space is tighter, but preserve the radial-plus-linear feel on promoted CTAs.

### Native mobile

- Update `ButtonMobileNative` to reflect the same emphasis model as web.
- Use primary fills, subtle primary surfaces, and active borders driven by the native theme.
- Support a native promoted CTA recipe that uses a soft highlight plus directional fill. Do not mimic web gradients literally if it looks unnatural on native. Match the intent, not the exact rendering.
- Use pressed states to reinforce the accent rather than heavy visual effects.

## Phase 4: Surface Hierarchy

The screens currently rely too heavily on plain white and black surfaces.

Introduce color through layered surfaces rather than saturating entire pages.

### Desktop web and mobile web

Apply accent surfaces to:

- auth cards
- hero panels
- empty states
- error callout shells
- promoted search entry points

Preferred treatments:

- subtle primary-tinted wash
- subtle secondary-tinted wash
- mixed primary-secondary panel backgrounds for hero or promotional contexts
- accent border on selected or promoted panels
- radial highlight overlays on promoted surfaces where visual depth helps

Keep most page backgrounds neutral.

### Native mobile

Use:

- subtle tinted sections
- softly accented cards
- selected chips and tabs
- active container borders
- restrained layered fills for promoted surfaces when supported cleanly

Avoid strong multi-layer gradients on every native surface. Native should stay cleaner and more material.

## Phase 5: Typography and Content Accent

Branded color should participate in text hierarchy, but in a controlled way.

### Apply brand color to

- section kickers
- important inline links
- selected navigation labels
- supporting microcopy on promoted surfaces
- badge text on tinted surfaces

### Keep neutral for

- body paragraphs
- dense form instructions
- long descriptions
- default titles unless paired with an accent device

### Recommended pattern

Use neutral headings with one accent companion:

- colored kicker above the title
- colored underline or rule
- colored badge or chip next to the title

This gives identity without making the UI noisy.

## Phase 6: Forms and Inputs

Forms are currently one of the biggest missed opportunities for brand integration.

### Desktop web and mobile web

Update:

- input focus borders to primary
- focus shadows to branded focus treatment
- checkbox and radio selected states to primary
- helper links to branded content colors
- section dividers and legal text links to subtle accent roles

Keep rest states neutral. Branded color should appear when a field is active, selected, or promoted.

### Native mobile

Update:

- `TextInput` focus and active border treatments
- checkbox and switch selected states
- segmented or tab-like controls
- selected row affordances

Avoid converting all input backgrounds to tinted fills. Focus and active states should carry most of the color.

## Phase 7: Auth Screens Rollout

Auth screens are the clearest current example of the palette being underused.

### Desktop web

Planned updates:

- keep the form card mostly neutral but add a subtle mixed accent wash
- use branded kicker or subtitle above the main title
- keep provider buttons branded to provider
- keep the submit button strongly branded
- tint divider and link treatments with primary or secondary accents
- use subtle accent treatment around terms and support links

### Mobile web

Planned updates:

- mirror the same intent as desktop with lighter weight treatments
- branded primary submit action
- subtle accent in dividers and headings
- restrained tinted sections around the form or header area

### Native mobile

Planned updates:

- introduce a soft branded top section or panel behind the title area
- use tinted chips or labels rather than dense gradients
- keep inputs neutral until focus
- keep CTA clearly primary
- let secondary color appear in supporting links, helper notes, or badges

## Phase 8: Search, Navigation, Empty, and Error States

After auth, update the other high-visibility shared areas.

### Search

- add a promoted variant for search entry points using subtle primary surface
- use selected and hover states that draw from primary and secondary accents

### Navigation

- active nav items should use branded text and subtle accent backgrounds
- auth CTAs in headers should align with the shared button recipes
- avoid coloring the entire nav chrome

### Empty and error states

- use subtle accent surfaces around primary actions
- use branded CTA treatment for the main recovery action
- add small branded kickers or labels where appropriate

### Informational panels and badges

- use secondary subtle surfaces for supportive or educational messages
- reserve primary for the main task path

## Phase 9: Platform-Specific Rules

### Desktop web

- can support richer surface treatments such as layered gradients and glow-based accents
- use the most expressive accent rendering here
- maintain strong contrast and restrained saturation
- radial gradients can be used more freely here, especially in hero panels, CTAs, and promoted cards

### Mobile web

- should stay visually close to desktop web but lighter and less dense
- use fewer layered effects
- prioritize clarity and tap target emphasis
- preserve the same gradient language, but simplify the number and intensity of layers

### Native mobile

- should not mechanically copy desktop gradients
- use theme-driven fills, borders, pressed states, subtle tinted sections, and a shared promoted-gradient pattern where feasible
- rely more on spacing, hierarchy, and active states than on decorative gradients
- radial effects on native should be approximated carefully so they feel natural and performant

## Phase 10: Refactor and Consolidation

The current codebase still contains many screen-local style decisions.

Refactor goals:

- move repeated visual treatments into `packages/shared`
- reduce inline color styling in mobile web and desktop web screens
- prefer semantic variables and helper functions over direct token usage in screen files
- keep feature packages consuming shared color recipes instead of re-defining them

This is necessary to keep future color work maintainable.

## Phase 11: Accessibility and QA

Every phase should include accessibility checks.

### Required checks

- contrast on tinted surfaces in light and dark themes
- CTA text contrast against primary fills
- link contrast in body contexts
- focus visibility on all platforms
- selected state clarity for chips, tabs, and list items
- pressed and disabled differentiation

### Verification steps

- `pnpm --filter web typecheck`
- targeted visual review of desktop web
- responsive visual review for mobile web
- native simulator review for iOS and Android
- confirm no raw brand hex values are introduced in feature code where theme tokens should be used

## Rollout Order

Implement in this order:

1. Theme semantic accent variables and native semantic helpers
2. Shared button, panel, focus, and gradient recipes
3. Auth desktop web
4. Auth mobile web
5. Auth native mobile
6. Search and navigation accents
7. Empty states and error states
8. Supporting informational panels and badges
9. Final dark-mode tuning and accessibility sweep

## Deliverables

By the end of the rollout, the UI should show clear brand presence through:

- primary CTAs that feel consistent everywhere
- subtle branded surfaces around promoted content
- visible primary focus and selected states
- strategic secondary accents in supporting UI
- shared recipes reused across desktop web, mobile web, and native mobile

The result should feel branded and intentional without turning the product into a saturated marketing page.
