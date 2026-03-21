# AGENT.md - `@sd/feature-live`

## Purpose

`@sd/feature-live` owns live-section screens and live-specific presentation logic.

## Rules

- Native and web screens must be explicit in both filename and export name.
- Do not leave route-facing UI in app route files.
- This package has a real platform split, so use `index.web.ts` and `index.native.ts`.
- No intermediate barrels.
