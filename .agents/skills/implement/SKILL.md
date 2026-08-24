---
name: implement
description: "Implement one approved ticket plan."
disable-model-invocation: true
---

Implement one approved ticket plan. Specification-level work is orchestrated
by `implement-spec`, which selects tickets and invokes this lifecycle for each
ticket.

Before editing, read the repository instructions in `AGENT.md`, the nearest
app/package `AGENT.md`, the `tdd` skill, and
`.agents/rules/worktree-rules.md`. Treat those sources as mandatory workflow
rules.

## Checkout selection

Determine whether the approved scope includes committed files under
`apps/native`:

- Native scope uses the current checkout because native changes may require the
  current development environment.
- Non-native scope uses an isolated worktree under `.worktrees`, branched from
  `origin/main`, following `worktree-rules.md`.
- Mixed scope follows the native/current-checkout path.

## Execution

Use the `tdd` skill's exact five-step red → green loop for every vertical slice:
write red, confirm red, implement minimally, confirm green, and run the
applicable full suite. Run typechecking and single-test commands regularly.
Apply the nearest workspace rules and keep shared package boundaries intact.

Commit test and implementation together using Conventional Commits. Once
implementation is complete, hand the branch to `code-review`.

Do not prepare the PR or clean up the branch here. Those are the
`post-implement` responsibilities.

## Completion

The approved ticket plan is implemented, focused and applicable full checks
are recorded, and the branch contains the committed implementation ready for
review.
