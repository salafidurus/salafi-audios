# @sd/core-styles

> Styling infrastructure bridge between design tokens and app-level styles

## Purpose

Provides shared styling setup — Unistyles bootstrap, breakpoint definitions, and style utilities — so that apps and feature packages can consume design tokens through a consistent styling API on both web and native.

## Boundaries

- **Depends on:** `@sd/design-tokens`, `@sd/core-contracts`
- **Consumed by:** `@sd/shared`, all `feature-*` packages, `apps/web`, `apps/mobile`

## Structure

```
src/
├── utils/
│   ├── breakpoints.ts          # Shared breakpoint values
│   ├── unistyles.web.ts        # Web Unistyles setup
│   └── unistyles.native.ts     # React Native Unistyles setup
├── index.web.ts                # Web entrypoint
└── index.native.ts             # React Native entrypoint
```

## Key Commands

- `pnpm --filter core-styles build` — Build the package
- `pnpm --filter core-styles typecheck` — Type check

## Constraints

- Shared values like breakpoints live in plain `.ts` files — no `.native.ts` duplicate when contents are identical.
- Web-only setup helpers use explicit names (e.g. `UnistylesStyleDesktopWeb`); don't hide them behind generic exports.
- No intermediate barrel files.
