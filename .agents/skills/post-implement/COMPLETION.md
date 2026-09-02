# Completion and Cleanup Cases

Use this case guide after PR preparation.

## Ordinary merged ticket

1. Independently verify the PR is merged and record its final head.
2. Invoke `triage` for the linked issue to reconcile completion.
3. Independently verify the issue is closed and active triage labels are gone.
4. Only then synchronize `main` and delete the confirmed
   ticket branch/worktree.

## Specification ticket

Verify the PR targeted `main`. Remove only the completed ticket resources and
preserve sibling tickets, sibling worktrees, and unrelated dirty state.

## Finalization boundary

`implement-spec` owns verification-only finalization. This skill does not run
the finalization procedure or create a validation PR.

## Abandonment

Record the distinct abandoned outcome on parent and child issues, apply
`wontfix` only according to triage policy, and verify every ticket
branch/worktree identity before deletion. Any uncertainty preserves resources.

No completion case authorizes deleting a legacy spec branch, sibling ticket,
unrelated worktree, or unrelated dirty checkout state.
