---
name: post-implement
description: "Prepare an implementation PR and perform verified post-merge cleanup."
disable-model-invocation: true
---

# Post-Implementation

Complete the delivery lifecycle for one implemented ticket after implementation
and review. This skill has two explicit phases: PR preparation and merge-gated
cleanup.

## PR preparation

Verify the implementation and review evidence, then prepare the PR with this
minimal body:

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

Push and open or update the PR according to the repository worktree rules.

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
