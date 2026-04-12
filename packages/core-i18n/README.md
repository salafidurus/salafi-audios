# @sd/core-i18n

> Internationalization keys and locale infrastructure for the Salafi Durus platform

## Purpose

Owns all translation keys and locale definitions used across the platform. Keeps i18n
logic in one place so both `apps/web` and `apps/native` pull from a single source of truth
for every user-facing string.

## Boundaries

- **Depends on:** `i18next`, `@sd/core-contracts`
- **Consumed by:** `apps/api`, `apps/web`, `apps/native`, transitional `apps/mobile`

Do not hardcode text strings in components in any app or package. Always reference a key
from this package. Keep this package framework-agnostic:

- No JSX providers or app-level UI components in `packages/core-i18n`
- No Next.js or Expo-specific bootstrapping in this package
- App-specific provider wiring belongs in `apps/web/src/core/` and `apps/native/src/core/`

## Entrypoints

```text
src/
└── index.ts    # Single public entrypoint — exports shared locale/runtime helpers
```

The package exports locale identifiers, locale utilities, i18next initialization helpers,
and language-storage helpers. Apps own their i18n runtime setup, provider wiring, and React
hook bindings.

## Key Commands

- `pnpm --filter core-i18n build` — Build the package
- `pnpm --filter core-i18n typecheck` — Type check
- `pnpm --filter core-i18n lint` — Lint
- `pnpm --filter core-i18n test` — Run tests

## Known Constraints

- **Key propagation is manual.** Adding or renaming a key requires updating all consuming
  apps. There is no automated sync — missing key usages will surface as type errors if types
  are kept strict.
- **Locale coverage is defined here.** Supported locales (`en`, `ar`, etc.) are declared in
  this package. Adding a locale requires updating both the key structure and any locale-switch
  UI in each app.
- **Framework adapters live in apps, not here.** The translation runtime (pluralisation,
  interpolation, RTL layout) is the responsibility of each app's i18n setup.
- **Provider ownership lives in apps.** `I18nextProvider` wrappers belong in app bootstrap
  code so this package stays safe to consume from non-UI workspaces such as `apps/api`.

## Related Docs

- `docs/README.md` — overall system orientation
- `docs/architecture.md` — monorepo layout and dependency rules
