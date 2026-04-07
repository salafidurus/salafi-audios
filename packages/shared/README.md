# @sd/shared

> Cross-platform UI primitives, hooks, and utilities shared across web and mobile

## Purpose

Provides domain-agnostic building blocks — screen wrappers, buttons, text inputs, list components, and platform hooks — consumed by feature packages and apps. Every export is explicitly platform-tagged so consumers always import the correct variant.

## Boundaries

- **Depends on:** `@sd/core-contracts`, `@sd/core-styles`, `@sd/design-tokens`, `@tanstack/react-query`, `lucide-react` / `lucide-react-native`, `react-native-reanimated`, `zustand`
- **Consumed by:** `apps/web`, `apps/mobile`, all `feature-*` packages

## Structure

```
src/
├── components/         # Platform-split UI primitives
│   ├── Button/         #   ButtonDesktopWeb, ButtonMobileNative
│   ├── ScreenView/     #   ScreenViewWeb, ScreenViewMobileNative
│   ├── TextInput/      #   TextInputWeb, TextInputMobileNative
│   ├── AppText/        #   AppTextWeb, AppText (native)
│   ├── UniversalList/  #   FlashList (native) / div-based (web)
│   └── ...             #   AccentGradientFill, AuthRequiredState, etc.
├── hooks/              # useResponsive (web), useHaptic (native), useDragScroll (web)
├── utils/              # Formatting helpers
├── assets/fonts/       # Bundled font files (Manrope, Fraunces, GeistMono)
├── compat/             # Web shims for native-only exports
├── index.web.ts        # Web entrypoint
└── index.native.ts     # React Native entrypoint
```

## Key Commands

- `pnpm --filter shared build` — Build the package
- `pnpm --filter shared typecheck` — Type check

## Constraints

- **Must stay domain-agnostic.** If a component becomes domain-specific, move it to the relevant `@sd/feature-*` package.
- Platform-bound exports use explicit names: `ButtonMobileNative`, `ButtonDesktopWeb`, `AuthRequiredStateResponsive`.
- Web-only hooks must not appear in `index.native.ts`; native-only hooks must not appear in `index.web.ts`.
- No intermediate barrel files inside `src/`.
