# AGENT.md - `@sd/feature-feed`

## Purpose

`@sd/feature-feed` owns feed-specific screens and feed presentation logic.

## Structure

- `src/screens/` for route-facing screen assemblies.
- `src/components/` for reusable feed-specific UI.
- `src/hooks/`, `src/utils/`, `src/types/` as needed.

## Rules

- Keep placeholder or in-progress screens package-owned, not app-owned.
- App route files should wire callbacks and auth gating only.
- This package has a real platform split, so use `index.web.ts` and `index.native.ts`.
- Do not add a plain `index.ts` unless the package becomes fully platform-agnostic.
- No intermediate barrels.
