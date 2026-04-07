# Cross-Platform UI Color Integration Plan

## Goal

Integrate the product's primary and secondary colors into desktop web, mobile web, and native mobile in a way that is branded, reusable, accessible, and maintainable from one source of truth.

The current UI leans too heavily on neutral surfaces and isolated color usage. The fix is not to hand-color a few screens. The fix is to add a semantic accent system to `@sd/design-tokens`, project it into web CSS variables and native theme objects, and consume it through shared UI primitives.

## Non-Negotiable Architecture

The color system must originate in `packages/design-tokens` and only there.

- Base tokens stay in `@sd/design-tokens`:
  - color ramps
  - surface roles
  - border roles
  - content roles
  - spacing, radius, typography, shadows
- Semantic accent recipes also live in `@sd/design-tokens`.
- `apps/web` must not invent accent semantics in `theme-css.ts`.
- `apps/web/src/app/theme-css.ts` should only project semantic tokens from `@sd/design-tokens` into CSS custom properties.
- Native mobile should consume the same semantic recipes directly from the theme object.
- `packages/shared` should consume semantic recipes and expose reusable UI primitives and variants.
- Feature packages should consume shared primitives and recipe helpers, not define their own color systems.

This resolves the biggest architectural risk: web and native semantics drifting apart.

## External Guidance Informing This Plan

This plan follows the repo guardrails and is also shaped by official platform guidance.

- Material 3 says primary is for prominent buttons, active states, and elevated-surface tint; secondary is for less-prominent UI such as chips; tertiary is for contrasting accents and balance.
- Apple HIG emphasizes clear hierarchy, harmony, and accessibility, and warns against relying on color alone to communicate meaning.
- Expo officially supports `expo-linear-gradient` as a universal gradient component for Android, iOS, tvOS, and web.
- `react-native-svg` officially supports SVG across React Native and web, but its own docs note a known issue with RadialGradient focus points on Android.

These references support the following decisions:

- primary remains the main action color
- secondary is supporting, not competing
- gradients are allowed, but only on promoted surfaces
- native radial effects should be constrained and simple

## Monorepo Decision

The best fit for this monorepo is:

1. semantic accent recipes in `@sd/design-tokens`
2. shared primitives in `@sd/shared`
3. CSS projection for web
4. theme-object consumption for native

For native gradients:

- use `expo-linear-gradient` for all native directional fills
- use `react-native-svg` only for a small static radial glow primitive when needed
- do not add a third gradient package
- do not use image assets, masks, or complex SVG filters for accent surfaces

This is the best fit because:

- Expo officially supports `expo-linear-gradient`
- the repo already includes `react-native-svg`
- `react-native-svg` can provide a controlled radial overlay
- using only these two tools minimizes dependency churn and keeps the system understandable

## Design Standards For This System

### Color role standards

- `primary` = prominent actions, active states, selected emphasis, elevated tint
- `secondary` = supporting emphasis, chips, informational accents, balance
- `neutral` = foundation for canvas, cards, dense content, forms at rest

### Gradient standards

- radial gradients are the signature accent language
- linear gradients provide directional structure underneath
- promoted surfaces can use both
- standard surfaces should not

### Accessibility standards

- never rely on color alone to express state
- every selected, focused, error, success, or destructive state must also have shape, icon, label, border, or motion support
- light and dark mode recipes must be validated independently

## Proposed Token Architecture

Keep the existing base token categories. Add a new semantic recipe category in `@sd/design-tokens`.

Recommended structure:

```text
packages/design-tokens/src/
  colors/
    shared.ts
  spacing/
    web.ts
    native.ts
  radius/
    web.ts
    native.ts
  shadows/
    shared.ts
    web.ts
    native.ts
  typography/
    shared.ts
    web.ts
    native.ts
  recipes/
    shared.ts
    web.ts
    native.ts
  theme/
    web.ts
    native.ts
  index.web.ts
  index.native.ts
```

Why `recipes/`:

- base tokens answer "what colors exist"
- recipes answer "how brand emphasis is composed"
- this keeps gradients and promoted surfaces from being scattered across app files

## Semantic Recipe Model

The semantic recipe layer should define reusable accent treatments instead of raw values.

### Required recipes

- `accent.primary.cta`
- `accent.primary.ctaHover`
- `accent.primary.ctaActive`
- `accent.primary.subtleSurface`
- `accent.primary.focusRing`
- `accent.secondary.subtleSurface`
- `accent.secondary.supportingBadge`
- `accent.mixed.heroSurface`
- `accent.mixed.promotedPanel`
- `accent.selected.surface`
- `accent.selected.content`
- `accent.divider`

### Web recipe fields

Web recipes can expose CSS-ready values:

- `background`
- `backgroundHover`
- `backgroundActive`
- `borderColor`
- `borderColorHover`
- `textColor`
- `shadow`
- `radial`
- `linear`

