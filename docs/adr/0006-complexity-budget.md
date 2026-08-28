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
and a maximum of 7 for production source. Apply the same policy through the
root, web, native, and shared-package Oxlint configurations.

Exclude tests, generated output, migrations, scripts/tooling, and
configuration files. Permit framework exceptions only when an incompatibility
is demonstrated and the exception is documented with an owner. Ordinary
production code must be refactored rather than suppressed.

The maximum was lowered through staged, behavior-preserving refactors from an
initial budget of 100 to 7. Each reduction required zero violations at the
active stage, lint, typecheck, focused tests, and applicable integration or
end-to-end validation. The project retains 7 while a lower threshold would
require decomposition that makes cohesive flows less clear.

## Consequences

New and changed production functions receive an immediate, visible complexity
limit while the staged process makes future complexity debt measurable and
reviewable. The selected budget is strict enough to expose branch-heavy code
while leaving cohesive multi-state flows intact. Configuration must remain
synchronized across the root, web, and native Oxlint entrypoints.
