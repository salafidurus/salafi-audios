# ADR 0006: Two-phase dead-code governance

## Status

Accepted

## Context

Static analysis is valuable for finding orphan code and behavior-free tests,
but framework registration, filesystem routes, dynamic imports, public package
exports, and external API consumers are not always visible to a module graph.
Automatically deleting findings during ordinary implementation would therefore
turn uncertainty into unrelated delivery risk.

## Decision

Dead-code governance has two phases:

1. `audit` is report-only and runs before PR preparation. It compares the
   repository baseline with findings introduced by the implementation diff and
   affected dependency graph. Only newly introduced `confirmed-dead` findings
   block PR preparation.
2. `remove` is available only for an approved cleanup ticket and an explicit
   allowlist. It removes only confirmed findings in that scope and records
   before-and-after evidence.

`likely-dead` and `unknown/dynamic` findings are never automatically deleted or
used to block delivery. Public APIs, package exports, documented commands,
operational scripts, framework roots, generated output, migrations, and
documentation remain protected unless separately approved.

## Consequences

Existing debt remains visible without blocking unrelated tickets. Cleanup is
slower than an unrestricted static-analysis fix, but each deletion has an
accountable scope, explicit evidence, and normal repository verification.
