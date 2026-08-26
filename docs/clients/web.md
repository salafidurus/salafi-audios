# Web Application

## 1. Role of the Web App

The web app (`apps/web`) serves public discovery, authenticated account flows,
and the primary browser-based administration surface. It is a backend client,
not an authority in its own right.

## 2. Structure

### Workspace vocabulary

The web client has two presentation workspaces over the same authenticated
identity:

- **Public workspace**: discovery, listening continuity, Library, account, and
  support surfaces.
- **Admin workspace**: editorial, catalog, user-access, and operational
  surfaces available to Users with backend-recognized administrative access.

The workspace boundary is a navigation and orientation boundary, not a
security boundary. The API remains authoritative for every protected route and
action. A User may enter the Admin workspace while still seeing only the
sections allowed by their capabilities and scope.

### Public navigation glossary

- **Public primary navigation**: the persistent content destinations Home,
  Explore, Scholars, and Library. It excludes Settings and administrative
  actions.
- **Utility actions**: account, theme, language, search, and capability-aware
  Admin actions that support the public workspace without becoming catalog
  destinations.
- **Public navigation shell**: the contained, sticky, single-layer header that
  frames public content. It is presentation, not an authorization boundary.
- **Compact navigation**: the icon-first header and Sheet composition used when
  the desktop zones no longer fit without overlap.
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

Explore is a discovery-first feed rather than a query/results screen. It is one
continuous mixed stream of listing cards and discovery modules, with Topic
steering as its only primary mode. Advanced refinements remain available behind
a Sheet and are not the main Explore canvas. The API owns the mixed feed
composition, relevance, deduplication, cursor, and exhaustion decisions.

Topic is URL-addressable so discovery paths can be shared and restored. Topic
state may persist in browser storage until explicitly cleared, scoped by route,
locale, and User where relevant. The client must never infer personalized
discovery from listening history until a
separate event contract defines that behavior.

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

- Account, settings, support, and library flows for signed-in users.
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
