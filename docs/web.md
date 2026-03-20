# Web Application

## 1. Role of the Web App

The web app (`apps/web`) serves two roles: public discovery and authenticated account or editorial workflows. It is a backend client, not an authority in its own right.

## 2. Structure

### Layered Structure

- **Composition (`apps/web/src/app`)**: App Router routes, layouts, metadata, and route-level composition.
- **Features (`@sd/feature-*`)**: domain-oriented UI and hooks.
- **Core (`@sd/core-*`)**: auth, API access, styling, and shared infrastructure.
- **Shared (`@sd/shared`)**: reusable primitives and utilities.

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

- Account and library flows for signed-in users.
- Editorial/admin flows gated by backend-enforced roles.
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
