# AGENT.md - packages/i18n

This package handles internationalization logic and translation keys for the Salafi Durus platform.

## Core responsibilities

- Define supported locales (`en`, `ar`, etc.).
- Provide type-safe translation keys and interpolation logic.
- Ensure consistent text rendering across web and mobile.

## Rules

- Do not hardcode text strings in components; always use translation keys.
- Updates to keys must be propagated to all client apps.
- Keep the package pure; avoid framework-specific dependencies (Next.js/Expo) where possible to maximize sharing.

## Path aliases

- Use `@/` for package-local imports (maps to `src/*`).

## Commands (root)

- Lint: `pnpm --filter i18n lint`
- Test: `pnpm --filter i18n test`
- Typecheck: `pnpm --filter i18n typecheck`
