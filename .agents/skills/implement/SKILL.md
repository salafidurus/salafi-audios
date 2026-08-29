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

Read `.agents/skills/implement/tsdoc-policy.md` before editing code or
agent-facing implementation guidance.

Read [START.md](START.md) before performing the implementation-start triage
handoff or selecting the implementation checkout.

## Triage handoff

Before creating or modifying the implementation checkout, invoke the `triage`
skill for the approved implementation issue and request the implementation-start
transition. Triage must verify the issue context and move its state from
`ready-for-agent` (or an explicitly approved `ready-for-human` handoff) to
`in-progress`, preserving the category and artifact labels. Independently
verify the resulting state before editing. If the issue is untriaged, has
conflicting state labels, or the transition cannot be verified, stop without
editing. If no implementation issue exists, record that the triage handoff was
not applicable.

## Checkout selection

Determine whether the approved scope includes committed files under
`apps/native`:

- Native scope uses the current checkout because native changes may require the
  current development environment.
- Non-native scope uses the approved isolated worktree under `.worktree/`.
  For a specification ticket, branch it from the resolved `spec/<slug>`
  integration branch. If `pre-implement` reported missing specification
  branch metadata, use `origin/main` provisionally and preserve that warning;
  do not describe the work as spec-branch-isolated or invent a spec-branch PR
  target. Standalone tickets are branched from `origin/main`.
- Mixed scope follows the native/current-checkout path.

The approved plan carries the routing context explicitly:

| Ticket context                                          | Branch base                 | Pull-request target                    |
| ------------------------------------------------------- | --------------------------- | -------------------------------------- |
| Specification ticket with a verified integration branch | `spec/<slug>`               | `spec/<slug>`                          |
| Specification ticket with missing branch metadata       | `origin/main` provisionally | unresolved; report the missing context |
| Standalone ticket                                       | `origin/main`               | `main`                                 |

Resolve the branch base and pull-request target before creating the worktree or
preparing delivery. Branch topology does not change native/current-checkout
selection.

For non-native work, create the approved worktree if it does not exist. Use a
short name with the matching prefix: `c-` and `c/` for chore or CI work, `f-`
and `f/` for features, and `fix-` and `fix/` for bug fixes. Before using an
existing worktree, verify its path, branch, base, and clean starting state.

After selecting or creating a non-native worktree, copy every gitignored
`.env` file from the main checkout into the matching path in the worktree,
excluding `node_modules`, `.git`, and `.worktree`, then run `bun install` from
the worktree:

```bash
WORKTREE=".worktree/<worktree-name>"
find . -maxdepth 4 -name '.env' \
  -not -path '*/node_modules/*' \
  -not -path '*/.git/*' \
  -not -path '*.worktree/*' \
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

## Documentation requirements

Update TSDoc in the same vertical slice and commit as the implementation. Write
it from the source and tests, documenting caller-visible behavior, invariants,
side effects, and failure modes. Cover changed exported production
declarations, meaningful semantic fields, and non-obvious helpers. Do not use
generic or generated prose; consult `.agents/skills/implement/tsdoc-policy.md`
for good and bad examples.

Before committing, run final-mode TSDoc lint and inspect the diff for stale,
duplicated, or mechanically generated comments. Missing documentation on a
changed public contract means the slice is incomplete.

Commit test and implementation together using Conventional Commits. Once
implementation is complete, hand the branch to `post-implement`.

Do not prepare the PR or clean up the branch here. Those are the
`post-implement` responsibilities.

## Completion

The approved ticket plan is implemented, focused and applicable full checks
are recorded, and the branch contains the committed implementation ready for
review.
