# `apps/api` guidance

The API is authoritative for business rules, authorization, and state
transitions. Validate authorization and input before side effects.

Keep the layering explicit:

1. Interface: controllers, DTO validation, and guards.
2. Application: use-case orchestration and transactions.
3. Domain: invariants and transition rules.
4. Infrastructure: persistence, media, and external adapters.

Controllers do not own persistence or business decisions. Catalog reads may be
public; protected writes and editorial transitions require backend authorization.

Keep contracts explicit and intent-driven. Shared web/native DTOs belong in
`@sd/core-contracts`; API-only DTOs remain local. Persist authoritative
relational state in the database and store media references, not blobs.

Tests should emphasize domain invariants, authorization boundaries, transition
semantics, and regressions.
