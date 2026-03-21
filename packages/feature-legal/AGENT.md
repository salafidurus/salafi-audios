# AGENT.md - `@sd/feature-legal`

## Purpose

`@sd/feature-legal` owns reusable legal and policy screens.

## Rules

- Keep privacy and terms screens package-owned.
- Preserve explicit platform naming for any platform-bound implementation.
- Use the package root entrypoints only; no internal barrels.
- This package has a real platform split, so use `index.web.ts` and `index.native.ts`.
