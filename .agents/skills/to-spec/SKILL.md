---
name: to-spec
description: "Turn the current conversation into a spec and publish it to the project issue tracker: no interview, just synthesis of what you've already discussed."
disable-model-invocation: true
---

This skill takes the current conversation context and codebase understanding and produces a spec. Do NOT interview the user; just synthesize what you already know.

Use [issue-tracker.md](../../../docs/agents/issue-tracker.md) and
[triage-labels.md](../../../docs/agents/triage-labels.md) for the repository's
GitHub workflow and label vocabulary.

When an existing specification is named, read [REPAIR.md](REPAIR.md) and use
its reconciliation procedure instead of publishing a second specification.

## Operating modes

- **New specification:** synthesize and publish one new specification issue.
- **Existing specification:** reconcile the named specification in place;
  preserve its issue number, history, linked tickets, and valid decisions.

Do not mix these modes. A repair must never silently become a new publication.

## Process

1. Explore the repo to understand the current state of the codebase, if you haven't already. Use the project's domain glossary vocabulary throughout the spec, and respect any ADRs in the area you're touching.

2. Sketch out the seams at which you're going to test the feature. Existing seams should be preferred to new ones. Use the highest seam possible. If new seams are needed, propose them at the highest point you can. The fewer seams across the codebase, the better - the ideal number is one.

Present the proposed seams and any material scope decisions for approval before
publishing or repairing the tracker. This is a decision checkpoint, not a new
discovery interview.

3. For a new specification, choose a concise slug and create `spec/<slug>`
   from `main` (the local equivalent is `origin/main`) before publishing. For
   an existing specification, resolve its recorded branch and repair it only
   through [REPAIR.md](REPAIR.md). A spec branch is disposable integration
   context and belongs to exactly one specification.

4. Write or reconcile the spec using the template below, then publish the
   approved new or changed body to the project issue tracker. Apply both
   `ready-for-agent` and the `spec` artifact label to an open specification;
   no additional triage transition is needed for publication. If the tracker
   does not have `spec` yet, create it before publishing. Record the
   specification issue number and `spec/<slug>` branch together on the
   specification issue so `to-tickets` and later lifecycle stages resolve the
   same context. Existing issue comments remain historical evidence.

5. End with the lifecycle handoff: recommend `to-tickets` for a new or
   reconciled specification, and do not start implementation from this skill.

<spec-template>

## Problem Statement

The problem that the user is facing, from the user's perspective.

## Solution

The solution to the problem, from the user's perspective.

## User Stories

A LONG, numbered list of user stories. Each user story should be in the format of:

1. As an <actor>, I want a <feature>, so that <benefit>

<user-story-example>
1. As a mobile bank customer, I want to see balance on my accounts, so that I can make better informed decisions about my spending
</user-story-example>

This list of user stories should be extremely extensive and cover all aspects of the feature.

## Implementation Decisions

A list of implementation decisions that were made. This can include:

- The modules that will be built/modified
- The interfaces of those modules that will be modified
- Technical clarifications from the developer
- Architectural decisions
- Schema changes
- API contracts
- Specific interactions

Do NOT include specific file paths or code snippets. They may end up being outdated very quickly.

Exception: if a prototype produced a snippet that encodes a decision more precisely than prose can (state machine, reducer, schema, type shape), inline it within the relevant decision and note briefly that it came from a prototype. Trim to the decision-rich parts, not a working demo, just the important bits.

## Testing Decisions

A list of testing decisions that were made. Include:

- A description of what makes a good test (only test external behavior, not implementation details)
- Which modules will be tested
- Prior art for the tests (i.e. similar types of tests in the codebase)

## Out of Scope

A description of the things that are out of scope for this spec.

## Further Notes

Any further notes about the feature.

</spec-template>
