---
name: post-implement
description: "Prepare an implementation PR and perform verified post-merge cleanup."
disable-model-invocation: true
---

# Post-Implementation

Complete the delivery lifecycle for one implemented ticket after implementation.
This skill has two explicit phases: PR preparation and merge-gated cleanup.

Read `.agents/skills/post-implement/tsdoc-policy.md` before preparing the PR.

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

## Documentation verification

Review every changed public declaration against
`.agents/skills/post-implement/tsdoc-policy.md`. Confirm that TSDoc describes
actual behavior, invariants, side effects, and failure modes rather than names
or types. Search the changed scope for generic,
placeholder, stale, duplicated, or mechanically generated prose. Run final-mode
TSDoc lint and report intentionally undocumented internals or remaining legacy
baseline gaps.

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
match the intended worktree. For a specification ticket, also verify that the
PR targets the verified parent specification branch. If the parent branch is
missing, fail closed and report the missing integration context; never invent a
specification branch or claim isolated integration. If risks or follow-up work
are identified, ask whether they should be drilled further into a new
specification or ticket before finalizing the PR.

Push the verified branch and open or update the PR. The branch must match the
approved worktree and naming classification from `implement`.

## Merge-gated cleanup

Cleanup begins only after the user indicates that the PR merged or the remote
state independently verifies it. For every ticket, independently verify that
the PR is merged and independently verify that the ticket issue is closed.
Do not remove any ticket resource before both gates pass. Then:

1. Verify the PR is merged and record its final head.
2. Verify every implementation issue is closed and remove
   `ready-for-agent`; close and comment on any issue GitHub left open, then
   re-verify the closed state.
3. If this is a specification ticket, verify its PR targeted the verified
   parent spec branch, remove only the confirmed completed ticket worktree,
   and delete only its local and remote ticket branch. Do not fast-forward
   local `main`, delete the active spec branch, or remove sibling ticket
   branches and worktrees.
4. If this is a standalone ticket, fast-forward local `main` from the merged
   remote state and remove only the confirmed completed worktree and branch.
5. Verify the applicable integration branch is clean and current, the
   completed worktree is absent, and unrelated dirty checkout state, unrelated
   worktrees, and sibling ticket branches and worktrees remain unchanged.

For native work performed in the current checkout, preserve the checkout and
do not remove it as a worktree. Clean only the associated branch/resources
that are explicitly confirmed safe to delete.

Standalone tickets retain the existing `main`-based cleanup. Specification
tickets use the parent spec branch as their integration target and preserve
that branch until final specification validation or abandonment.

## Final specification validation or abandonment

The final validation ticket is a lifecycle exception. It must use the latest
spec candidate and current `main` as integration inputs, resolve conflicts at
that boundary, run the complete specification acceptance matrix, and refuse
completion when required checks fail. Its PR targets `main` and references the
parent specification and validation ticket. Verify the merged PR and recorded
acceptance evidence before closing the parent as completed.

If the specification is abandoned, record the reason and distinct abandoned
outcome on the parent and child issues according to tracker policy. Verify the
remote spec branch, ticket branch, and worktree identity and state before each
deletion. Stop on uncertainty and preserve unrelated dirty state, branches,
worktrees, and active specifications.

## Completion

Report the PR, final commit, issue states, cleanup actions, and final Git state.
Do not claim delivery complete until each applicable verification has evidence.
