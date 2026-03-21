# AGENT.md - `@sd/feature-account`

## Purpose

`@sd/feature-account` owns reusable account screens and account-specific presentation logic.

## Structure

- `src/screens/` for route-facing screen assemblies.
- `src/components/` for feature-specific reusable UI.
- `src/hooks/`, `src/utils/`, `src/types/` as needed.

## Entrypoints

- This package has a real platform split, so use `src/index.web.ts` and `src/index.native.ts`.
- Do not add a plain `src/index.ts` unless the package becomes fully platform-agnostic.

## Rules

- Route files in apps stay thin and should import screens from this package.
- Screen files should mostly assemble feature components, not hold excessive implementation detail.
- No intermediate barrels.
