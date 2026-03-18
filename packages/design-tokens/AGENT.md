# AGENT.md - packages/design-tokens

This package defines the design tokens used across web and mobile.

## Core responsibilities

- Provide the single source of truth for colors, spacing, radius, shadows, and typography.
- Keep tokens stable and semantically named across platforms.
- Ensure tokens map cleanly to web CSS variables and mobile Unistyles themes.

## Rules

- Keep tokens consistent across platforms; only values differ by platform.
- Prefer semantic naming over visual naming.
- If a required token is missing, make a small, deliberate update here (do not hardcode in apps).
- Changes here affect multiple apps; keep updates minimal and well-scoped.

## Path aliases

- Use `@/` for package-local imports (maps to `src/*`).

---

## Web Usage (CSS Variables)

Design tokens are injected as CSS variables in `apps/web/src/app/theme-css.ts` and applied in `apps/web/src/app/layout.tsx`.

**CSS variable naming convention:**

```css
/* Colors */
--surface-canvas
--surface-default
--surface-subtle
--surface-elevated
--surface-hover
--surface-inverse
--surface-primary-subtle
--surface-secondary-subtle
--surface-selected
--surface-disabled

--border-default
--border-subtle
--border-strong
--border-muted
--border-hover
--border-focus
--border-primary
--border-primary-strong
--border-secondary
--border-secondary-strong
--border-disabled

--content-default
--content-muted
--content-subtle
--content-strong
--content-inverse
--content-primary
--content-primary-strong
--content-secondary
--content-secondary-strong
--content-on-primary
--content-on-secondary
--content-on-danger
--content-on-success
--content-disabled

--action-primary
--action-secondary
--action-danger
--action-success
--action-warning
--action-info

/* Spacing */
--space-layout-page-x
--space-layout-page-y
--space-layout-section-y
--space-layout-content-max

--space-component-card-padding
--space-component-panel-padding
--space-component-chip-x
--space-component-chip-y
--space-component-gap-sm
--space-component-gap-md
--space-component-gap-lg
--space-component-gap-xl

--space-xs, --space-sm, --space-md, --space-lg, --space-xl, --space-2xl, --space-3xl, --space-4xl

/* Radius */
--radius-component-chip
--radius-component-card
--radius-component-panel-sm
--radius-component-panel

--radius-xs, --radius-sm, --radius-md, --radius-lg, --radius-xl, --radius-full

/* Typography */
--typo-display-lg
--typo-display-md
--typo-title-lg
--typo-title-md
--typo-body-lg
--typo-body-md
--typo-body-sm
--typo-label-md
--typo-caption
--typo-xs
```

**Reference in CSS/modules:**

```css
.container {
  background-color: var(--surface-canvas);
  padding: var(--space-layout-page-x);
  color: var(--content-default);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-component-card);
}

.title {
  font: var(--typo-title-md);
  color: var(--content-strong);
}
```

**Reference in inline styles (JS):**

```typescript
style={{ backgroundColor: `var(--surface-canvas)` }}
```

---

## Mobile Usage (Unistyles Theme)

Design tokens are accessible via the Unistyles theme factory. Access in `StyleSheet.create()` callback or via `useUnistyles()` hook.

**Access in StyleSheet.create():**

```typescript
import { StyleSheet } from "react-native-unistyles";

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.surface.canvas,
    padding: theme.spacing.layout.pageX,
    borderRadius: theme.radius.component.card,
  },
  title: {
    ...theme.typography.titleMd,
    color: theme.colors.content.strong,
  },
}));
```

**Access at runtime:**

```typescript
import { useUnistyles } from 'react-native-unistyles';

export function Component() {
  const { theme } = useUnistyles();
  return <View style={{ color: theme.colors.content.muted }} />;
}
```

**Token structure (mobile):**

- `theme.colors.surface.*`, `theme.colors.border.*`, `theme.colors.content.*`, `theme.colors.action.*`
- `theme.spacing.layout.*`, `theme.spacing.component.*`, `theme.spacing.scale.*`
- `theme.radius.component.*`, `theme.radius.scale.*`
- `theme.typography.*` (spreads with font-family, font-size, font-weight, line-height)
- `theme.shadows.*` (native shadows for elevation)

See packages/ui-mobile/AGENT.md for styling patterns and examples.

---

## Design Token Usage Guide: `surface`, `border`, and `content`

Use these token groups by **role**, not by visual preference.

### Core rule

- `surface` = backgrounds and fills
- `border` = outlines, separators, rings
- `content` = text, icons, and foreground elements placed on top of surfaces

Never use a `content` token as a background.
Never use a `surface` token for text.
Never use a `border` token for main text.

### 1. `surface` tokens

Use `surface.*` for anything that forms the visual layer a user sees **behind content**.

Use `surface` for:

- page backgrounds
- cards
- panels
- containers
- hover fills
- subtle selected fills
- disabled fills
- tinted backgrounds for primary/secondary emphasis