### Native recipe fields

Native recipes should expose composition-ready values:

- `baseColor`
- `borderColor`
- `textColor`
- `shadowVariant`
- `linearGradient.colors`
- `linearGradient.start`
- `linearGradient.end`
- `radialGlow.centerColor`
- `radialGlow.edgeColor`
- `radialGlow.center`
- `radialGlow.radius`

## Native Gradient Strategy

This is the part that needs to be explicit.

### Approved native implementation

- Base fill: `expo-linear-gradient`
- Optional radial glow overlay: a small shared `react-native-svg` primitive

### Disallowed native implementation paths

- no gradient image assets
- no filter-heavy SVG effects
- no per-screen custom gradient implementations
- no adding another gradient package unless this strategy fails in production

### Why this strategy

- `expo-linear-gradient` is the official Expo path and works on Android, iOS, tvOS, and web
- `react-native-svg` already exists in the repo and supports RN plus web
- `react-native-svg` documents a known Android limitation for RadialGradient focus points, so we should not rely on advanced focal-point behavior

### Native radial rule

The radial overlay must be:

- static
- simple
- low-opacity
- one overlay per promoted surface
- limited to 2 or 3 stops
- not animated unless profiling proves it is safe

## Web Strategy

Web should use CSS gradients generated from recipe tokens.

`apps/web/src/app/theme-css.ts` should map recipe values from `@sd/design-tokens` into CSS variables such as:

- `--accent-primary-cta-bg`
- `--accent-primary-cta-bg-hover`
- `--accent-primary-cta-border`
- `--accent-primary-subtle-surface`
- `--accent-mixed-hero-surface`

Web should not compute recipe logic locally.

## Shared Primitive Strategy

`packages/shared` should become the main consumer-facing layer for accent usage.

### Shared abstractions to add

- button variants using semantic recipes
- promoted panel or accent panel primitive
- branded section header or kicker primitive
- highlighted empty-state container
- focus-ring helper for web and native
- optional native `RadialGlow` helper

This is the correct abstraction boundary for the monorepo:

- `@sd/design-tokens` defines recipe data
- `@sd/shared` defines reusable UI usage
- feature packages compose screens from those pieces

## Usage Constraints

This is the restraint model that was missing from the previous plan.

### Per-screen limits

- max one strong promoted gradient surface per screen above the fold
- max two secondary accent zones on a screen
- do not stack multiple promoted gradients in the same viewport section
- if a CTA already uses strong primary emphasis, nearby supporting controls should usually stay neutral or subtle

### Where secondary is allowed

- chips
- supporting badges
- hero balance accents
- educational or informational panels

### Where secondary is not allowed

- main auth submit path
- dominant nav chrome
- dense form controls by default

### Where gradients must degrade to subtle fills

- dense form shells
- long text content
- list-heavy screens
- low-end performance hotspots on native

## Concrete Rollout

### Phase 1: Add semantic recipes in `@sd/design-tokens`

Tasks:

- add `recipes/shared.ts`, `recipes/web.ts`, `recipes/native.ts`
- define CTA, subtle surface, mixed hero, selected, and divider recipes
- export recipes from `index.web.ts` and `index.native.ts`
- keep `theme/web.ts` and `theme/native.ts` projecting recipe data into the final theme objects

### Code example: recipe shape

```typescript
// packages/design-tokens/src/recipes/shared.ts
export const accentRecipeNames = {
  primaryCta: "primaryCta",
  primarySubtleSurface: "primarySubtleSurface",
  mixedHeroSurface: "mixedHeroSurface",
} as const;
```

```typescript
// packages/design-tokens/src/recipes/web.ts
export const webAccentRecipes = {
  primaryCta: {
    background:
      "radial-gradient(circle at 18% 22%, var(--accent-primary-radial), transparent 60%), linear-gradient(135deg, var(--action-primary), var(--action-primary-hover))",
    borderColor: "color-mix(in srgb, var(--border-primary-strong) 58%, transparent)",
    textColor: "var(--content-on-primary)",
    shadow: "var(--shadow-sm)",
  },
} as const;
```

```typescript
// packages/design-tokens/src/recipes/native.ts
export const nativeAccentRecipes = {
  primaryCta: {
    textColorToken: "content.onPrimary",
    borderColorToken: "border.primaryStrong",
    shadowToken: "sm",
    linearGradient: {
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
      colorTokens: ["action.primary", "action.primaryHover"],
    },
    radialGlow: {
      center: { x: 0.18, y: 0.22 },
      radius: 0.58,
      centerColorToken: "border.primaryStrong",
      edgeColorToken: "transparent",
    },
  },
} as const;
```

### Phase 2: Project web recipe tokens into CSS vars

Tasks:

- import recipe values from `@sd/design-tokens`
- assign CSS vars only
- avoid app-local recipe generation

