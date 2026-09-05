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
- Return a versioned, cursor-paginated `FeedPageDto` containing ordered,
  semantic recommendation batches. Ticket #898 starts with a deterministic
  `listings` batch (`reason: deterministic_recent`); later tickets can add
  batch forms without making clients infer meaning from flat rows. The API
  owns composition, topic steering, deduplication, and exhaustion.
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

## Deterministic recommendation contract

The initial batch is eligible only when the listing is published, not deleted,
top-level, in a supported listing format, and attached to an active scholar.
It is ordered by `createdAt DESC, slug DESC`, with a cursor containing both
values so equal timestamps cannot duplicate or skip listings. The optional
`topic` query steers the initial batch to that topic and supplies a localized
typed title context; clients preserve the returned batch and item order.

## Consequences

The endpoint now exposes a versioned semantic batch contract. Existing
consumers must not flatten or reorder batches to recreate ranking. Native and
web clients share the same authoritative composition. A future personalized
feed may add identity- and event-backed ranking, but that is not implicitly
introduced by this decision.

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
