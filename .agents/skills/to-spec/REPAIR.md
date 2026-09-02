# Existing Specification Repair

Use this procedure when the maintainer names an existing specification issue.
Repair is an in-place reconciliation mode, not a second publication.

## Preconditions

1. Read the complete parent issue, comments, labels, linked tickets, and native
   dependency edges. Treat historical branch metadata as evidence, not as a
   required integration context.
2. Confirm the issue is a specification artifact. If it is a ticket, hand it
   to `to-tickets` or `pre-implement` as appropriate.
3. Compare the body, comments, and linked ticket branches. Surface stale
   acceptance criteria, missing parent links, open PRs targeting legacy spec
   branches, and closed child tickets before proposing changes.
4. Present the repair scope and seams for approval before tracker writes.

## Reconciliation contract

- Preserve the existing specification number, comments, issue history, and
  valid decisions.
- Do not create or require a specification integration branch.
- Record the parent issue number and direct-to-`main` delivery model in the
  current specification body or an explicit metadata comment when repair
  requires lifecycle clarification.
- Preserve legacy branch names only as historical evidence. Retarget open or
  future implementation work to `main` through the separate ticket repair.
- Preserve `spec` and `ready-for-agent` on an open parent. Do not apply
  implementation state labels to the parent.
- Keep child ticket repair separate. Do not rewrite ticket acceptance criteria
  or dependency edges here unless the approved repair explicitly covers them.

## Completion

Verify the updated parent body, labels, and child-ticket membership. Hand the
reconciled parent to `to-tickets` for ticket-graph repair.
Do not invoke `pre-implement` directly from this procedure.
