# @sd/domain-search

> Search query state management, API integration, and result processing

## Purpose

Manages search query execution and result processing. Provides the search API client, hooks for search state, and utility functions that transform raw search responses into display-ready row models consumed by feature-level search screens.

## Boundaries

- **Depends on:** `@sd/core-contracts`, `react`
- **Consumed by:** `@sd/feature-search`, `apps/web`, `apps/native`

## Structure

```text
src/
├── api/
│   └── search.api.ts                  # Search API client
├── hooks/
│   └── use-search-processing.ts       # Search processing hook
├── utils/
│   └── build-search-result-rows.ts    # Result row transformation
└── index.ts                           # Public entrypoint
```

## Key Commands

- `bun run --filter @sd/domain-search typecheck` — Type check

## Constraints

- No UI components belong here — search screens live in `@sd/feature-search`.
- Keep API and state logic cross-platform; avoid platform-specific imports.
