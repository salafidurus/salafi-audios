# AGENT.md - `@sd/core-styles`

## Purpose

`@sd/core-styles` owns shared styling infrastructure such as breakpoints and Unistyles bootstrap.

## Structure

- `src/utils/` for style setup helpers and shared constants.
- `src/components/` for renderable helpers such as style wrappers.
- `src/types/` for package-local shared types.

## Entrypoints

- This package has a real platform split, so use `src/index.web.ts` and `src/index.native.ts`.
- Do not add a plain `src/index.ts` unless the public surface becomes fully shared.

## Naming Rules

- Shared values like breakpoints use plain `.ts`.
- Web-only render helpers use explicit names like `UnistylesStyleDesktopWeb`.
- Do not keep duplicate files like `breakpoints.native.ts` when the contents are shared.

## Rules

- No intermediate barrels.
- Do not hide web-only setup behind generic root exports.
