# AGENT.md - `@sd/shared`

## Purpose

`@sd/shared` contains generic primitives, generic hooks, and generic utilities.

- This package must stay domain-agnostic.
- If something becomes domain-specific, move it to the relevant `@sd/feature-*` package.

## Structure

- `src/components/` for generic UI primitives.
- `src/hooks/` for generic hooks.
- `src/utils/` for generic utilities.
- `src/types/` for package-local shared types.

## Entrypoints

- This package has a real platform split, so use `src/index.web.ts` and `src/index.native.ts`.
- Do not add a plain `src/index.ts` unless the public surface becomes fully shared.

## Naming Rules

- Platform-bound exports must be explicit: `ButtonMobileNative`, `ButtonDesktopWeb`, `AuthRequiredStateResponsive`.
- Web-only hooks must have explicit web naming and `.web.*` files.
- Do not export web-only hooks from `index.native.ts`.

## Rules

- No intermediate barrels.
- No domain logic.
- Package manifest must declare every direct external import.
