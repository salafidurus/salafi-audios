---
name: tdd
description: Test-driven development. Use when building features or fixing bugs test-first, or when integration tests are needed.
---

# Test-Driven Development

This skill is the repository's authoritative red → green loop. Use it during
every implementation cycle; there is no separate TDD rule file.

When exploring the codebase, read `CONTEXT.md` (if it exists) so test names and
interface vocabulary match the project's domain language, and respect ADRs in
the area you're touching.

## What a good test is

Tests verify behavior through public interfaces, not implementation details.
They should read like specifications and survive refactoring. See
[tests.md](tests.md) for examples and [mocking.md](mocking.md) for mocking
guidelines.

## Seams

A **seam** is the public boundary where behavior is observed. Test at the
public behavioral seams identified by the approved implementation plan. If a
seam or public interface is materially uncertain, resolve that decision before
writing the test. When the interface shape is in question, use
`codebase-design` for the shared module vocabulary.

## Anti-patterns

- Implementation-coupled tests mock internals or verify private methods.
- Tautological tests recompute expected values using the implementation itself.
- Horizontal slicing writes all tests before implementation; use vertical
  tracer bullets instead.

## Five-step loop

Repeat this exact five-step loop for each vertical slice:

1. **Write red:** write a failing behavior test at the approved public seam.
2. **Confirm red:** verify it fails because the desired behavior is missing or
   incorrect, not because of test setup.
3. **Implement minimally:** write only enough code to make the current test
   pass.
4. **Confirm green:** rerun the focused test and verify that it passes.
5. **Run the applicable full suite:** confirm that the slice introduces no
   regressions before moving to the next task.

- **Commit the slice:** keep test and implementation together in a
  Conventional Commit before the next independent task.
- **Review refactors separately:** refactoring belongs to `code-review`, not
  the red → green implementation loop.

## Completion

For each slice, the focused test is green, the applicable full suite is green,
and the test and implementation are committed together.