#### Meaning of each surface token

- `surface.canvas` -> app/page background
- `surface.default` -> default background of components
- `surface.subtle` -> softer background than default
- `surface.elevated` -> lifted surfaces (modals, popovers)
- `surface.hover` -> hover/pressed background on neutral surfaces
- `surface.inverse` -> reversed surface relative to main theme
- `surface.primarySubtle` -> soft primary-tinted surfaces
- `surface.secondarySubtle` -> soft secondary-tinted surfaces
- `surface.selected` -> selected state backgrounds
- `surface.disabled` -> disabled backgrounds only

### 2. `border` tokens

Use `border.*` only for edges, dividers, separators, outlines, and focus treatments.

Use `border` for:

- component outlines
- separators
- dividers
- input borders
- hover border emphasis
- focus rings
- accent borders
- disabled borders

#### Meaning of each border token

- `border.default` -> normal component borders
- `border.subtle` -> soft separators
- `border.strong` -> emphasized borders
- `border.muted` -> barely visible boundaries
- `border.hover` -> hover border changes
- `border.focus` -> focus-visible treatment
- `border.primary` -> soft primary-accent borders
- `border.primaryStrong` -> emphasized primary borders
- `border.secondary` -> soft secondary borders
- `border.secondaryStrong` -> strong secondary borders
- `border.disabled` -> disabled borders

### 3. `content` tokens

Use `content.*` for any foreground element shown on top of a surface.

Use `content` for:

- text
- icons
- glyphs
- foreground indicators
- inline metadata

#### Meaning of each content token

- `content.default` -> normal body content
- `content.muted` -> secondary content
- `content.subtle` -> quiet tertiary content
- `content.strong` -> headings/high emphasis
- `content.inverse` -> text on inverse surfaces
- `content.primary` -> primary-accent foreground
- `content.primaryStrong` -> stronger primary foreground
- `content.secondary` -> secondary foreground
- `content.secondaryStrong` -> stronger secondary foreground
- `content.onPrimary` -> text/icons on strong primary background
- `content.onSecondary` -> text/icons on strong secondary background
- `content.onDanger` -> text/icons on danger backgrounds
- `content.onSuccess` -> text/icons on success backgrounds
- `content.disabled` -> disabled foreground content

### 4. Practical pairing rules

- neutral container -> surface.default + border.default + content.default + content.strong
- subtle container -> surface.subtle + border.subtle + content.default
- elevated container -> surface.elevated + border.default (or none) + content.default
- selected item -> surface.selected + border.primary/primaryStrong + content.strong
- primary tinted block -> surface.primarySubtle + border.primary + content.primaryStrong + content.default
- inverse block -> surface.inverse + content.inverse
- disabled component -> surface.disabled + border.disabled + content.disabled
- primary button -> action.primary + content.onPrimary
- secondary button -> action.secondary + content.onSecondary

### 5. Decision rules for the agent

1. Determine the layer

- background/container -> surface
- outline/separator -> border
- text/icon/foreground -> content

1. Determine emphasis

- standard -> default
- quieter -> subtle/muted
- stronger -> strong
- disabled -> disabled
- selected/accented -> primary/secondary
- on colored fill -> onPrimary/onSecondary/inverse

1. Preserve contrast and semantics

- Foreground must remain readable against its background
- Prefer semantic pairing over visual guessing
- Do not swap token groups across roles

### 6. Anti-patterns

- use content tokens as backgrounds
- use surface tokens as text colors
- use border tokens as primary text colors
- use content.inverse on normal light surfaces
- use content.onPrimary unless on strong primary fill
- use surface.hover as resting background
- use border.focus as permanent border

### 7. Preferred defaults

- page background -> surface.canvas
- standard container -> surface.default
- muted container -> surface.subtle
- default text -> content.default
- heading text -> content.strong
- helper text -> content.muted
- default border -> border.default
- subtle divider -> border.subtle
- focus ring -> border.focus
- disabled UI -> surface.disabled + border.disabled + content.disabled

### 8. Short version

Token usage:

- surface.\* = backgrounds and fills
- border.\* = outlines, dividers, separators, focus rings
- content.\* = text, icons, and other foreground elements

Defaults:

- page bg -> surface.canvas
- container bg -> surface.default
- subtle bg -> surface.subtle
- elevated bg -> surface.elevated
- default border -> border.default
- subtle divider -> border.subtle
- focus ring -> border.focus
- body text -> content.default
- heading text -> content.strong
- secondary text -> content.muted
- inverse text -> content.inverse
- disabled fg -> content.disabled

Pairings:

- selected item -> surface.selected + border.primary + content.strong
- primary-tinted section -> surface.primarySubtle + border.primary + content.primaryStrong
- inverse section -> surface.inverse + content.inverse
- disabled component -> surface.disabled + border.disabled + content.disabled
- primary button -> action.primary + content.onPrimary
- secondary button -> action.secondary + content.onSecondary

