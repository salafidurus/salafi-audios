---
name: implement-spec
description: "Study a specification, select its ticket frontier, and drive each ticket lifecycle."
disable-model-invocation: true
---

You have been provided a specification with implementation tickets. Study the
specification and perform a deep context evaluation before selecting work.

The tickets form a task graph with blocking relationships. Maintain the
frontier of unblocked tickets and process tickets in dependency order. This
skill does not implement the specification as one undifferentiated task.

Each specification has one disposable `spec/<slug>` integration context,
created from `main` and associated with exactly one parent specification.
Carry the parent issue, resolved spec branch, branch base, and pull-request
target while selecting and handing off its tickets. If the parent has no
recorded spec branch, carry the missing-context warning and use the provisional
`origin/main` base defined by `pre-implement`; do not claim spec-branch
isolation or invent a pull-request target. Tickets with no parent specification
remain standalone and use the existing `origin/main` to `main` lifecycle.

Before editing, read the root and nearest workspace `AGENT.md` files and the
`tdd` skill. Every ticket cycle follows the `pre-implement`, `implement`, and
`post-implement` lifecycle skills for checkout, setup, verification, and
delivery.

## Workflow

1. Read the specification, every relevant ticket and comment, labels,
   acceptance criteria, and dependency edges.
2. Evaluate the affected code, domain contexts, architecture documents, ADRs,
   tests, package boundaries, and platform constraints.
3. Select one unblocked implementation ticket.
4. Run the complete ticket lifecycle:

   `pre-implement → implement → post-implement`

   `pre-implement` studies the parent specification but plans only the selected
   ticket. `implement` executes that approved plan in the correct checkout or
   worktree. `post-implement` prepares the PR and performs cleanup only after
   merge.

5. Recompute the frontier after the ticket completes, preserving context
   pointers to its PR, commits, decisions, and follow-up work.
6. Repeat until all required tickets are complete, then choose exactly one
   terminal path: finalization or abandonment.

## Finalization and abandonment

Finalization is the only path that can bring a specification into `main`. The
final validation ticket starts from the latest spec branch and current `main`,
resolves drift and conflicts at that boundary, runs the complete specification
acceptance matrix plus applicable repository checks, and fails closed when any
required check fails. Its pull request targets `main` and identifies both the
parent specification and final validation ticket. Close the parent as
completed only after that pull request is merged and its evidence is recorded.

Closing all child tickets is not finalization. The `triage` skill reconciles
completed-ticket triage metadata but does not close the parent specification.

Abandonment is a separate, auditable terminal path. Record the reason and
outcome on the parent and child issues according to triage policy, distinguish
it from completion, verify the spec branch and each ticket resource before
deleting it, and preserve unrelated branches, worktrees, dirty state, and
active specifications. If any identity or state check is uncertain, stop
without deleting that resource.

Communication to and from subagents should be sparse. Use context pointers to
the specification, tickets, research, and previous commits instead of
duplicating their contents.

## Completion

Every required ticket has completed its own pre-implementation, implementation,
and post-implementation lifecycle, and the specification's acceptance criteria
have been verified. The specification umbrella is not itself treated
as an executable ticket unless it explicitly has implementation scope.
