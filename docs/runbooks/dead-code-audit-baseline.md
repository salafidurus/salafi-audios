# Dead-code audit baseline

This is the report-only baseline established by #641 for the specification in #640. It is evidence for review, not an authorization to delete code or tests. Removal proposals belong to #642 and must be approved individually.

## Tooling decision

Knip 6.32.2 is the primary analyzer because it supports this Bun monorepo, package exports, workspace entry points, dependencies, unresolved imports, unused files, unused types, duplicate exports, and cycle reporting. Its JSON output is normalized by `scripts/dead-code-audit/cli.mjs`.

Dependency Cruiser remains an optional follow-up for graph rules only if calibration shows a reachability or cycle gap. Madge is useful for graph visualization, but is not the audit authority. `ts-prune` is archived, and `depcheck` is dependency-focused. Coverage and mutation testing provide test-quality evidence; they do not prove that a source file is dead.

## Reproduce

```sh
bun install
bun run test:dead-code-audit
bun run dead-code-audit
bun run dead-code-audit -- --format json
```

The command is report-only. It does not pass Knip's `--fix` flag and does not modify repository files. Findings are candidates with evidence and confidence; dynamic imports, framework discovery, package exports, scripts, generated-code boundaries, and runtime reflection require human review.

## Baseline snapshot

Baseline source commit: `ffb80e1a` (`feat(web): add canonical my library route (#643)`).

The initial calibrated run found:

| Area                           | Count | Interpretation                                                           |
| ------------------------------ | ----: | ------------------------------------------------------------------------ |
| Knip likely-dead candidates    |   415 | Files, exports, types, or duplicate exports requiring review             |
| Knip unknown/dynamic findings  |    30 | Dependency, unresolved, or other configuration/graph concerns            |
| Test files inventoried         |   340 | Test sources reviewed by the conservative classifier                     |
| Critical-regression candidates |    90 | Authorization, contract, boundary, security, or regression language      |
| Weak-but-meaningful candidates |   240 | Non-placeholder expectations without a stronger automatic classification |
| Placeholder candidates         |     4 | Constant-value assertions                                                |
| Permanently-skipped candidates |     1 | Skipped test declaration                                                 |
| Obsolete candidates            |     5 | Explicit obsolete, deprecated, or legacy language                        |
| Exact duplicate test bodies    |     0 | No identical normalized source bodies in this snapshot                   |

The test counts are heuristic inventory signals. They do not determine whether a test is obsolete, redundant, or safe to remove. The classifier intentionally lacks semantic equivalence and runtime coverage claims; those decisions require the evidence described in #640.

The command's Markdown output separates delivery status from review inventory and
test statistics. `Baseline findings`, `introduced findings`, and `blocking
findings` describe delivery gates. Code classifications and test classifications
are non-blocking evidence counts; they are not a backlog whose totals should be
reduced to zero. Only an explicitly confirmed and approved cleanup candidate is
eligible for removal.

The stable finding-key snapshot is generated temporarily from the selected base
commit when `--base` is supplied. No generated JSON snapshot or allowlist is
checked into the repository. Record material rule or accepted-root changes in
this runbook instead.

## Review protocol

For each proposed removal, record the candidate path or symbol, category, confidence, evidence, all discovered consumers and roots, and the validation command. Preserve public package exports, documented commands, operational scripts, framework entry points, and dynamic/runtime adapters unless their ownership explicitly changes. Use a focused test or build check before and after each approved removal.

## Two-phase governance

The audit phase is non-mutating and runs before PR preparation. It compares a
temporary base-commit snapshot with findings on the implementation diff and
affected graph. Only a newly introduced `confirmed-dead` finding blocks
delivery; all other classifications remain review evidence.

The removal phase requires an approved cleanup ticket and an explicit finding
allowlist. It removes only confirmed findings in that allowlist and records
before-and-after output. Public APIs, package exports, documented commands,
operational scripts, framework roots, generated output, migrations, and
documentation remain protected unless separately approved.
