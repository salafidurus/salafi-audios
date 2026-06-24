# CodeGraph — Structural Code Intelligence

A `.codegraph/` index exists at the repo root. **Reach for it before grep, find, or reading files.**

## MCP tools (preferred)

Load via ToolSearch if deferred: `select:codegraph_explore,codegraph_node,codegraph_search,codegraph_callers`

- `codegraph_explore` — answers most "how does X work" or "where is Y" questions in one call; returns verbatim source grouped by file (Read-equivalent)
- `codegraph_node` — one symbol's source + callers; or reads a whole file with line numbers
- `codegraph_search` — find symbols by name
- `codegraph_callers` — trace who calls a function

## CLI fallback

```
snip -- codegraph explore "<question or symbol names>"
snip -- codegraph node <symbol-or-file>
snip -- codegraph callers <symbol>
snip -- codegraph sync
```

## Rules

- One `codegraph_explore` call usually answers the question. Do not grep + read when codegraph already indexed it.
- After editing files, run `codegraph sync` (or wait ~1s for the file watcher) before querying for updated symbols.
- For fuzzy or semantic search when you don't know the exact symbol name, use `ccc` (see ccc-rules.md).
