# Suggested Commands

## Token Optimization (snip/RTK)

**Golden Rule**: Always prefix commands with `snip`. Even in command chains with `&&`, use `snip`:

```bash
# ✅ Correct
snip -- git status
snip -- git commit -m "msg"
snip -- git push

# ❌ Wrong
git status
git commit -m "msg"
```

`snip` reduces output by 60-90% (80% savings on diffs, 90%+ on tests). Use it for ALL commands.

## Development

```bash
snip -- bun run dev
snip -- bun run dev:api
snip -- bun run dev:web
snip -- bun run dev:native

# Native build
snip -- bun run dev:native:build:android
snip -- bun run dev:native:clean-build:android
```

## Scoped Execution

```bash
# Web app
snip -- bun run --filter web typecheck
snip -- bun run --filter web test src/path/to/file.spec.tsx
snip -- bun run --filter web test:e2e -- --grep "test name"

# API
snip -- bun run --filter api test -- src/path/to/file.spec.ts

# DB package
snip -- bun run --filter @sd/core-db prisma:generate
```

## Quality & Build

```bash
snip -- bun run lint
snip -- bun run format
snip -- bun run typecheck
snip -- bun run test
snip -- bun run build
```

## Git (Always use snip)

```bash
snip -- git status
snip -- git log
snip -- git diff
snip -- git add .
snip -- git commit -m "message"
snip -- git push
snip -- git worktree add .worktrees/f-name origin/main -b f/name
```

## Content Ingest

```bash
snip -- bun run ingest:content
snip -- bun run ingest:remove
```
