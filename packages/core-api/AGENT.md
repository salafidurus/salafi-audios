# AGENT.md - `@sd/core-api`

## Purpose

`@sd/core-api` owns platform-agnostic API client infrastructure.

- Keep request helpers, interceptors, and client initialization here.
- Do not add feature-specific queries or domain behavior here.

## Structure

- `src/utils/` for API client utilities.
- `src/types/` for package-local shared types.
- Keep package root files limited to final entrypoints only.

## Entrypoints

- `src/index.ts` is the only public entrypoint for this package because the API surface is platform-agnostic.
- Do not add `index.web.ts` or `index.native.ts` unless the package truly gains platform-specific behavior.
- Once the package has platform-specific entrypoints, all exports must be duplicated across them to maintain a consistent API surface and `src/index.ts` should be removed.

## Rules

- All exports must be explicit.
- No intermediate barrels inside `src/`.
- File names must reflect reality; do not add generic proxy files that only forward one platform implementation.
- Package dependencies must declare every direct external import.
