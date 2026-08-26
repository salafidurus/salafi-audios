# ADR 0006: Establish a staged production complexity budget

## Status

Accepted

## Context

The repository already uses Oxlint across its applications and shared
packages, but it did not enforce a common maximum cyclomatic complexity for
production functions. Without a bounded metric, branch-heavy functions could
grow without a visible review or validation signal.

## Decision

Use Oxlint's `eslint/complexity` rule as an error with the `modified` variant
and an initial maximum of 100 for production source. Apply the same policy
through the root, web, native, and shared-package Oxlint configurations.

Exclude tests, generated output, migrations, scripts/tooling, and
configuration files. Permit framework exceptions only when an incompatibility
is demonstrated and the exception is documented with an owner. Ordinary
production code must be refactored rather than suppressed.

Ratchet the maximum only after zero violations at the current stage, using
`100 → 50 → 25 → 15 → 10 → 7 → 5`. Each stage remains a separate, behavior-
preserving implementation slice with lint, typecheck, focused tests, and
applicable integration or end-to-end validation.

## Consequences

New and changed production functions receive an immediate, visible complexity
limit while the permissive initial ceiling avoids an unsafe repository-wide
rewrite. The staged process makes future complexity debt measurable and
reviewable. Configuration must remain synchronized across the root, web, and
native Oxlint entrypoints.
