# ADR 0003: Use a contained single-layer public navigation shell

## Status

Accepted

## Context

The public navbar had accumulated competing margins, padding, minimum widths,
sticky-layer effects, and responsive overrides. Those rules allowed the brand,
search, primary links, account controls, and Admin entry to overlap or create
the impression of multiple navigation layers.

The web app needs a public discovery shell for Home, Explore, Scholars, and
Library. Settings and administrative actions have different intent and must
not compete with public content navigation. The shell must also support RTL,
light/dark and accent themes, capability-aware Admin access, keyboard use, and
small screens without changing routes or authority boundaries.

## Decision

- Use one desktop navigation row with four explicit zones: brand, search,
  primary content links, and account/utility actions.
- Keep the surface full-width but constrain its content to the existing web
  content maximum and logical page padding.
- Keep the header sticky with an opaque theme surface and a subtle bottom
  border. Do not use a second navigation row, floating card, or translucent
  stack.
- Use a capped visible search control on desktop and an icon trigger on
  compact widths.
- Keep Home, Explore, Scholars, and Library as the public primary links.
  Settings remains in the account menu.
- Show Admin entry only for Users with backend-recognized administrative
  access. The Admin workspace retains its capability-aware contextual links
  and safe Back to App behavior.
- Switch to a compact brand-plus-icon-actions header and shadcn Sheet before
  the four desktop zones can fit without violating the interaction target
  budget.
- Use the existing semantic design tokens for color, spacing, radius, shadow,
  typography, theme, and focus treatment. Do not introduce navbar-specific
  hardcoded colors or negative-margin alignment hacks.
- Identify the active destination with content color and a restrained accent
  rule rather than a large filled pill.
- Use logical CSS properties and direction-aware Sheet placement for RTL.
- Preserve stable header geometry during auth/capability loading and hide
  unauthorized Admin actions rather than rendering disabled promises.

## Alternatives considered

### Two stacked navigation rows

Rejected because the product requires a single public navbar and the extra row
was the source of visual layering confusion.

### Full-width flex negotiation

Rejected because intrinsic link, search, and account widths caused overlap at
intermediate desktop widths.

### Floating glass navbar

Rejected because blur and transparency made the header feel like a separate
layer over content and reduced contrast in theme variants.

### Always-visible Settings and Admin links

Rejected because they mix account/authority tasks with public discovery and
make the public hierarchy less clear.

## Consequences

The navbar CSS has a small number of layout responsibilities: one contained
desktop row, one compact responsive mode, and one Sheet composition. The UI
must continue to test public, scoped-admin, and unauthenticated states, plus
RTL and narrow-width behavior. The API remains authoritative for every Admin
route and action.
