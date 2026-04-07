# @sd/feature-navigation

> App navigation chrome — sidebar, tab bar, header, and footer

## Purpose

Owns all navigation UI components (sidebar, custom tab bar, header, footer, top auth strip) and route configuration. Web and mobile get different navigation chrome through platform-split entrypoints while sharing route constants and section definitions.

## Boundaries

- **Depends on:** `@sd/core-contracts`, `@sd/core-api`, `@sd/core-auth`, `@sd/core-config`, `@sd/core-styles`, `@sd/design-tokens`, `@sd/shared`, `zustand`, `lucide-react` / `lucide-react-native`, `react-native-reanimated`
- **Consumed by:** `apps/web`, `apps/mobile`

## Structure

```
src/
├── components/
│   ├── sidebar/            # Web sidebar navigation
│   ├── header/             # App header
│   ├── footer/             # Web footer
│   ├── CustomTabBar/       # Mobile tab bar
│   ├── SubsectionBarHost/  # Subsection navigation
│   └── top-auth-strip/     # Auth status strip
├── store/                  # Navigation state (Zustand)
├── utils/                  # Route helpers, icon maps, section config
├── api/                    # Public stats API (desktop web)
├── types.ts                # Shared navigation type contracts
├── index.web.ts            # Web entrypoint
└── index.native.ts         # React Native entrypoint
```

## Key Commands

- `pnpm --filter feature-navigation build` — Build the package
- `pnpm --filter feature-navigation typecheck` — Type check

## Constraints

- Web-only chrome (`Sidebar`, `Footer`, `TopAuthStrip`) must **not** be exported from `index.native.ts`.
- Shared constants and types must live in plain `.ts` files, not `.native.ts`.
- Icon maps and route constants belong in `utils/` or `types.ts`, not inline in components.
- No intermediate barrel files.
