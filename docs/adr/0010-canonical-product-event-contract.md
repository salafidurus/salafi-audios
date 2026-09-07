# ADR 0010: Canonical provider-neutral product-event contract

## Status

Accepted as the foundation for the Telemetry and Analytics Foundation.

## Decision

Product events use one immutable, provider-neutral envelope shared by the API,
web, and native runtimes. The envelope records application-owned identity,
event name, schema version, occurred and received timestamps, source, platform,
app version, consent, identity, event-time context, public content references,
priority, producer, authority, and typed properties.

Client observations and backend-confirmed outcomes are separate discriminated
authority classes. A client may describe what it observed or requested; only
the backend may describe a confirmed business outcome after authorization and
durable state change.

The canonical value is deeply immutable after validation. Event properties use
strict event-specific allowlists. Raw email, credentials, tokens, cookies,
search text, keystrokes, exact location, and internal user IDs are forbidden.
Geography is limited to country, coarse region, and timezone. Event-time
language fields remain distinct so historical events are not reinterpreted
from a user's current profile.

Recommendation exposure context is represented as metadata—request, surface,
position, candidate set, source, algorithm, experiment, and feature flags—without
coupling the contract to a recommendation implementation.

The discovery vocabulary is specialized and shared by web and native clients:
`explore_opened`, `listing_impression`, `scholar_impression`,
`recommendation_impression`, `listing_clicked`, `scholar_clicked`,
`recommendation_clicked`, `listing_viewed`, `scholar_viewed`,
`search_submitted`, and `search_result_selected`. Clients do not emit a second
generic event for the same observation.

An impression is recorded only when at least 50% of the item remains visible for
one continuous second. Each client deduplicates an impression within the
session by event name, surface, public content slug, candidate-set identity,
and position. Recommendation `request_id` is optional: unavailable request
identifiers are omitted rather than fabricated.

Search submission records an opaque `search_id`, normalized query length, and
selected topic slugs. Raw query text, keystrokes, and result text are never
part of the event. Result selection records the same `search_id`, public
listing identity, and result position.

## Consequences

- Mixpanel and future sinks consume the canonical value through adapters and
  cannot define the product vocabulary.
- HTTP ingestion and owned persistence remain downstream concerns.
- New event meanings require an explicit schema version or additive evolution.
- Anonymous analytics is limited to pseudonymous, non-sensitive telemetry;
  consent withdrawal and erasure policy remain authoritative for later storage
  and delivery work.
