# ADR 0012: Keep recommendation selection and projection domain-specific

## Status

Accepted

## Context

Explore and the root Scholars feed both return ordered recommendation batches,
but they do not represent the same product behavior. Explore is a continuous,
mixed discovery feed with Listing-keyset continuation. Scholars is an ordered
sequence of semantic batches for Allamah Scholars, Scholar Listings, and
Topic-Scholars. Treating their shared Nest container as a shared recommendation
model would hide those differences and make future changes harder to localize.

The recommendation implementations also need to select candidates without
depending on request locale or public response DTOs. The consuming module is
the authority for hydrating references, applying locale fallback, and mapping
the result into its public contract. This keeps recommendation policy
replaceable without coupling it to presentation.

## Decision

- Keep `RecommendationModule` as an internal Nest composition container. It
  owns provider wiring only; it has no controller, public DTO, shared ranking
  policy, or generic pagination contract.
- Keep two independent recommendation seams:
  `ExploreRecommendationService` and `ScholarsRecommendationService`.
  Each seam owns its domain's selection, eligibility, ordering, continuation,
  deduplication, and exhaustion behavior.
- Recommendation selection returns reference-only batches. References carry
  the semantic identity and ordering needed by the consuming module, but do
  not contain locale-aware presentation data or public response objects.
- Keep projection in the consuming module. Explore hydrates and maps into
  `FeedPageDto`; Scholars hydrates and maps into `ScholarPageFeedDto`. Projection
  must replay supplied batch and item order, omit stale or ineligible
  references, omit empty hydrated batches, and apply locale fallback locally.
- Use symmetric `explore-recommendation` and `scholars-recommendation` naming
  for internal repositories, engines, services, tests, and types. Preserve
  the public `ScholarPageFeedDto` name because it is an existing API contract.
- Keep adapter replacement domain-specific. A deterministic, ML, or hybrid
  adapter may replace selection within Explore or Scholars without requiring
  the other domain to adopt its candidate model, ranking meaning, or
  continuation state.
- Extract shared Catalog eligibility only for predicates proven identical in
  both domains. Domain-specific format, title, topic, batch identity, ranking,
  and continuation rules remain local.

## Domain-specific continuation

Explore uses the stable Listing ordering `(createdAt DESC, slug DESC)` and an
opaque cursor containing the complete keyset. A malformed cursor is an
explicit invalid request and does not restart the first page. Its initial
discovery batches remain part of the continuous feed lifecycle.

Scholars uses an opaque cursor anchored to the last emitted semantic batch. The
sequence is planned from current Catalog state, repeated references are
removed within each batch, and a missing continuation anchor produces an
exhausted empty page rather than silently restarting. The same entity may
remain in different batches when its semantic context is meaningful.

Clients do not decode either cursor, reconstruct recommendation context, rank
items, or deduplicate results. They render the server-provided order and
preserve the public response contracts.

## Consequences

Selection policy can evolve independently from locale-aware presentation, and
each recommendation area has a focused test surface. The API remains the sole
authority for eligibility, ordering, continuation, and exhaustion across web
and native clients.

The architecture intentionally accepts two similar-looking seams because the
domains have different semantics. Removing either implementation should force
substantial domain policy back into its caller; removing the Scholars
projection should force locale-aware semantic-batch mapping back into the
broad Scholars persistence module.

## Alternatives considered

### Create one generic recommender

Rejected. A shared recommender would imply one candidate model, ranking
meaning, or continuation protocol and would blur the distinction between a
continuous Explore feed and the semantic Scholars sequence.

### Create one generic paginator

Rejected. Explore requires Listing keyset continuation, while Scholars
continues a semantic batch sequence. A common paginator would conceal the
meaning of each cursor and its exhaustion rules.

### Hydrate recommendations inside the recommendation module

Rejected. Locale resolution and public DTO construction belong to the caller
that owns the public surface. Keeping them separate allows stale references to
be omitted without making selection depend on presentation details.

## Relationship to existing decisions

ADR 0002 remains authoritative for Explore as a continuous semantic discovery
feed. This decision extends its selection/projection ownership pattern to root
Scholars without making Scholars an Explore variant or changing either public
contract.
