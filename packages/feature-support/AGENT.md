# AGENT.md - `@sd/feature-support`

## Purpose

`@sd/feature-support` owns support/help screens and support-specific presentation logic.

## Rules

- Keep support UI package-owned and route wrappers thin.
- Use explicit platform file suffixes and explicit export names.
- This package has a real platform split, so use `index.web.ts` and `index.native.ts`.
- No intermediate barrels.