### Code example: web projection

```typescript
// apps/web/src/app/theme-css.ts
import { lightWebTheme, darkWebTheme } from "@sd/design-tokens";

const createThemeCss = (selector: string, theme: typeof lightWebTheme) => `
${selector} {
  --accent-primary-cta-bg: ${theme.recipes.primaryCta.background};
  --accent-primary-cta-border: ${theme.recipes.primaryCta.borderColor};
  --accent-primary-cta-text: ${theme.recipes.primaryCta.textColor};
}
`;
```

### Phase 3: Build shared UI consumers

Tasks:

- update `ButtonDesktopWeb`
- update `ButtonMobileNative`
- add shared promoted panel
- add shared accent header

### Code example: shared button on web

```css
.variant-primary {
  --btn-bg: var(--accent-primary-cta-bg);
  --btn-border: var(--accent-primary-cta-border);
  --btn-fg: var(--accent-primary-cta-text);
}
```

### Code example: shared button on native

```tsx
import { LinearGradient } from "expo-linear-gradient";
import { useUnistyles } from "react-native-unistyles";

export function PrimaryButtonBackground() {
  const { theme } = useUnistyles();
  const recipe = theme.recipes.primaryCta;

  return (
    <LinearGradient
      colors={recipe.linearGradient.colors}
      start={recipe.linearGradient.start}
      end={recipe.linearGradient.end}
      style={{ ...StyleSheet.absoluteFillObject }}
    />
  );
}
```

### Phase 4: Add a shared native radial glow primitive

This should be a very small primitive in `@sd/shared`, not a general-purpose graphics system.

### Code example: native radial glow

```tsx
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";

export function RadialGlow({ centerColor, edgeColor }: { centerColor: string; edgeColor: string }) {
  return (
    <Svg pointerEvents="none" width="100%" height="100%">
      <Defs>
        <RadialGradient id="glow" cx="18%" cy="22%" rx="58%" ry="58%">
          <Stop offset="0%" stopColor={centerColor} stopOpacity="0.56" />
          <Stop offset="100%" stopColor={edgeColor} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#glow)" />
    </Svg>
  );
}
```

Important constraint:

- do not use `fx` or `fy`
- the `react-native-svg` docs note Android limitations around RadialGradient focus points

### Phase 5: Screen rollout

Rollout order:

1. shared CTA and promoted panel recipes
2. auth desktop web
3. auth mobile web
4. auth native mobile
5. search entry points
6. nav active states and auth CTAs
7. empty and error states
8. informational panels and badges

## Screen-Level Intent

### Auth

- primary CTA uses full promoted recipe
- provider buttons remain provider-branded
- headings remain mostly neutral with accented kicker or divider
- cards may use subtle mixed accent wash, not full saturation

### Search

- selected chips and promoted search entry points may use primary and secondary supporting accents
- list-heavy results remain mostly neutral

### Navigation

- active item = subtle branded surface plus branded content
- nav shell stays neutral

### Empty and error states

- one promoted action zone
- one supporting accent zone
- no full-screen gradient backgrounds

## Verification Strategy

This is the solution to the system-level verification problem.

Do not verify only at screen level. Verify at recipe, primitive, and screen level.

### Layer 1: token and recipe verification

- typecheck `@sd/design-tokens`
- snapshot or unit-test recipe objects where practical
- verify light and dark variants exist for each recipe

### Layer 2: shared primitive verification

- visual review for shared button, promoted panel, accent header
- ensure each primitive renders correctly on desktop web, mobile web, iOS, and Android
- test disabled, focused, pressed, and selected states

### Layer 3: screen verification

- auth, search, navigation, empty, error
- verify screen-level restraint rules are respected

### Layer 4: performance verification on native

- profile screens using native promoted surfaces
- if SVG radial overlays regress performance, fall back to linear-only subtle treatment on those screens

## Internal Review Harness

To keep this maintainable, create a small internal recipe showcase.

Recommended:

- one internal web route showing all accent recipes
- one internal native screen showing the same recipe set

This gives the team a single place to review:

- primary CTA
- subtle surface
- mixed hero
- selected chip
- focus state
- disabled state
- dark mode

This is the professional solution to the verification gap because it turns a vague visual system into a reviewable surface.

## Final Recommendation

Implement the system with this boundary:

- `@sd/design-tokens`: base tokens plus semantic accent recipes
- `apps/web`: projection of recipe values into CSS vars only
- `@sd/shared`: reusable components and primitives that consume recipes
- feature packages: screen composition only

Implement native gradients with:

- `expo-linear-gradient` for all directional fills
- `react-native-svg` only for a constrained, static radial glow helper

This is the most suitable option for the monorepo because it keeps design authority centralized, minimizes dependencies, respects Expo and React Native constraints, and gives both web and native a coherent branded system without forcing identical rendering.
