---
name: implement
description: "Implement one approved ticket plan."
disable-model-invocation: true
---

Implement one approved ticket plan. Specification-level work is orchestrated
by `implement-spec`, which selects tickets and invokes this lifecycle for each
ticket.

Before editing, read the repository instructions in `AGENT.md`, the nearest
app/package `AGENT.md`, the `tdd` skill, and the approved ticket plan. Treat
those sources as mandatory workflow rules.

## Checkout selection

Determine whether the approved scope includes committed files under
`apps/native`:

- Native scope uses the current checkout because native changes may require the
  current development environment.
- Non-native scope uses the approved isolated worktree under `.worktrees`,
  branched from `origin/main`.
- Mixed scope follows the native/current-checkout path.

For non-native work, create the approved worktree if it does not exist. Use a
short name with the matching prefix: `c-` and `c/` for chore or CI work, `f-`
and `f/` for features, and `fix-` and `fix/` for bug fixes. Before using an
existing worktree, verify its path, branch, base, and clean starting state.

After selecting or creating a non-native worktree, copy every gitignored
`.env` file from the main checkout into the matching path in the worktree,
excluding `node_modules`, `.git`, and `.worktrees`, then run `bun install` from
the worktree:

```bash
WORKTREE=".worktrees/<worktree-name>"
find . -maxdepth 4 -name '.env' \
  -not -path '*/node_modules/*' \
  -not -path '*/.git/*' \
  -not -path '*.worktrees/*' \
  -exec sh -c 'mkdir -p "$(dirname "$2/$1")" && cp "$1" "$2/$1"' _ {} "$WORKTREE" \;
bun install
```

Run `bun install` in the current checkout when the native or mixed scope
requires dependency setup. Record setup failures as environment evidence and
repair them before editing source.

Before implementation, run the applicable pre-work checks and record their
baseline. The repository baseline is:

```bash
bun run build
bun run lint
bun run typecheck
bun run test
bun run test:e2e
bun run doctor
```

Skip a check only when the approved plan explains why it cannot apply.

## Execution

Use the `tdd` skill's exact five-step red → green loop for every vertical slice:
write red, confirm red, implement minimally, confirm green, and run the
applicable full suite. Run typechecking and single-test commands regularly.
Apply the nearest workspace rules and keep shared package boundaries intact.

Commit test and implementation together using Conventional Commits. Once
implementation is complete, hand the branch to `post-implement`.

Do not prepare the PR or clean up the branch here. Those are the
`post-implement` responsibilities.

## Completion

The approved ticket plan is implemented, focused and applicable full checks
are recorded, and the branch contains the committed implementation ready for
review.
