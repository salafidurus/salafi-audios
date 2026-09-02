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

Specifications are tracker coordination contexts with no integration branch.
Carry the parent issue, `origin/main` base, and `main` pull-request target while
selecting and handing off its tickets. Tickets with no parent specification
remain standalone and use the same `origin/main` to `main` lifecycle.

Before editing, read the root and nearest workspace `AGENT.md` files and the
`tdd` skill. Every ticket cycle follows the `pre-implement`, `implement`, and
`post-implement` lifecycle skills for checkout, setup, verification, and
delivery.

## Workflow

1. Read the specification, every relevant ticket and comment, labels,
   acceptance criteria, and dependency edges.
2. Evaluate the affected code, domain contexts, architecture documents, ADRs,
   tests, package boundaries, and platform constraints.
3. Select one unblocked ticket from the current frontier. Before all child
   tickets complete, this is an implementation ticket; after they complete,
   select the finalization ticket as the only remaining frontier node.
4. Run the complete ticket lifecycle:

   `pre-implement → implement → post-implement`

   `pre-implement` studies the parent specification but plans only the selected
   ticket. `implement` executes that approved plan in the correct checkout or
   worktree. `post-implement` prepares the PR and performs cleanup only after
   merge.

5. Recompute the frontier after the ticket completes, preserving context
   pointers to its PR, commits, decisions, and follow-up work.
6. Repeat through the finalization ticket. The specification graph is:

   `spec → tickets → child ticket lifecycles → main → finalization verification`

   After all implementation tickets complete, the finalization ticket must be
   the only remaining frontier node. Handle it directly after all
   implementation tickets merge and close; do not run the ordinary
   `pre-implement → implement → post-implement` lifecycle. Finalization does
   not create a branch, change code, or open a pull request.

## Finalization and abandonment

Finalization is a verification-only terminal step after every implementation
ticket merges into `main`. It runs the complete specification acceptance matrix
against current `main`, fails closed when a required check fails, records the
evidence on the parent issue, and closes the parent as completed. It has no
branch or pull request.

Closing all child tickets is not finalization. The `triage` skill reconciles
completed-ticket triage metadata but does not close the parent specification.

Abandonment is a separate, auditable terminal path. Record the reason and
outcome on the parent and child issues according to triage policy, distinguish
it from completion, verify each ticket resource before deleting it, and
preserve unrelated branches, worktrees, dirty state, and active
specifications. If any identity or state check is uncertain, stop without
deleting that resource.

Communication to and from subagents should be sparse. Use context pointers to
the specification, tickets, research, and previous commits instead of
duplicating their contents.

## Completion

Every implementation ticket has completed its own pre-implementation,
implementation, and post-implementation lifecycle, and finalization has
verified the specification's acceptance criteria. The specification umbrella
is not itself treated as an executable ticket unless it explicitly has
implementation scope.
