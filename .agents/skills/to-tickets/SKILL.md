---
name: to-tickets
description: Break a plan, spec, or the current conversation into a set of tracer-bullet tickets, each declaring its blocking edges, published to the configured tracker (edges as text in one file per ticket locally, or native blocking links on a real tracker).
disable-model-invocation: true
---

# To Tickets

Break a plan, spec, or conversation into a set of **tickets**: tracer-bullet vertical slices, each declaring the tickets that **block** it.

Use [issue-tracker.md](../../../docs/agents/issue-tracker.md) and
[triage-labels.md](../../../docs/agents/triage-labels.md) for the repository's
GitHub workflow and label vocabulary.

When an existing specification or ticket set is named, read
[REPAIR.md](REPAIR.md) and reconcile the existing graph instead of publishing
duplicates. When research, grilling, or implementation planning reveals that
an existing ticket is not execution-ready, also read [REVISE.md](REVISE.md).

## Operating modes

- **New ticket set:** draft and publish tickets for a specification that has no
  published implementation ticket set.
- **Existing ticket set:** repair the named specification's tickets in place;
  preserve issue numbers, closed states, historical comments, and valid
  dependency evidence.
- **Research-driven revision:** update one existing ticket after a documented
  research, grilling, or scope clarification pass; preserve its issue number
  and history, then return it through triage before implementation resumes.

Never treat a repair or revision as a fresh ticket publication.

## Process

### 1. Gather context

Work from whatever is already in the conversation context. If the user passes a reference (a spec path, an issue number or URL) as an argument, fetch it and read its full body and comments. For a specification ticket, resolve the parent specification and its recorded `spec/<slug>` branch before drafting the ticket. A standalone ticket has no parent specification and no spec-branch context.

### 2. Explore the codebase (optional)

If you have not already explored the codebase, do so to understand the current state of the code. Ticket titles and descriptions should use the project's domain glossary vocabulary, and respect ADRs in the area you're touching.

Look for opportunities to prefactor the code to make the implementation easier. "Make the change easy, then make the easy change."

### 3. Draft vertical slices

Break the work into **tracer bullet** tickets.

<vertical-slice-rules>

- Each slice cuts a narrow but COMPLETE path through every layer (schema, API, UI, tests): vertical, NOT a horizontal slice of one layer
- A completed slice is demoable or verifiable on its own
- Each slice is sized to fit in a single fresh context window
- Any prefactoring should be done first

</vertical-slice-rules>

<conflict-and-gate-audit-rules>

- **Conflict Audit**: Conduct an explicit conflict audit across all non-blocking (sibling) tickets to guarantee zero parallel file or context collisions. If two tickets touch overlapping files, shared symbols, or component modules, sequence them explicitly or separate their boundaries so no merge collisions occur.
- **Feasibility & Green Gate Guarantee**: Verify and ensure that every ticket can be implemented and tested successfully with green verification gates (`test`, `typecheck`, `lint`) without breaking existing app functionality or introducing runtime regressions.

</conflict-and-gate-audit-rules>

Give each ticket its **blocking edges**: the other tickets that must complete before it can start. A ticket with no blockers can start immediately.

### Finalization ticket

Every specification ticket set must end with one final spec-finalization
ticket. Publish it after the implementation tickets have been drafted, and set
its blockers to **every implementation ticket in the specification**. It is
the terminal node of the existing graph, not a new lifecycle stage. Its
acceptance criteria must require:

- Merge `spec/<slug>` into `main` and resolve any conflicts.
- Run the complete specification acceptance matrix.
- Open the final pull request with `spec/<slug>` as head and `main` as base.
- Preserve the `spec/<slug>` branch until that pull request is merged.

The finalization ticket must identify the parent specification and recorded
`spec/<slug>` branch. Do not publish it for a standalone ticket set. If the
specification has no implementation tickets, its blocker set must explicitly
say `None (can start immediately)`.

**Wide refactors are the exception to vertical slicing.** A **wide refactor** is one mechanical change (rename a column, retype a shared symbol) whose **blast radius** fans across the whole codebase, so a single edit breaks thousands of call sites at once and no vertical slice can land green. Don't force it into a tracer bullet; sequence it as **expand–contract**. First expand: add the new form beside the old so nothing breaks. Then migrate the call sites over in batches sized by blast radius (per package, per directory), each batch its own ticket blocked by the expand, keeping CI green batch to batch because the old form still exists. Finally contract: delete the old form once no caller remains, in a ticket blocked by every migrate batch. When even the batches can't stay green alone, keep the sequence but let them share an integration branch that all block a final integrate-and-verify ticket; green is promised only there.

### 4. Quiz the user

Present the proposed breakdown as a numbered list. For each ticket, show:

- **Title**: short descriptive name
- **Blocked by**: which other tickets (if any) must complete first
- **What it delivers**: the end-to-end behaviour this ticket makes work

Before presenting to the user, verify and include in the presentation:
1. **Conflict Audit**: Explicitly review non-blocking tickets and confirm there are no conflicts or file collisions between them.
2. **Green-Gate Feasibility & App Stability**: Explicitly confirm that each ticket can be implemented and tested successfully with green gates without breaking existing setup or app functionality.

Ask the user:

