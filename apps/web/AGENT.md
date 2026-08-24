# `apps/web` guidance

The Next.js web app is a client of the backend, not an authority. Keep business
rules, authorization, and state transitions in the API; UI gating is only a
convenience.

Feature code lives in `src/features/`; primitives shared by multiple web
features live in `src/shared/`. Import shared contracts and domain behavior
from `@sd/core-*` and `@sd/domain-*`; do not create app-to-app dependencies.

Use the unified responsive approach documented in `docs/clients/web.md`.
Prefer CSS Modules and semantic design tokens from `@sd/design-tokens`; use
`@base-ui/react` and existing shared primitives for accessible controls.
Preserve localization, RTL, theme, keyboard, and screen-reader behavior.

Keep route files thin and feature components testable. Web tests use the web
package scripts and Playwright for E2E; do not run the root test runner in place
of the package setup.
