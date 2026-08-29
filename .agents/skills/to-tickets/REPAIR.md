# Existing Ticket-Set Repair

Use this procedure when a specification already has published tickets.
Repair the graph in place; do not create replacement issues.

## Preconditions

1. Read the parent specification and every linked ticket, including comments,
   labels, state, PR references, branch references, and native dependency
   edges.
2. Resolve the parent's recorded `spec/<slug>` branch before editing any
   ticket. A missing or conflicting branch is a blocking ambiguity.
3. Build a complete current dependency matrix, including tickets with no
   blockers. Distinguish historical completed blockers from active blockers.
4. Present proposed ticket, dependency, label, and branch changes for approval
   before tracker writes.

## Reconciliation contract

- Preserve issue numbers, comments, closed states, and valid acceptance
  criteria.
- Keep the first line `Part of #<spec-number>` for every specification ticket.
- Normalize each open ticket to the `ticket` and `ready-for-agent` labels.
- Add the lifecycle contract: `pre-implement` verifies readiness read-only;
  `implement` invokes `triage` to enter `in-progress`; and
  `post-implement` invokes `triage` after merge before cleanup.
- Record the integration branch and PR target in each ticket. Ordinary child
  tickets target `spec/<slug>`; the final validation ticket targets `main`.
- Repair both textual `Blocked by` sections and GitHub native dependency edges.
  Remove only edges that no longer represent a genuine blocker, and retain
  completed work as historical evidence when useful.
- Do not close the parent specification or infer finalization from child
  completion.

## Completion

Re-read every repaired ticket and audit the dependency graph against the
approved matrix. Report the first unblocked ticket for `pre-implement`; do not
begin implementation from this procedure.
