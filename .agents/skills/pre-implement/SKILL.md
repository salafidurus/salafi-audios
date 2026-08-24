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

Read and cross-reference:

1. The ticket, comments, labels, dependencies, and acceptance criteria.
2. The parent specification, when one exists.
3. Root and nearest workspace `AGENT.md` files.
4. Relevant `CONTEXT.md`, architecture documents, ADRs, and existing plans.
5. The current implementation, tests, public seams, package boundaries, and
   affected scripts.
6. Platform-specific constraints, including whether the change touches
   `apps/native`.

Resolve facts by inspecting the repository and issue tracker. Surface only
decisions, assumptions, risks, and ambiguities that require human judgment.

## Output

Produce a clear implementation plan in the conversation with:

- Ticket and specification scope.
- Current behavior and desired behavior.
- Domain terms and relevant architectural constraints.
- Exact files/modules likely to change and why.
- Test seams and a red → green vertical-slice sequence.
- Native/worktree classification and platform validation.
- Ordered implementation stages and completion criteria.
- Risks, migrations, follow-up work, and unresolved decisions.

The default output is conversation-only. Add the plan as a GitHub issue
comment only when the user explicitly requests publication there.

## Completion

Stop when every acceptance criterion maps to an implementation or test step,
the worktree mode is classified, and no material scope decision remains hidden.
Wait for the user's approval before implementation begins.
