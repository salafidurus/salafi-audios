# ADR 0002: Make Explore a continuous discovery feed

## Status

Accepted

## Context

Explore was previously treated as a recent-listings catalog with visible
search and filter controls. That makes the user formulate a query before the
surface can help them discover anything, and it produces a monotonous stream of
listing cards.

The existing feed contract already supports typed listing, Scholar-row, and
Topic-row items, but the API only populated listing items. The web client also
had enough presentation primitives to render a mixed feed, while the API had
the authoritative relationships needed to rank content by Topic and Scholar.

## Decision

- Repurpose `GET /listings/recent` as the Explore discovery endpoint. The route
  remains stable, but its response is now a discovery feed rather than a
  promise of chronological recency.
- Return a cursor-paginated `FeedPageDto` containing Listing items and typed
  discovery modules. The API owns composition, topic weighting, deduplication,
  and exhaustion.
- Treat Topic selection as steering: selected-topic content is prioritized,
  while adjacent and serendipitous content remains possible. It is not a
  strict search filter.
- Use one continuous mixed feed. Listing cards and discovery modules share the
  same cursor, while Topic selection steers the stream without creating a
  separate mode or URL-addressable view.
- Define “explored” for this feature as displayed in the current feed session.
  Listening, opening, saving, and completion are separate concepts.
- Do not repeat Listing items after the catalog is exhausted. Return an
  explicit exhausted state after available discovery modules are consumed.

## Consequences

The endpoint no longer guarantees newest-first ordering. Existing consumers
must use the typed feed union and must not assume every item is a Listing.
Native and web clients can share the same authoritative composition. A future
personalized feed may add identity- and event-backed ranking, but that is not
implicitly introduced by this decision.

## Alternatives considered

### Add a second `/explore/discovery` endpoint

Rejected because it would leave two competing public feed contracts and make it
unclear which one clients should use. The existing route is already the
Explore feed seam and can evolve without changing its public purpose.

### Keep `/listings/recent` chronological

Rejected because chronology is only one possible discovery strategy and cannot
support Scholar/Topic modules or topic steering without a second endpoint.

### Assemble the feed in each client

Rejected because ranking, deduplication, cursor stability, and exhaustion would
diverge between web and native clients.
