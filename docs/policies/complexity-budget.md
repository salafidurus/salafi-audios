# Complexity Budget Policy

## Purpose

The repository uses a bounded cyclomatic-complexity budget so production
functions remain understandable and behavior-preserving refactors stay
reviewable. Oxlint is the only complexity enforcement system.

## Scope

The active budget applies to production source under `apps/*/src` and
`packages/*/src`, including application and shared-package code. Oxlint
enforces `eslint/complexity` as an error using the `modified` variant, which
counts a switch statement as one additional path regardless of its case count.

The budget excludes tests and end-to-end tests, generated output, database
migrations, scripts and tooling, and configuration files. Framework-required
entrypoints remain in scope unless a later scan demonstrates a genuine,
documented incompatibility.

Boolean operators, default values, optional chaining, conditional expressions,
and other paths counted by Oxlint are part of the metric. Complexity is not a
proxy for naming, file size, switch readability, or architectural layering.

## Ratchet

The initial maximum is **100**. The budget may only decrease after a complete
scan reports zero violations at the current maximum:

```text
100 → 50 → 25 → 15 → 10 → 7 → 5
```

Each reduction is a separate implementation ticket or clearly bounded refactor
batch. Every ticket records the measured violation count and affected
functions before and after the change. The preferred final maximum is 5; 7 or
10 may be retained when reaching 5 consistently produces less clear code.

## Exceptions

Ordinary production violations require behavior-preserving refactoring.
Suppressions are not permitted for domain logic, authorization, validation,
data fetching, or ordinary UI orchestration. A suppression is allowed only for
a rare generated or framework-required shape when the reason, owner, and
review date are documented with the suppression.

## Validation contract

Complexity enforcement runs through the existing Oxlint workspace commands,
Turbo validation, CI, and pre-push validation. A complexity refactor is not
complete after lint alone. It must also pass the affected workspace's
typecheck, focused behavioral tests, and applicable integration or end-to-end
checks. Before each ratchet, run the complete applicable validation pipeline
and confirm zero violations at the active maximum.
