# ccc — Semantic Code Search (CocoIndex)

`ccc` provides semantic (vector) search over the codebase — finds patterns by meaning, not exact names.

## When to use

- You don't know the exact symbol name but know what it does ("find the rate-limit middleware")
- Searching for similar implementations ("find all places that paginate results")
- `codegraph_search` returns nothing for the concept you're looking for

## CLI

```
snip -- ccc search "<natural language query>"
snip -- ccc search "<query>" --limit 10
snip -- ccc index
```

Run `ccc index` after adding new files or making significant changes so the semantic index stays current.

## Precedence

1. `codegraph_explore` / `codegraph_search` — structural, exact, fast (always try first)
2. `ccc search` — semantic/fuzzy (when exact search fails or the concept is vague)
3. `Grep` — last resort for config files or patterns outside codegraph's index
