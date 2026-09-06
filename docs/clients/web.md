# Web Application

## 1. Role of the Web App

The web app (`apps/web`) serves public discovery, authenticated account flows,
and the primary browser-based administration surface. It is a backend client,
not an authority in its own right.

## 2. Structure

### Workspace vocabulary

The web client has two presentation workspaces over the same authenticated
identity:

- **Public workspace**: discovery, listening continuity, My Library, account, and
  support surfaces.
- **Admin workspace**: editorial, catalog, user-access, and operational
  surfaces available to Users with backend-recognized administrative access.

The workspace boundary is a navigation and orientation boundary, not a
security boundary. The API remains authoritative for every protected route and
action. A User may enter the Admin workspace while still seeing only the
sections allowed by their capabilities and scope.

### Public navigation glossary

- **Public primary navigation**: the persistent content destinations Home,
  Explore, Scholars, and My Library. It excludes Settings and administrative
  actions.
- **Utility actions**: account, theme, language, search, and capability-aware
  Admin actions that support the public workspace without becoming catalog
  destinations.
- **Public navigation shell**: the contained, sticky, single-layer header that
  frames public content. It is presentation, not an authorization boundary.
- **Compact navigation**: the icon-first header and Sheet composition used on
  mobile widths; non-mobile widths retain the full public header.
- **Public shell**: the reusable public navigation, fallback/content area, and
  footer composition. It is the visible shell for normal public routes and
  normal fallback states; consent-only side effects are composed outside it.
- **Normal not-found state**: the localized branded 404 rendered inside the
  public shell when a route is missing.
- **Shell-unavailable fallback**: the deliberately minimal recovery boundary
  used when the public shell itself cannot safely render.
- **Admin workspace**: the distinct contextual presentation for administrative
  routes. Its visible destinations are filtered by backend-derived capability,
  while backend authorization remains authoritative.
- **Normal not-found state**: the localized, theme-aware branded 404 rendered
  inside the public navigation shell.
- **Shell-unavailable fallback**: the provider-independent emergency 404 used
  when the public navigation shell cannot render. It uses only static recovery
  content, a plain home link, and browser reload behavior.

Explore is a discovery-first feed rather than a query/results screen. It is one
continuous mixed stream of listing cards and discovery modules. Recommendation
context is owned by the API: the web client renders the returned batches and
does not submit a client-selected topic or persist topic-steering state. The
API owns the mixed feed composition, relevance, deduplication, cursor, and
exhaustion decisions.

Topic batches may still appear as semantic discovery modules in the response,
but they are presentation data rather than a client-controlled Explore mode.
The client must never infer personalized discovery from listening history until
a separate event contract defines that behavior.

### Layered Structure

- **Composition (`apps/web/src/app`)**: App Router routes, layouts, metadata, and route-level composition.
- **Features (`apps/web/src/features/`)**: app-local feature slices — each owns screens, components, hooks, and utils.
- **Core (`@sd/core-*`)**: auth, API access, styling, and shared infrastructure.
- **Domain (`@sd/domain-*`)**: shared data and state hooks used across both apps.
- **Shared (`apps/web/src/shared/` and `@sd/shared`)**: app-local primitives and cross-app utilities.

Current route groups include consent-gated public/account routes under
`apps/web/src/app/(main)/(consent)/(non-admin)/`, admin routes under
`apps/web/src/app/(main)/(consent)/(admin)/admin/`, legal routes under
`apps/web/src/app/(main)/(no-consent)/(legal)/`, and the OAuth callback at
`apps/web/src/app/auth/callback/page.tsx`.

### Structural Rules

- Keep routing, layout, and metadata concerns in `app/`.
- Keep business logic out of route handlers and components where possible.
- Treat `app/api/` as thin integration surface only when needed, not as a second backend.

## 3. Public Discovery Responsibilities

- Stable, semantic routes for discoverability and linking.
- SEO-oriented rendering and metadata.
- Fast initial load and clear navigation through published content.
- Shareable content surfaces with Open Graph and other metadata.

## 4. Authenticated and Editorial Responsibilities

- Account, settings, support, and My Library flows for signed-in users.
- Editorial/admin flows for content, scholars, users, and stats, gated by
  backend-enforced roles.
- Bulk workflows may exist on web for usability, but all policy remains server-side.

## 5. Data Fetching and Authority

- The web app consumes the backend through shared contracts.
- It may use server rendering, client fetching, or hybrid patterns for performance.
- It must not duplicate authorization or content-state decisions in the UI.

## 6. Web Playback Boundaries

- Web playback is streaming-first.
- Offline download support is not a web responsibility.
- Any listening continuity synced from the web remains subject to backend authority.

## 7. Differences from Mobile

- Web prioritizes discoverability, SEO, and editorial workflows.
- Mobile prioritizes listening continuity and device-local persistence.
- Both consume the same backend contracts and must converge on the same authoritative rules.

## 8. Theming

- Tokens come from `@sd/design-tokens` and are emitted as CSS variables by
  `apps/web/src/app/theme-css.ts` (light and dark variants), applied on `<html>` via `data-theme`.
- Web supports exactly three theme preferences: `system`, `light`, and `dark`.
- The preference is persisted under `theme-preference:v1`; `ThemeSync.tsx` applies
  the resolved `data-theme` and `.dark` class, while the layout bootstrap script
  applies the same state before the first paint.
- Shared design tokens and native Unistyles themes expose the same light/dark
  palette pair. System mode follows browser or operating-system appearance changes.

The shadcn foundation is configured in `apps/web/components.json`;
its `ui` alias points to the existing `src/shared/components` boundary. Semantic
Tailwind roles (`background`, `primary`, `destructive`, `ring`, and related
roles) map to the emitted design-token variables in `src/app/globals.css`.
`ThemeSync` keeps the document `data-theme` attribute and `.dark` class
synchronized so Tailwind `dark:` utilities follow the same state as the
CSS-variable themes.

## 9. Browser E2E boundary

Web browser journeys run through the production-built application using native
`Bun.WebView` and `bun:test`, as recorded in [ADR 0007](../adr/0007-bun-webview-browser-e2e.md).
The browser boundary is Chromium-only. `Bun.WebView` is experimental and on
Linux requires an installed Chrome-family executable.

The repository-owned harness creates an isolated browser profile for each
journey, waits for explicit application conditions, and removes the browser
profile and server after success or failure. A failed journey records its test
identity, URL, screenshot, DOM snapshot, console output, and error.

Use **browser journey** for a user-visible flow at the running web application
boundary. Use **web unit test** for component or DOM-environment behavior, and
use **API E2E** for HTTP behavior at the backend boundary. These terms are not
interchangeable, and browser journeys must not reach into React component
internals or backend persistence.
