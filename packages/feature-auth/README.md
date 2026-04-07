# @sd/feature-auth

> Authentication screens — sign-in, sign-up, and social provider buttons

## Purpose

Provides the sign-in and sign-up screens with social authentication buttons (Google, Apple). Consumes `@sd/core-auth` for the underlying auth client and hooks, then renders platform-appropriate auth experiences with form validation.

## Boundaries

- **Depends on:** `@sd/core-auth`, `@sd/core-contracts`, `@sd/core-api`, `@sd/core-config`, `@sd/core-styles`, `@sd/design-tokens`, `@sd/shared`, `expo-apple-authentication`, `react-hook-form`, `react-native-keyboard-controller`, `lucide-react` / `lucide-react-native`
- **Consumed by:** `apps/web`, `apps/mobile`

## Structure

```
src/
├── screens/
│   ├── sign-in/        # Sign-in screen variants
│   └── sign-up/        # Sign-up screen variants
├── components/
│   ├── provider-button.web.tsx         # Social auth button (web)
│   └── social-buttons.desktop.web.tsx  # Social button group (desktop)
├── index.web.ts        # Web entrypoint
└── index.native.ts     # React Native entrypoint
```

## Key Commands

- `pnpm --filter feature-auth build` — Build the package
- `pnpm --filter feature-auth typecheck` — Type check

## Constraints

- Auth screens use explicit platform names: `SignInMobileNativeScreen`, `SignUpResponsiveScreen`.
- Do not leave auth screen files loose in `src/` — they must live inside `screens/`.
- Native dependencies (`expo-apple-authentication`, `react-native-keyboard-controller`) must be declared in this package's manifest.
- Low-level auth client logic belongs in `@sd/core-auth`, not here.
- No intermediate barrel files.
