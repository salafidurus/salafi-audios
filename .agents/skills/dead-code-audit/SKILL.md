---
name: dead-code-audit
description: Run the repository's report-only dead-code and test inventory established by #641.
---

# Dead-code audit

Use this skill when investigating unused files, exports, dependencies, types, duplicate test bodies, or weak and skipped tests in this repository.

## Commands

Run from the repository root:

```sh
bun run test:dead-code-audit
bun run dead-code-audit
bun run dead-code-audit -- --format json
```

The audit is report-only. Never add `--fix`, remove files, or treat a finding as an approved change. Findings are candidates requiring review under `docs/runbooks/dead-code-audit-baseline.md` and the specification in issue #640.

## Interpretation

- `likely-dead` means Knip found no configured consumer or reported an unused export/type. Check framework discovery, package exports, scripts, dynamic imports, and runtime reflection first.
- `unknown/dynamic` means the result is a dependency, unresolved-import, or graph concern where static evidence is incomplete.
- Test categories are conservative source-text signals: `critical-regression`, `weak-but-meaningful`, `placeholder`, `permanently-skipped`, `obsolete`, `duplicate`, or `unknown/dynamic`.
- Authorization, contract, boundary, security, and regression tests default toward preservation.

## Handoff

Do not apply removals from this audit in the same ticket. Collect candidate evidence in the baseline, then implement approved removals and governance in #642 with focused tests and build validation.
