---
name: diagnosing-bugs
description: Diagnose hard bugs and performance regressions by building a tight, red-capable feedback loop before forming or testing hypotheses.
---

# Diagnosing Bugs

Use this skill when behavior is broken, throwing, incorrect, flaky, slow, or
otherwise unexplained. Diagnosis establishes the cause and evidence. It does
not authorize a code change; after diagnosis, apply the fix only when the user
has requested implementation or the active ticket explicitly includes it.

Before investigating, read the root and nearest workspace `AGENT.md`,
`.agents/rules/worktree-rules.md`, and `CONTEXT.md` or relevant ADRs when they
exist. Classify the work as an issue ticket, a specification investigation, or
an untracked diagnosis. A specification selects tickets; diagnosis itself does
not turn an umbrella specification into an implementation task.

## 1. Build the feedback loop first

The first deliverable is one tight command that reaches the real bug path and
asserts the user's exact symptom. Use the strongest available seam, in this
order:

1. A failing unit, integration, or end-to-end test.
2. A curl or HTTP script against a running service.
3. A CLI fixture invocation with known-good output.
4. A Playwright or Puppeteer script asserting DOM, console, or network behavior.
5. A replayable captured trace, request, payload, or event log.
6. A minimal throwaway harness for the affected path.
7. A property or fuzz loop for intermittent wrong output.
8. A bisection harness when the regression range is known.
9. A differential loop comparing versions or configurations.
10. A human-assisted loop only through a clearly marked HITL script.

Redact secrets, tokens, personal data, and authorization headers before showing
commands, output, logs, traces, or captured artifacts. If redaction removes the
signal needed for diagnosis, say what is missing and ask for a safer artifact.

The loop is ready only when it is:

- **Red-capable:** it can fail on the reported symptom, not merely crash.
- **Deterministic:** it gives the same verdict, or has a measured high
  reproduction rate for a nondeterministic bug.
- **Tight:** it runs in seconds or is the narrowest practical loop.
- **Agent-runnable:** it runs unattended unless the HITL path is explicit.

Run the loop at least once and record the invocation and redacted result before
forming a preferred explanation. If no red-capable loop can be built, stop and
report what was tried; request access, a redacted artifact, or permission for
temporary instrumentation rather than guessing.

## 2. Reproduce and minimise

Run the loop against the user's scenario. Confirm that the failure is the same
symptom the user reported, then reduce inputs, callers, configuration, data,
and steps one at a time. Keep a reduction only when the bug remains red. The
minimal reproduction is complete when every remaining element is load-bearing.

For flaky bugs, measure the reproduction rate and improve it with controlled
repetition, fixed seeds, pinned time, isolated state, or a narrow timing
window. Do not call a flaky pass a fix without rerunning the original scenario.

## 3. Rank falsifiable hypotheses

Write three to five ranked hypotheses. Each must predict an observable result:

> If `<X>` is the cause, changing `<Y>` should make the loop green, while
> changing `<Z>` should make it worse or leave it red.

Test the cheapest discriminating prediction first and change one variable at a
time. Show the ranked hypotheses when human domain knowledge would materially
change their order; otherwise continue and report the ranking with the
evidence. Do not wait indefinitely for a response when the user has not asked
for an approval checkpoint.

## 4. Instrument one boundary at a time

Prefer a debugger or REPL, then targeted logs at boundaries that distinguish
the hypotheses. Tag temporary logs with a unique prefix such as
`[DEBUG-a4f2]`, and remove every tagged log before completion.

For performance regressions, measure a baseline before changing code. Use a
timing harness, profiler, query plan, or equivalent measurement rather than
filling the path with logs. Compare the same workload, environment, and
measurement points after each candidate change.

## 5. Fix through the TDD loop when authorized

When implementation is in scope, use the repository `tdd` skill for the fix:

1. Write a regression test at the correct public seam.
2. Confirm it is red for the reported bug, not for test setup.
3. Implement the smallest fix that addresses the proven cause.
4. Confirm the focused test and original feedback loop are green.
5. Run the applicable full checks and commit the test and fix together in a
   Conventional Commit before the next independent slice.

If no correct public seam exists, record that architectural finding instead of
writing a shallow test that gives false confidence. Refactoring is separate
from the red → green loop and belongs to `code-review`; do not mix unrelated
cleanup into the bug-fix commit.

## 6. Clean up and report

Before declaring diagnosis or an authorized fix complete:

- rerun the original, un-minimised scenario;
- rerun the regression test or document why no correct seam exists;
- remove all tagged instrumentation and throwaway prototypes;
- state the confirmed cause, evidence, and rejected hypotheses;
- record remaining risks, migrations, and follow-up work;
- identify the exact commands and results, with secrets redacted.

For an implementation, hand the committed slice to `code-review`. Do not
prepare a PR or remove a worktree from this skill; `post-implement` owns PR
preparation and merge-gated cleanup.
