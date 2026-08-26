---
name: post-implement
description: "Prepare an implementation PR and perform verified post-merge cleanup."
disable-model-invocation: true
---

# Post-Implementation

Complete the delivery lifecycle for one implemented ticket after implementation.
This skill has two explicit phases: PR preparation and merge-gated cleanup.

## PR preparation

Run the applicable post-work checks before publishing. The repository baseline
is:

```bash
bun run build
bun run lint
bun run typecheck
bun run test
bun run test:e2e
bun run doctor
```

Before PR preparation, run the report-only dead-code audit against the
implementation diff:

```bash
bun run dead-code-audit -- --mode audit \
  --base origin/main --check-introduced --format json
```

Keep the audit report with the implementation evidence. Pre-existing baseline
findings are report-only. PR preparation is blocked only when the audit exits
with a newly introduced `confirmed-dead` code or test finding. `probable-dead`,
`needs-review`, `protected`, `historical`, and `unknown/dynamic` findings are
reported for human review and never trigger automatic deletion.

Skip a check only when the plan records why it cannot apply. Diagnose failures
against the pre-work baseline before pushing.

Verify the implementation evidence, then prepare the PR with this minimal body:

```markdown
## Summary

## Issue/spec references

<!-- Include `Closes #<issue>` when this work has an implementation issue. -->

## Risks, migrations, or follow-up work
```

Use the actual issue/spec numbers. If an implementation issue exists, include
`Closes #<issue>` for it; when no issue exists, omit the closing reference and
state that no issue was available. Verify that the PR's head branch and commit
match the intended worktree. If risks or follow-up work are identified, ask
whether they should be drilled further into a new specification or ticket
before finalizing the PR.

Push the verified branch and open or update the PR. The branch must match the
approved worktree and naming classification from `implement`.

## Merge-gated cleanup

Cleanup begins only after the user indicates that the PR merged or the remote
state independently verifies it. Then:

1. Verify the PR is merged and record its final head.
2. Verify every implementation issue is closed and remove
   `ready-for-agent`; close and comment on any issue GitHub left open.
3. Fast-forward local `main` from the merged remote state.
4. Remove only the confirmed completed worktree and delete its local branch.
5. Verify `main` is clean and current, the completed worktree is absent, and
   unrelated worktrees remain unchanged.

For native work performed in the current checkout, preserve the checkout and
do not remove it as a worktree. Clean only the associated branch/resources
that are explicitly confirmed safe to delete.

## Completion

Report the PR, final commit, issue states, cleanup actions, and final Git state.
Do not claim delivery complete until each applicable verification has evidence.