- Does the granularity feel right? (too coarse / too fine)
- Are the blocking edges correct: does each ticket only depend on tickets that genuinely gate it?
- Are there any potential file or context conflicts between non-blocking tickets?
- Is the green-gate & app stability guarantee clear and sound?
- Should any tickets be merged or split further?

Before asking for approval, write down the complete dependency matrix, including
every ticket whose blockers are explicitly "None". Do not infer that an
implementation order is a blocking edge: only mark a ticket blocked when the
blocked ticket genuinely cannot start without the blocker. If the proposed
implementation order is intended to be a strict sequence, show those edges in
the numbered breakdown and get approval for them.

Iterate until the user approves the breakdown.

### 5. Publish or repair the tickets in the configured tracker

Publish the approved tickets using the GitHub workflow documented in
[issue-tracker.md](../../../docs/agents/issue-tracker.md); the tickets are the same, with native GitHub
blocking edges where supported:

- **Local files** → write one file per ticket under `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01` in dependency order (blockers first). Each file's "Blocked by" lists the numbers/titles it depends on. Use the per-ticket file template below: one ticket per file, never a single combined file.
- **A real issue tracker (GitHub, Linear, …)** → publish one issue per ticket in dependency order (blockers first) so each ticket's blocking edges can reference real identifiers. Use the platform's native blocking / sub-issue relationship where it has one; otherwise set each ticket's "Blocked by" to the blocking issues. Apply both `ready-for-agent` and the `ticket` artifact label unless instructed otherwise; if the tracker does not have `ticket` yet, create it before publishing. The tickets are agent-grabbable by construction.

Work the **frontier**: any ticket whose blockers are all done. For a purely linear chain that means top to bottom.

Before finishing publication, perform a dependency audit:

- Compare the approved dependency matrix with every ticket's published
  `Blocked by` section.
- On GitHub or another tracker with native dependencies, create one native
  `blocked_by` edge for every approved blocker and verify the returned edges for
  every published ticket, including tickets whose blocker set is empty.
- On trackers without native dependencies, verify that every approved edge is
  present in the ticket body and that every no-blocker ticket explicitly says
  "None (can start immediately)".
- Do not report the ticket set as complete until the audit finds no missing or
  extra edges. If an edge cannot be represented, stop and report the exact
  missing relationship instead of silently publishing an incomplete graph.

Do NOT close or modify any parent issue during new ticket publication. For
existing-specification repair, modify the parent only when the approved repair
explicitly includes correcting its branch or lifecycle metadata; never close
it as part of ticket reconciliation.

After the approved ticket set and dependency graph are published, recommend proceeding to `pre-implement` for the first unblocked ticket. The lifecycle then continues through `implement` and `post-implement`; once every implementation ticket is complete, the finalization ticket is the only remaining frontier node.

<ticket-template>

# <NN>: <Ticket title>

**What to build:** the end-to-end behaviour this ticket makes work, from the
user's perspective. Describe the outcome, not a layer-by-layer implementation
list.

**Key contracts:** the durable interfaces, domain rules, or decisions that an
agent must preserve while implementing the ticket. Name behavior and public
interfaces; omit paths and details that are likely to move.

**Acceptance criteria:** each criterion must be independently testable and
describe observable behavior. Include unhappy paths, authorization boundaries,
and migration compatibility when they apply.

- [ ] Criterion 1
- [ ] Criterion 2

**Out of scope:** the adjacent behavior that this ticket explicitly does not
change. This section is mandatory, even when it contains only one boundary.

- Adjacent behavior not included in this ticket

**Blocked by:** only tickets that genuinely prevent this ticket from starting.
Use "None (can start immediately)" when no such ticket exists.

For the final spec-finalization ticket, **Blocked by** must list every
implementation ticket in the specification, never only the last ticket in an
implementation order.

</ticket-template>

### Platform deltas

Use the same ticket content on every platform, then apply only these publishing
differences:

- **GitHub:** when the ticket belongs to a specification, the first line must
  be `Part of #<spec-number>`. Use a concise Conventional Commit-style title,
  and apply the `ticket` and `ready-for-agent` labels unless the workflow says
  otherwise. Preserve the parent specification and spec branch in the ticket's
  lifecycle context; specification ticket branches use the recorded spec
  branch as their integration context. Represent blockers in both the body and
  GitHub's native dependency graph when available.
- **Local files:** number files from `01` in dependency order under the
  feature's issue directory. Keep the ticket title, contracts, acceptance
  criteria, out-of-scope boundary, and blocker wording from the canonical
  template; do not add tracker-only metadata.

Do not add specific file paths or implementation snippets: they go stale fast.
Include a compact decision shape only when it communicates a contract more
precisely than prose, such as a state machine, reducer, schema, or type shape.
Trim it to the decision-rich parts rather than pasting a working demo.

### Worked example

```markdown
# 01: Resume unfinished listening from Home

**What to build:** An authenticated listener can open Home and resume the most
recent unfinished track, while an anonymous visitor sees the public Home
content without a personal progress request.

**Key contracts:** Public Home data remains available without a session.
Continue Listening is a personal projection and is absent while progress is
loading, when no unfinished progress exists, and after completion.

**Acceptance criteria:**

- [ ] Anonymous Home loads public content without requesting personal progress
- [ ] Authenticated Home shows unfinished progress in recency order
- [ ] Completed progress is not shown in Continue Listening

**Out of scope:**

- Changing playback controls or the public Catalog ordering

**Blocked by:** None (can start immediately)
```
