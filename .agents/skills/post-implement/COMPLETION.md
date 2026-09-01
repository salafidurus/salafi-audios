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

## Final validation ticket

Use current `main` as the only integration input. Run the complete acceptance
matrix and record its evidence on the specification issue. No validation PR is
required; close the parent only after acceptance succeeds.

## Abandonment

Record the distinct abandoned outcome on parent and child issues, apply
`wontfix` only according to triage policy, and verify every ticket
branch/worktree identity before deletion. Any uncertainty preserves resources.

No completion case authorizes deleting a legacy spec branch, sibling ticket,
unrelated worktree, or unrelated dirty checkout state.
