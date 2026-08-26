---
name: dead-code-audit
description: Run the repository's evidence-backed dead-code and test review established by #642.
---

# Dead-code audit

Use this skill when investigating unused files, exports, dependencies, types, duplicate test bodies, or weak and skipped tests in this repository.

## Commands

Run from the repository root:

```sh
bun run test:dead-code-audit
bun run dead-code-audit
bun run dead-code-audit -- --format json
bun run dead-code-audit -- --mode audit --base origin/main --check-introduced --format json
```

The default audit is report-only. It never mutates files or requires a checked-in generated report. Findings include scanned consumers, declared roots, protected-path reasons, dynamic-loading signals, confidence, and a recommended verification step.

Removal is a separate, explicitly bounded operation:

```sh
bun run dead-code-audit -- --mode remove --ticket 642 --allowlist <finding-keys-or-paths.txt> --format json
```

Removal requires a numeric approved cleanup ticket, a non-empty allowlist, and current findings that match the allowlist. Only explicitly approved placeholder/skipped test candidates or `confirmed-dead` file findings can be removed. Symbol findings are review-only until a safe source edit is supplied. The command records before-and-after evidence and leaves all other candidates untouched.

## Interpretation

- `confirmed-dead` means the candidate has no scanned consumer or accepted root, is not protected by a framework/public/history rule, and is eligible for separately approved removal.
- `probable-dead` means static analysis suggests no consumer, but evidence is incomplete.
- `needs-review` means consumers or dynamic-loading signals require an agent or maintainer decision.
- `protected` means the path is a route, entry point, configuration, public surface, script, or other recognized runtime boundary.
- `historical` means the path is migration or other authoritative history and is never an automatic deletion target.
- `unknown/dynamic` means the result is a dependency, unresolved-import, or graph concern where static evidence is incomplete.
- Test categories are conservative source-text signals: `critical-regression`, `weak-but-meaningful`, `placeholder`, `permanently-skipped`, `obsolete`, `duplicate`, or `unknown/dynamic`.
- Authorization, contract, boundary, security, and regression tests default toward preservation.
- `audit --base ... --check-introduced` reports baseline and changed-file findings separately and exits unsuccessfully only for newly introduced `confirmed-dead` findings.

## Handoff

Do not apply removals from this audit in the same ticket. Collect candidate evidence in the baseline, then implement approved removals and governance in #642 with focused tests and build validation.
