# ADR 0013: Coordinate backend analytics delivery in the primary database

## Status

Accepted

## Context

Backend-confirmed product outcomes such as registration, audio completion, and
save transitions are produced by mutations to authoritative application state.
The analytics archive is intentionally isolated and append-only. Writing the
archive directly inside a request transaction would couple business latency and
availability to the analytics database, while writing an intent only after the
business mutation could lose the event between those operations.

## Decision

Persist an `AnalyticsDispatchIntent` in the primary database in the same
transaction as the authoritative mutation. A short-lived dispatcher claims due
intents with leases, translates them into the canonical product-event contract,
and appends them to the analytics archive using the intent's stable event ID.

The primary database owns the intent status (`pending`, `processing`,
`delivered`, or `dead_letter`), retry count, lease, and last error. The
analytics database owns the permanent canonical event archive and deduplicates
repeated deliveries by event ID and payload fingerprint.

User registration is covered by a primary-database trigger because the Better
Auth user insert is the authoritative registration mutation. Progress and
favorite transitions are appended by their application repositories so the
intent participates in the same Prisma transaction as the state change.

## Consequences

- A committed user-facing mutation has a durable delivery intent even if the
  API process stops before the dispatcher runs.
- Analytics database outages do not fail the user mutation; delivery retries
  with bounded exponential backoff.
- Missing content identity, unsupported event names, and archive ID conflicts
  become terminal dead letters requiring operational review.
- The primary database carries temporary delivery coordination data, while the
  analytics database remains the long-term event archive.

## Alternatives rejected

- **Write directly to the analytics database in the request:** couples product
  mutations to analytics availability and adds latency to user actions.
- **Put the outbox table in the analytics database:** cannot be atomically
  committed with primary application state.
- **Publish only through an in-memory queue:** process termination can lose a
  confirmed product outcome.
