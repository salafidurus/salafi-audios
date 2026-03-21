# AGENT.md - `@sd/feature-navigation`

## Purpose

`@sd/feature-navigation` owns package-level navigation chrome and navigation constants.

## Structure

- `src/components/` for navigation UI.
- `src/utils/` for route helpers and icon maps.
- `src/store/` only when product state is truly needed.
- `src/types/` or shared plain files for navigation contracts and constants.

## Entrypoints

- This package has a real platform split, so use `src/index.web.ts` and `src/index.native.ts`.
- Shared navigation contracts should live in plain files under `src/` such as `types.ts`, then be exported explicitly from both platform root entrypoints.

## Rules

- Web-only chrome such as `Sidebar`, `Footer`, and `TopAuthStrip` must not be exported from the native entrypoint.
- Shared constants must not live in `.native.ts` files.
- Keep icon maps and route constants in utils/types, not inline in components.
- No intermediate barrels.
