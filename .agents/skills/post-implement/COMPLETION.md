# Completion and Cleanup Cases

Use this case guide after PR preparation.

## Ordinary merged ticket

1. Independently verify the PR is merged and record its final head.
2. Invoke `triage` for the linked issue to reconcile completion.
3. Independently verify the issue is closed and active triage labels are gone.
4. Only then synchronize the integration branch and delete the confirmed
   ticket branch/worktree.

## Specification ticket

Verify the PR targeted the recorded `spec/<slug>` branch. Preserve that branch,
sibling tickets, sibling worktrees, and unrelated dirty state. Remove only the
completed ticket resources.

## Final validation ticket

Use the latest spec candidate and current `main` as integration inputs. Resolve
drift, run the complete acceptance matrix, and open the validation PR against
`main`. Close the parent specification only after the validation PR is merged
and its evidence is recorded.

## Abandonment

Record the distinct abandoned outcome on parent and child issues, apply
`wontfix` only according to triage policy, and verify every branch/worktree
identity before deletion. Any uncertainty preserves all resources.

No completion case authorizes deleting an active spec branch, sibling ticket,
unrelated worktree, or unrelated dirty checkout state.
