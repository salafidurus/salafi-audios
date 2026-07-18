# AGENT.md - packages/core-contracts

This package defines shared TypeScript contracts (DTOs, types) and query infrastructure for the Salafi Durus platform.

## Path aliases

- Use `@/` for package-local imports (maps to `src/*`).

## What lives here vs domain-\* packages

- `@sd/core-contracts` — base infrastructure: `httpClient`, `useApiQuery`, `endpoints`, `queryKeys`, and shared TypeScript types (DTOs).
- `@sd/domain-*` — feature-level hooks built on top (e.g. `useScholarDetail`, `useFeedRecent` from `@sd/domain-content`).

Import DTOs from `@sd/core-contracts`. For data-fetching hooks, import from the relevant `@sd/domain-*` package.

## Usage

```typescript
// Types
import { LectureViewDto, ScholarViewDto } from "@sd/core-contracts";

// HTTP client (raw)
import { httpClient } from "@sd/core-contracts/http";
const data = await httpClient<ScholarViewDto>({ url: "/scholars/al-albani", method: "GET" });

// API client init (once per app)
import { initApiClient } from "@sd/core-contracts";
initApiClient({ baseUrl: process.env.NEXT_PUBLIC_API_URL, getAccessToken: () => getAuthToken() });
```

## When types change

1. Update types in `src/types/`.
2. Update `src/query/hooks/` and `src/query/query-keys.ts` if the endpoint or hook signature changed.
3. Run `bun run --filter @sd/core-contracts build` before testing downstream apps.

## Quality rules

- Keep types minimal and focused on API boundaries.
- Avoid business logic in contracts.
- Use `readonly` for immutable properties.
- Prefer branded types over primitives where it prevents misuse.

## Troubleshooting

- If build outputs still contain `@/` path aliases, add `tsc-alias` to the package and run it after `tsc` (example: `tsc -p tsconfig.build.json && tsc-alias -p tsconfig.build.json`).
