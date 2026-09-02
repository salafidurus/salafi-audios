# `@sd/core-contracts` guidance

This package owns stable shared DTOs, endpoints, query infrastructure, and HTTP
contracts. Feature behavior belongs in `@sd/domain-*` packages.

Import shared DTOs from this package. When an API response shape changes, update
the hand-written contract types and affected query infrastructure together.
Keep contracts minimal, immutable where appropriate, and free of business logic.
