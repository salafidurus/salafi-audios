# `@sd/core-analytics` guidance

This package owns provider-neutral product-event values and privacy validation
shared by API, web, and native runtimes. Keep event values immutable and free
of vendor SDK types, persistence, transport, and application business logic.

Use strict discriminated event schemas. Authenticated identity must remain
pseudonymous, content references must use public slugs, and forbidden personal
or exact-location fields must fail validation. Add public behavior tests with
contract changes and document meaningful semantic fields with TSDoc.
