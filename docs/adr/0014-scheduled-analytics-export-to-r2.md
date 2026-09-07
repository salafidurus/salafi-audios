# ADR 0014: Scheduled analytics export to private R2

## Status

Accepted

## Context

The owned PostgreSQL analytics archive needs durable Parquet artifacts for
offline analysis and ML preparation. Exports must be private, resumable, and
safe across multiple API replicas without an operator-triggered job.

## Decision

The API's existing Nest scheduler runs an hourly export into a dedicated
private Cloudflare R2 bucket. The analytics database remains authoritative.
Each run records immutable parameters, leases, an `(received_at, event_id)`
keyset cursor, checksums, and a final manifest. The first activation watermark
is the lower bound, so historical backfills are intentionally unsupported.

Raw canonical-envelope Parquet parts and versioned derived ML parts use
separate prefixes. Derived labels come only from explicit exposure,
interaction, and confirmed-outcome events; silence, skips, and missing events
are not inferred as negative labels.

Authenticated pseudonyms are linked to users only through a primary-database
`AnalyticsIdentityLink`. Account deletion removes that link while retaining
the unlinkable archive and R2 artifacts.

## Consequences

R2 credentials and bucket policy must be provisioned per environment. No
public endpoint, CLI, or admin action is required to operate exports. A
changed range, watermark, format, or transformation creates a new run rather
than mutating a completed artifact.
