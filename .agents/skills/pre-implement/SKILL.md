---
name: pre-implement
description: "Investigate one implementation ticket and produce an execution-ready plan."
disable-model-invocation: true
---

# Pre-Implementation

Prepare one implementation ticket for execution. This skill is planning-only:
do not edit production code, create branches, commit, push, or open a PR.

## Scope

The input must be an implementation ticket, not a specification umbrella. If a
ticket belongs to a specification, study the parent specification and its
relevant ticket/dependency graph first, then plan only the selected ticket.

## Investigation

When planning isolated work, recommend a worktree under the repository-root
`.worktree/`, based on `origin/main`. Choose a concise slug: prefer one word
and never use more than two words. Use the same slug in the worktree path and
branch name. Apply the appropriate prefix:

- Chore or CI: `.worktree/c-<slug>`, branch `c/<slug>`
- Feature: `.worktree/f-<slug>`, branch `f/<slug>`
- Bug fix or hotfix: `.worktree/fix-<slug>`, branch `fix/<slug>`

For example, use the slug `audio-improve` to recommend
`.worktree/c-audio-improve` with branch `c/audio-improve`.

For a specification ticket, resolve the parent specification and its recorded
`spec/<slug>` integration branch. The plan must identify that parent and carry
the current spec branch as the ticket's branch context. If the parent
specification does not define a `spec/<slug>` branch, use `origin/main` as the
provisional base, continue planning, and explicitly report that the
specification integration context is missing; do not claim spec-branch
isolation or invent a spec-branch PR target. For standalone bug, research,
maintenance, or other non-specification work, explicitly record that no parent
specification or spec branch applies and retain the existing `origin/main`
base with `main` as the pull-request target.

Every plan records this routing context:

| Ticket context                               | Branch base                 | Pull-request target            |
| -------------------------------------------- | --------------------------- | ------------------------------ |
| Specification ticket with a verified branch  | `spec/<slug>`               | `spec/<slug>`                  |
| Specification ticket without branch metadata | `origin/main` provisionally | unresolved; report the warning |
| Standalone ticket                            | `origin/main`               | `main`                         |

Read and cross-reference:

1. The ticket, comments, labels, dependencies, and acceptance criteria.
2. The parent specification, when one exists.
3. Root and nearest workspace `AGENT.md` files.
4. Relevant `CONTEXT.md`, architecture documents, and ADRs.
5. The current implementation, tests, public seams, package boundaries, and
   affected scripts.
6. Platform-specific constraints, including whether the change touches
   `apps/native`.
7. `.agents/skills/pre-implement/tsdoc-policy.md` when the ticket changes code,
   contracts, or agent-facing implementation guidance.

Resolve facts by inspecting the repository and issue tracker. Surface only
decisions, assumptions, risks, and ambiguities that require human judgment.

## Documentation impact

For every affected public seam, read the implementation and tests and record
the documentation contract in the plan. Identify routes, API clients, hooks,
components, types, adapters, state machines, and meaningful semantic fields.
Explain the behavior, invariant, side effect, and failure mode that callers
need to preserve. Use `.agents/skills/pre-implement/tsdoc-policy.md` for
planning examples; do not plan generic comments or documentation for trivial
locals.

## Output

Produce a clear implementation plan in the conversation with:

- Ticket and specification scope.
- Current behavior and desired behavior.
- Domain terms and relevant architectural constraints.
- Exact files/modules likely to change and why.
- Test seams and a red → green vertical-slice sequence.
- Native/worktree classification and platform validation.
- Proposed worktree name and branch name when isolation is required.
- Required environment-file copy, dependency-install, and pre-work verification
  steps for the selected checkout.
- Ordered implementation stages and completion criteria.
- Documentation seams, TSDoc requirements, examples, and validation steps.
- Risks, migrations, follow-up work, and unresolved decisions.

The default output is conversation-only. Add the plan as a GitHub issue
comment only when the user explicitly requests publication there.

## Completion

Stop when every acceptance criterion maps to an implementation or test step,
the checkout mode, worktree/branch, setup, and validation steps are classified,
and no material scope decision remains hidden.
Wait for the user's approval before implementation begins. Once the plan is approved, hand off to `implement`.
