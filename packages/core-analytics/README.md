# `@sd/core-analytics`

Provider-neutral product-event contracts shared by the API, web, and native
runtimes.

This package owns the immutable canonical event envelope, typed event
authority, event-time context, privacy policy, and validation boundary. It does
not send events, persist them, import a vendor SDK, or implement client
buffering.

## Public boundary

- `ProductEventSchema` validates the supported typed event union.
- `parseProductEvent` validates and deeply freezes a canonical event.
- Event properties use strict per-event allowlists.
- `listing_slug` and `scholar_slug` are the client-safe content references.
- Anonymous identities are resettable; authenticated identities are
  pseudonymous and never raw database user IDs.

The owned event store, HTTP ingestion DTOs, Mixpanel adapter, and runtime
buffering are downstream boundaries and must not be added here.
