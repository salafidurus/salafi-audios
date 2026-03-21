# AGENT.md - `@sd/core-auth`

## Purpose

`@sd/core-auth` owns low-level auth client and auth hooks.

- Auth client wiring belongs here.
- App route wrappers and feature auth screens do not belong here.

## Structure

- `src/utils/` for auth client implementations.
- `src/hooks/` for auth hooks.
- `src/types/` for package-local shared types if needed later.

## Entrypoints

- This package has a real platform split, so use `src/index.web.ts` and `src/index.native.ts`.
- Do not reintroduce a plain `src/index.ts` unless the public surface becomes completely platform-agnostic.

## Naming Rules

- Use `.web.ts` for web implementations shared across desktop web and mobile web.
- Use `.native.ts` for mobile native implementations.
- Do not hide native-only or web-only code behind generic filenames like `auth-client.ts`.

## Dependency Rules

- If this package imports `better-auth`, `@better-auth/expo`, or `expo-secure-store`, those must be declared in this package manifest.
