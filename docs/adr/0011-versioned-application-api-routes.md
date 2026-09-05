# ADR 0011: Versioned application API routes

## Status

Accepted as the foundation for the versioned application API.

## Context

The API serves public catalog and discovery, authenticated personal state,
playback and synchronization, and editorial/admin behavior to independently
released web, native, and server-rendered clients. Those business routes were
previously exposed without a compatibility namespace, while health, operations,
documentation, sitemap, robots, and Better Auth have separate consumers and
lifecycle expectations.

Introducing a route version only after a breaking change would force an urgent
client migration. The service has no production traffic, so the initial
versioned boundary can be adopted as a clean cutover.

## Decision

NestJS URI versioning is the runtime mechanism. Every business controller is
explicitly assigned route version `1`, producing the canonical `/v1/...`
application namespace. The API does not configure a default version and does
not retain unversioned compatibility aliases; an unversioned business request
is unsupported and does not silently resolve to `v1`.

Health and readiness probes, Swagger UI and its document endpoint, sitemap,
robots, and the separately mounted Better Auth `/api/auth/*` handler remain
outside the application API version. They are version-neutral routes with
independent compatibility lifecycles.

The route/API version is distinct from an individual response `schemaVersion`,
the package version, deployment version, and OpenAPI document metadata. OpenAPI
describes the `/v1` paths but does not provide runtime route versioning by
itself.

## Consequences

- Future incompatible application behavior has a clear home under a new route
  version such as `v2`.
- Additive changes remain possible within `v1` when existing clients remain
  valid.
- Existing clients must migrate their application request paths as part of
  the initial cutover.
- Request-derived locale cache keys and their mutation invalidation keys include
  `/v1` so cache behavior remains correct.
- Operational and authentication integrations are not coupled to application
  API releases.

## Rejected alternatives

- OpenAPI metadata versioning alone: documentation metadata does not change
  runtime route resolution.
- Header, media-type, or content-negotiation versioning: these obscure the
  compatibility boundary in ordinary request URLs and were not selected for
  this initial API.
- A default version or unversioned aliases: these would hide missed client
  migrations and preserve an unnecessary compatibility surface.
- A deprecation window, Sunset headers, or migration telemetry: there is no
  production traffic requiring an initial compatibility period.
