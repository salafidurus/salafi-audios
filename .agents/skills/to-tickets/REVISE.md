# Research-Driven Ticket Revision

Use this procedure when research, grilling, domain modeling, or
`pre-implement` planning shows that an existing ticket is not execution-ready.
This is an in-place revision, not a replacement issue or an implementation
shortcut.

## Preconditions

1. Identify the existing ticket and read its complete body, comments, labels,
   parent specification, dependency edges, and any current plan.
2. Record the unresolved question, the evidence gathered, and the decision
   that requires a ticket update. Do not silently convert an implementation
   assumption into acceptance criteria.
3. If the decision changes the specification's problem, solution, scope, or
   durable architectural boundary, stop and route the parent through
   [to-spec/REPAIR.md](../to-spec/REPAIR.md) first.
4. Present the proposed ticket revision and dependency changes for approval
   before tracker writes.

## Revision contract

- Preserve the existing issue number, historical comments, valid decisions,
  and completed state.
- Update only the affected `What to build`, key contracts, acceptance
  criteria, out-of-scope boundaries, and blocker relationships.
- Capture the research or grilling outcome in a concise revision note or
  tracker comment, including the decision and its rationale. Comments must
  follow the tracker and triage disclaimer rules when applicable.
- Keep acceptance criteria independently testable and include newly discovered
  unhappy paths, authority boundaries, migrations, and failure behavior.
- Re-audit the complete dependency matrix and both textual and native blocker
  edges. Add a blocker only when the ticket genuinely cannot start without it.
- Remove `ready-for-agent` while the ticket is materially incomplete; restore
  it only after the revised ticket is execution-ready and triage has confirmed
  the state.
- Preserve the parent specification relationship. Use `origin/main` as the
  implementation base and `main` as the PR target; finalization has no branch
  or PR target.

## Handoff

After the revision is published, invoke `triage` to verify the category and
state. The ticket may return to `ready-for-agent` only when the revised
contracts, acceptance criteria, and blockers are complete. Then report the
ticket to `pre-implement`; do not invoke `implement` directly.

If the revision exposes a broader scope change, unresolved decision, or parent
specification contradiction, stop and route back through
[to-spec/REPAIR.md](../to-spec/REPAIR.md) instead of forcing the ticket to
ready.