Never:

- use content tokens as backgrounds
- use surface tokens as text colors
- use border tokens as primary text colors
- use onPrimary/onSecondary unless text is on a strong action/accent fill

## Design Token Usage Guide: `spacing`, `radius`, and `typography`

Use tokens by **semantic role**, not by guessing what looks nice.

Prefer:

- consistent rhythm
- reuse of existing semantic tokens
- predictable hierarchy
- fewer arbitrary one-off values

### 1. `spacing` tokens

Core rule:

- `spacing.layout.*` = page and section-level spacing
- `spacing.component.*` = component padding and common UI gaps
- `spacing.scale.*` = low-level spacing steps for fine control

Prefer `layout` and `component` first. Use `scale` when no semantic token fits.

#### 1.1 `spacing.layout`

- `spacing.layout.pageX` -> horizontal page padding
- `spacing.layout.pageY` -> vertical page padding
- `spacing.layout.sectionY` -> spacing between major vertical sections
- `spacing.layout.contentMax` -> content width constraints on web

#### 1.2 `spacing.component`

- `spacing.component.cardPadding` -> standard card padding
- `spacing.component.panelPadding` -> modal/panel padding
- `spacing.component.chipX` -> chip horizontal padding
- `spacing.component.chipY` -> chip vertical padding
- `spacing.component.gapSm` -> small internal gaps
- `spacing.component.gapMd` -> standard internal gaps
- `spacing.component.gapLg` -> larger internal gaps
- `spacing.component.gapXl` -> very spacious internal separation

#### 1.3 `spacing.scale`

Use for fallback primitives when semantic tokens do not fit:

- `xs` = tiny
- `sm` = small
- `md` = medium
- `lg` = larger
- `xl`, `2xl`, `3xl`, `4xl` = progressively spacious

#### Spacing decision rules

- page padding X -> `spacing.layout.pageX`
- page padding Y -> `spacing.layout.pageY`
- section gap -> `spacing.layout.sectionY`
- card padding -> `spacing.component.cardPadding`
- panel padding -> `spacing.component.panelPadding`
- chip padding -> `spacing.component.chipX` + `spacing.component.chipY`
- standard gap -> `spacing.component.gapMd`

#### Spacing anti-patterns

- do not use arbitrary values when a token exists
- do not use `layout.*` inside small components
- do not use component padding as section spacing

### 2. `radius` tokens

Core rule:

- `radius.component.*` = preferred radius for named UI patterns
- `radius.scale.*` = low-level radius steps
- `radius.scale.full` = fully rounded / pill / circular edges

Prefer `component` first. Use `scale` when no component token fits.

#### `radius.component`

- `radius.component.chip` -> chips, badges, pills
- `radius.component.card` -> cards
- `radius.component.panelSm` -> small panels/popovers
- `radius.component.panel` -> large panels/modals/drawers

#### `radius.scale`

- `xs`, `sm`, `md`, `lg`, `xl` -> fallback rounding steps
- `full` -> fully rounded

#### Radius anti-patterns

- do not mix many radii in one component family
- do not use `full` unless shape should read as pill/circle
- do not invent custom radius values outside tokens

### 3. `typography` tokens

Core rule:

- display = hero, prominent headline text
- title = section and card headings
- body = readable content text
- label = compact UI labels and controls
- caption = supporting metadata
- xs = very small supporting text only

Use typography by purpose, not by size.

#### Typography variants

- `typography.displayLg` -> hero headline
- `typography.displayMd` -> strong display heading
- `typography.titleLg` -> major section/card/modal title
- `typography.titleMd` -> secondary heading
- `typography.bodyLg` -> larger readable paragraph
- `typography.bodyMd` -> default readable text
- `typography.bodySm` -> compact readable text
- `typography.labelMd` -> buttons, tabs, labels, controls
- `typography.caption` -> metadata/helper text
- `typography.xs` -> tiny metadata only

#### Typography rules

- prefer full variant tokens over manual font property composition
- do not use display styles for ordinary UI
- do not use xs for standard readable text

### Practical defaults

- page shell padding -> `spacing.layout.pageX` + `spacing.layout.pageY`
- section gap -> `spacing.layout.sectionY`
- card -> padding `spacing.component.cardPadding`, radius `radius.component.card`, title `typography.titleMd`, body `typography.bodyMd`, metadata `typography.caption`
- panel -> padding `spacing.component.panelPadding`, radius `radius.component.panel`, title `typography.titleLg`
- chip -> padding `spacing.component.chipX` + `chipY`, radius `radius.component.chip`, text `typography.labelMd`

## Build/lint/test commands

- Build: `pnpm --filter design-tokens build`
- Lint: `pnpm --filter design-tokens lint`
- Typecheck: `pnpm --filter design-tokens typecheck`
