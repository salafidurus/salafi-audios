# AGENT.md - `@sd/feature-auth`

## Purpose

`@sd/feature-auth` owns auth screens and auth-specific presentation logic.

## Structure

- `src/screens/sign-in/`
- `src/screens/sign-up/`
- `src/components/` for reusable auth-specific pieces.
- `src/hooks/`, `src/utils/`, `src/types/` as needed.

## Entrypoints

- This package has a real platform split, so use `src/index.web.ts` and `src/index.native.ts`.
- Do not add a plain `src/index.ts` unless the package becomes fully platform-agnostic.

## Rules

- Do not leave auth screen files loose in `src/`.
- Keep screen names explicit: `SignInMobileNativeScreen`, `SignUpResponsiveScreen`.
- If a screen imports `next/*`, `expo-apple-authentication`, or `react-native-keyboard-controller`, this package manifest must declare those dependencies.
- No intermediate barrels.
