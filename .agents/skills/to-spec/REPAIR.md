# Existing Specification Repair

Use this procedure when the maintainer names an existing specification issue.
Repair is an in-place reconciliation mode, not a second publication.

## Preconditions

1. Read the complete parent issue, comments, labels, linked tickets, native
   dependency edges, and recorded integration-branch metadata.
2. Confirm the issue is a specification artifact. If it is a ticket, hand it
   to `to-tickets` or `pre-implement` as appropriate.
3. Compare the body, comments, and remote branches. Surface contradictory
   branch names, stale acceptance criteria, missing parent links, and closed
   child tickets before proposing changes.
4. Present the repair scope and seams for approval before tracker writes.

## Reconciliation contract

- Preserve the existing specification number, comments, issue history, and
  valid decisions.
- Resolve exactly one `spec/<slug>` branch for the specification. Never invent
  a branch from an ambiguous comment; create a missing branch only after the
  slug and base are approved.
- Record the parent issue number and integration branch together in the
  current specification body or an explicit metadata comment.
- Normalize the parent body to distinguish the integration branch from the
  final validation PR target. The normal target is `spec/<slug>`; final
  validation targets `main`.
- Preserve `spec` and `ready-for-agent` on an open parent. Do not apply
  implementation state labels to the parent.
- Keep child ticket repair separate. Do not rewrite ticket acceptance criteria
  or dependency edges here unless the approved repair explicitly covers them.

## Completion

Verify the updated parent body, labels, branch identity, and child-ticket
membership. Hand the reconciled parent to `to-tickets` for ticket-graph repair.
Do not invoke `pre-implement` directly from this procedure.
