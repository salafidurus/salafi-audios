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

The initial maximum was **100**. The active maximum is **10** after the fourth
ratchet completed with zero violations. The budget may only decrease after a
complete scan reports zero violations at the current maximum:

```text
100 → 50 → 25 → 15 → 10 → 7 → 5
```

Each reduction is a separate implementation ticket or clearly bounded refactor
batch. Every ticket records the measured violation count and affected
functions before and after the change. The preferred final maximum is 5; 7 or
10 may be retained when reaching 5 consistently produces less clear code.

### Ratchet 100 → 50

The completed scan covered 1,125 production source files under `apps/*/src`
and `packages/*/src`. It reported **zero violations** and **no affected
functions** at maximum 50. The highest measured function complexity was 47 in
`apps/api/src/modules/listing/listing.repo.ts`.

### Ratchet 50 → 25

The completed 25-threshold scan covered 785 in-scope production source files
under `apps/*/src` and `packages/*/src`. The initial scan reported seven
violations: `httpClient` (32), `LectureDetailScreen` (33),
`ListingDetailScreen` (31), `ReviewSection` (35), `FeedListRow` (34),
`arrangeCommit` (47), and `MetaDataSection` (30). After behavior-preserving
refactoring, the scan reports **zero violations** at maximum 25.

### Ratchet 25 → 15

The completed scan covered production source under `apps/*/src` and
`packages/*/src`. The initial scan reported **47 violations** at maximum 15:
11 in API, seven in native, and 29 in web. After behavior-preserving
refactoring of projection, authorization, form, modal, and screen-rendering
boundaries, the scan reports **zero violations** at maximum 15. Focused API,
web, and native behavioral tests remained green for the affected paths.

### Ratchet 15 → 10

Issue #625 began with **98 violations** at maximum 10 across API, native, web,
and shared production code. The implementation refactored those violations in
small behavior-preserving slices, with each slice committed independently.
The final scan reports **zero violations** at maximum 10.

For this ratchet, the authoritative scan is run from the repository root with
a temporary configuration so the measurement is limited to the intended
complexity rule and production paths:

```bash
scan_config=$(mktemp /tmp/oxlint-625-XXXXXX.json)
jq 'del(.jsPlugins) | .rules |= with_entries(select(.key | startswith("anti-slop/") | not)) | .overrides[0].rules |= with_entries(select(.key | startswith("anti-slop/") | not)) | .rules["eslint/complexity"][1].max = 10' .oxlintrc.json > "$scan_config"
bunx oxlint --config "$scan_config" --disable-nested-config --format=unix apps/*/src packages/*/src
scan_status=$?
rm -f "$scan_config"
exit $scan_status
```

The final scan completed with exit status 0 and no output. Web and API
behavior suites, lint, and typechecks passed for the affected slices. Native
lint and typecheck passed; the native Bun test runner is environment-blocked
by React Native's Flow-only `import typeof` syntax before test files load. No
test coverage was removed or suppressed.

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
