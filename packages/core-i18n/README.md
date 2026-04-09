# @sd/core-i18n

> Internationalization keys and locale infrastructure for the Salafi Durus platform

## Purpose

Owns all translation keys and locale definitions used across the platform. Keeps i18n
logic in one place so both `apps/web` and `apps/mobile` pull from a single source of truth
for every user-facing string.

## Boundaries

- **Depends on:** none (leaf package — no workspace dependencies)
- **Consumed by:** `apps/web`, `apps/mobile`

Do not hardcode text strings in components in any app or package. Always reference a key
from this package. Do not import framework-specific i18n libraries (e.g., `next-intl`,
`expo-localization`) here; keep this package framework-agnostic so both apps can share it.

## Entrypoints

```text
src/
└── index.ts    # Single public entrypoint — exports locale definitions and key namespaces
```

The package exports locale identifiers and structured key namespaces. Apps wire these keys
into their own i18n runtime (e.g., `next-intl` on web, `expo-localization` on mobile).

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

## Related Docs

- `docs/README.md` — overall system orientation
- `docs/architecture.md` — monorepo layout and dependency rules
