---
name: research
description: Investigate a question against high-trust primary sources and return a cited conversational handoff to grilling or specification. Use when the user wants a topic researched, docs or API facts gathered, or reading legwork delegated to a background agent.
---

Research is a decision input, not a durable repository artifact. Synthesize the
answer in the conversation and recommend the next human-controlled workflow.

Spin up a **background agent** to do the source gathering when possible, so you
keep working while it reads. The agent may save intermediate evidence and
drafts under `.research/<research-slug>/`; that directory is ignored and is
temporary working state. Keep all scratch files there, redact secrets and
private data, and never turn a scratch draft into a tracked document.

Its job:

1. Investigate the question against **primary sources** (official docs, source code, specs, first-party APIs), not a secondary write-up of them. Follow every claim back to the source that owns it.
2. Record intermediate evidence in `.research/<research-slug>/` when a file is useful, citing each claim's source.
3. Return the findings to the main agent for conversational synthesis; do not publish issues, PRs, ADRs, specs, tickets, or durable documentation.

## Required handoff

The final response must include:

- The conclusion and the evidence supporting it.
- Primary-source links for every material external claim.
- Local repository evidence, clearly separated from inference.
- Uncertainty, unavailable sources, and remaining risks.
- Exactly one recommended next workflow, with its reason:
  - Recommend `grill-with-docs` when architectural choices, domain terms, user priorities, or other material decisions remain open.
  - Recommend `to-spec` when the problem and solution direction are settled and the remaining work is synthesis into a specification.

Recommend the workflow without invoking it. The user controls the transition.

## Completion checks

Before returning the handoff, verify that all temporary research files are
under `.research/`, no tracked repository file was changed, and no external
write was performed. The research result lives in the conversation; scratch
files are disposable evidence, not project documentation.
