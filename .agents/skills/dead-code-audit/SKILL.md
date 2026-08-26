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
bun run dead-code-audit -- --mode audit --baseline docs/runbooks/dead-code-audit-baseline.json --base origin/main --check-introduced --format json
```

The default audit is report-only. It never mutates files. Findings are candidates requiring review under `docs/runbooks/dead-code-audit-baseline.md` and the specification in issue #640.

Removal is a separate, explicitly bounded operation:

```sh
bun run dead-code-audit -- --mode remove --ticket 642 --allowlist <finding-keys-or-paths.txt> --format json
```

Removal requires a numeric approved cleanup ticket, a non-empty allowlist, and current findings that match the allowlist. Only explicitly approved placeholder/skipped test candidates or `confirmed-dead` findings can be removed. The command records before-and-after evidence and leaves all other candidates untouched.

## Interpretation

- `likely-dead` means Knip found no configured consumer or reported an unused export/type. Check framework discovery, package exports, scripts, dynamic imports, and runtime reflection first.
- `unknown/dynamic` means the result is a dependency, unresolved-import, or graph concern where static evidence is incomplete.
- Test categories are conservative source-text signals: `critical-regression`, `weak-but-meaningful`, `placeholder`, `permanently-skipped`, `obsolete`, `duplicate`, or `unknown/dynamic`.
- Authorization, contract, boundary, security, and regression tests default toward preservation.
- `audit --base ... --check-introduced` reports baseline and changed-file findings separately and exits unsuccessfully only for newly introduced `confirmed-dead` findings.

## Handoff

Do not apply removals from this audit in the same ticket. Collect candidate evidence in the baseline, then implement approved removals and governance in #642 with focused tests and build validation.
