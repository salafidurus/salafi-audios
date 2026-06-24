# Headroom — Context Management

Headroom compresses and optimizes content going into context. Use it when context is under pressure or snip's filters aren't enough.

## When to use

- Command output is still too large after snip filters it → use `headroom proxy`
- Reading a large file and only need structure, not every line
- Before a large multi-file operation → check remaining budget with `headroom stats`
- Complex cross-file diff that's too noisy → use `headroom diff`
- Need to know which files are eating the most context → `headroom audit-reads`

## CLI

```
snip -- headroom proxy <command>
snip -- headroom diff
snip -- headroom stats
snip -- headroom audit-reads
headroom memory
```

## Rules

- `snip --` first — it handles most common tools (git, vitest, tsc, pnpm, etc.).
- `headroom proxy` is the fallback for anything snip doesn't filter.
- Never compress security-critical output (auth flows, migration SQL, secrets scanning) — detail matters there.
