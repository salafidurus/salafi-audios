# ADR 0004: Use one client theme model and public content identity

## Status

Accepted

## Context

Web and native clients previously exposed overlapping theme vocabularies and
could render a surface before the intended theme, fonts, or locale direction
were ready. Public Home also combines public Catalog content with a private
listening projection, which must not make anonymous browsing depend on a
personal-state request.

The clients historically used a mixture of internal identifiers and public
slugs when handing content between Catalog, playback, Progress, downloads,
local persistence, and caches. That made the same content addressable by
different identities across the listening flow.

## Decision

- Support exactly three device-local theme preferences: `light`, `dark`, and
  `system`. System resolves to the current browser or operating-system
  appearance and follows later appearance changes.
- Apply the resolved web theme before first paint. Native keeps its startup
  presentation active until fonts, locale direction, and resolved theme state
  are ready.
- Keep public Home Catalog data separate from private personal Progress. Public
  promotions and discovery remain available anonymously; personal Progress is
  requested only after authentication resolves to an authenticated User.
- Define Continue Listening as a Home-only projection of authenticated,
  unfinished Progress. It is absent while that personal query is loading, when
  no unfinished Progress exists, and after `completedAt` is accepted. Local
  playback updates the projection immediately while durable synchronization
  reconciles it with backend state.
- Use `listingSlug`, `topicSlug`, and `scholarSlug` as client-facing public
  identities in contracts, endpoint builders, frontend state, persistence,
  playback handoff, downloads, and cache keys.
- Resolve public slugs to internal database IDs inside the API. Internal IDs
  remain backend implementation details, and an ID-shaped external value is
  treated as an opaque slug rather than triggering an internal-ID fallback.

## Consequences

Theme preference storage and runtime registration have one vocabulary across
web and native, while the resolved light/dark palette remains a platform
implementation detail. Startup readiness is explicit, so clients do not expose
an intermediate theme or direction.

Home can render public discovery for anonymous visitors without requesting
private listening data. Continue Listening remains a presentation of personal
state rather than a second source of authority.

Public slug identity is stable across presentation languages and client
surfaces. Backend repositories may continue using resolved IDs for relational
queries without exposing those IDs through client contracts.

## Verification

Theme, Home, Progress, and slug contracts are covered by focused web, native,
domain, API, and shared-contract tests. Visible startup and Home behavior is
validated through web E2E and native device checks where the platform runtime
is available.
