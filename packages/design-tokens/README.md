# @sd/design-tokens

> Design token source of truth for colors, spacing, typography, radius, and shadows

## Purpose

Defines the canonical token values consumed by the entire design system. Web apps read tokens via CSS custom properties; mobile apps read them through the Unistyles theme object. All visual decisions — colors, spacing scales, radii, typography — originate here.

## Boundaries

- **Depends on:** none (leaf package)
- **Consumed by:** `@sd/core-styles`, `@sd/shared`, all `feature-*` packages, `apps/web`, `apps/mobile`

## Structure

```
src/
├── colors/         # Color palettes and semantic color tokens
├── spacing/        # Layout and component spacing scales
├── radius/         # Border radius tokens
├── typography/     # Font families, sizes, weights, line heights
├── shadows/        # Shadow definitions
├── recipes/        # Composite token recipes
├── theme/          # Unistyles theme assembly
├── types/          # Token type definitions
├── index.web.ts    # Web entrypoint (CSS variables)
└── index.native.ts # React Native entrypoint (Unistyles theme)
```

## Key Commands

- `pnpm --filter design-tokens build` — Build the package
- `pnpm --filter design-tokens typecheck` — Type check
- `pnpm --filter design-tokens lint` — Lint

## Constraints

- Use tokens by semantic role, not raw values:
  - `spacing.layout.*` for page/section spacing
  - `spacing.component.*` for component padding/gaps
  - `radius.component.*` for UI element radii
  - Typography by purpose (`display`, `title`, `body`, `label`, `caption`)
- Web uses CSS variable naming convention; mobile uses Unistyles theme object.
- This is a leaf package with zero workspace dependencies — keep it that way.
