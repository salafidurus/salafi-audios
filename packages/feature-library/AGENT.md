# AGENT.md - `@sd/feature-library`

## Purpose

`@sd/feature-library` owns personal library screens and library-specific presentation logic.

## Rules

- App route files may handle auth gating, but screen UI belongs here.
- Keep screen files assembly-oriented.
- Use explicit platform file suffixes and explicit export names.
- This package has a real platform split, so use `index.web.ts` and `index.native.ts`.
- No intermediate barrels.
