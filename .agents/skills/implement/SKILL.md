---
name: implement
description: "Implement a piece of work based on a spec or set of tickets."
disable-model-invocation: true
---

Implement the work described by the user in the spec or tickets.

Before editing, determine whether the requested scope includes any files under
`apps/native`:

- If it does, work in the current checkout. Do not create or use a git
  worktree, because native changes may require rebuilding native code against
  the current development environment.
- Otherwise, create and use an isolated worktree under `.worktrees`, branched
  from `origin/main`, following `.agents/rules/worktree-rules.md`.

Use /tdd where possible, at pre-agreed seams.

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

Once done, use /code-review to review the work.

Commit your work to the current branch.
