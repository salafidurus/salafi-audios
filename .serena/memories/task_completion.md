# Task Completion Checklist

When a coding task is "done", verify:

## Type Safety

- `bun run typecheck` passes (entire monorepo)
- No errors in modified files specifically

## Linting & Format

- `bun run lint` passes
- `bun run format:check` passes (or `bun run format` to auto-fix)
- Markdownlint rules: MD040 (language on code blocks), MD032 (blank lines before/after lists)

## Tests

- `bun run test` passes for entire suite
- New tests written (TDD: test written first, then implementation)
- Test file coverage: services, hooks, auth boundaries, domain logic
- All tests green (no skipped or pending tests)

## Build

- `bun run build` succeeds (web, api)
- No build warnings (except pre-existing)

## Specific to Web App Tasks

```bash
# Run all web checks
bun run --filter web typecheck
bun run --filter web lint
bun run --filter web test
bun run --filter web build
```

## Pre-push Verification

Run the prepush suite (what pre-push hook runs):

```bash
bun run test:prepush
```

## Commit Protocol

- Conventional Commits format
- Include `Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>`
- Single commit per logical change (or one commit per stage if multi-stage)

## Manual Verification

- App behavior unchanged (if refactor)
- UI responsive on mobile/tablet/desktop (if UI work)
- No console errors
- No broken images/icons
- No layout shifts

## Code Review Checklist

- No hardcoded values (use design tokens)
- No duplication with existing code
- Error handling is appropriate
- No security vulnerabilities (XSS, CSRF, SQL injection, etc.)
- Backwards-compatible or all usages updated
- Comments for non-obvious constraints only
