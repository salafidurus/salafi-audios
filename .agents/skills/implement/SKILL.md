---
name: implement
description: "Implement a piece of work based on a spec or set of tickets."
disable-model-invocation: true
---

Implement the work described by the user in the spec or tickets.

Before editing, read the repository instructions in `AGENT.md`, the nearest
app/package `AGENT.md`, `.agents/rules/tdd-rules.md`, and
`.agents/rules/worktree-rules.md`. Treat those files as mandatory workflow
rules, not optional guidance.

Before editing, determine whether the requested scope includes any files under
`apps/native`:

- If it does, work in the current checkout. Do not create or use a git
  worktree, because native changes may require rebuilding native code against
  the current development environment.
- Otherwise, create and use an isolated worktree under `.worktrees`, branched
  from `origin/main`, following `.agents/rules/worktree-rules.md`.

Use the test-first sequence in `.agents/rules/tdd-rules.md`: write a failing
behavior test, confirm the failure, implement the smallest change, verify the
focused test, and run the applicable full suite before committing.

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

Once done, use /code-review to review the work.

Commit your work to the current branch.

Before creating the PR, include a GitHub closing reference such as
`Closes #123` in the PR body and verify that the PR points at the intended
issue. After the PR is merged, verify the issue is closed; if GitHub did not
close it automatically, remove `ready-for-agent` with `gh issue edit
<number> --remove-label ready-for-agent`, close it with `gh issue close`, and
comment with the merged PR number.

After merge, follow `.agents/rules/worktree-rules.md` to fast-forward local
`main`, remove the completed worktree, delete its local branch, and verify the
remaining worktrees and `main` status.
