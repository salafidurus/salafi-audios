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

## Consequences

- Mixpanel and future sinks consume the canonical value through adapters and
  cannot define the product vocabulary.
- HTTP ingestion and owned persistence remain downstream concerns.
- New event meanings require an explicit schema version or additive evolution.
- Anonymous analytics is limited to pseudonymous, non-sensitive telemetry;
  consent withdrawal and erasure policy remain authoritative for later storage
  and delivery work.
