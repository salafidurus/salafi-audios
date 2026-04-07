# @sd/core-auth

> Authentication client and hooks for web and mobile

## Purpose

Provides the low-level auth client wiring (Better Auth integration) and shared auth hooks. Web uses browser-based auth flow; mobile uses `expo-secure-store` for token persistence. Feature-level auth screens and route guards live elsewhere.

## Boundaries

- **Depends on:** `better-auth`, `@better-auth/expo`, `expo-secure-store`, `@sd/core-contracts`, `@sd/design-tokens`
- **Consumed by:** `@sd/feature-auth`, `@sd/feature-navigation`, `apps/web`, `apps/mobile`

## Structure

```
src/
├── utils/              # Auth client implementations (platform-specific)
├── hooks/              # Auth hooks (useSession, useAuth, etc.)
├── types/              # Package-local type definitions
├── index.web.ts        # Web entrypoint
└── index.native.ts     # React Native entrypoint
```

## Key Commands

- `pnpm --filter core-auth build` — Build the package
- `pnpm --filter core-auth typecheck` — Type check

## Constraints

- This package has a **real platform split**: `index.web.ts` and `index.native.ts` — do not reintroduce a plain `index.ts`.
- Use `.web.ts` for web implementations, `.native.ts` for mobile native — don't hide platform-specific code behind generic filenames.
- App route wrappers and auth screens do **not** belong here — those live in `@sd/feature-auth`.
- All native dependencies (`better-auth`, `@better-auth/expo`, `expo-secure-store`) must be declared in this package's manifest.
