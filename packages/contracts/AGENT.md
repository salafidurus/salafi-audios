# AGENT.md - packages/contracts

This package defines shared TypeScript contracts (DTOs, types) and query infrastructure for the Salafi Durus platform.

## Core responsibilities

- Define authoritative TypeScript types for all API contracts
- Provide TanStack Query (React Query) hooks and client infrastructure
- Ensure type safety across web, mobile, and API boundaries
- Eliminate codegen friction by providing hand-written, stable contracts

## Architecture rules

- **Source of truth**: This package is the single source of truth for shared TypeScript contracts
- **Manual maintenance**: Types are hand-written and reviewed, not auto-generated
- **Stability first**: Contract changes require explicit review and versioning
- **Cross-platform**: Contracts work for web (Next.js), mobile (Expo), and backend (NestJS)

## Path aliases

- Use `@/` for package-local imports (maps to `src/*`).

## Package dependencies

- `@tanstack/react-query`: Query client library
- `@sd/env`: Environment configuration
- `@sd/i18n`: Internationalization types

## Usage guidance

### Importing types

```typescript
import { LectureViewDto, ScholarViewDto, CollectionViewDto } from "@sd/contracts";
```

### Using query hooks

```typescript
import {
  useScholar,
  useScholarStats,
  usePlatformStats,
  initApiClient,
} from "@sd/contracts/query/hooks";

// Initialize once per app
initApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  getAccessToken: () => getAuthToken(),
});

// Use in components
const { data: scholar } = useScholar("al-albani");
const { data: stats } = useScholarStats("al-albani");
```

### HTTP client

```typescript
import { httpClient } from "@sd/contracts/http";

const response = await httpClient({
  url: "/lectures/123",
  method: "GET",
});
```

## Development workflow

1. When API endpoint changes, update types in `src/types/`
2. Update query hooks in `src/query/hooks/` if needed
3. Update `src/query/query-keys.ts` if endpoints changed
4. Update `src/http.ts` for any HTTP client changes
5. Run `pnpm --filter contracts typecheck` to verify
6. Run `pnpm --filter contracts lint` for style compliance
7. Deploy updates across all apps (web, mobile, api)

## Quality rules

- Keep types minimal and focused on API boundaries
- Avoid business logic in contracts
- Use `readonly` for immutable contract properties
- Prefer branded types over primitives (`LectureSlug` vs `string`)
- Add JSDoc for non-obvious contracts
- Export only stable, public contracts
- Keep internal implementation details private

## Build/lint/test commands

- Build: `pnpm --filter contracts build`
- Lint: `pnpm --filter contracts lint`
- Typecheck: `pnpm --filter contracts typecheck`
- Test: `pnpm --filter contracts test`

## Safety checklist

- Do not expose secrets or environment-specific details
- Do not import from apps (web/mobile/api) into this package
- Keep exports stable across minor versions
- Document breaking changes in changelog
- Test type changes with downstream apps before merging

## Troubleshooting

- If build outputs still contain `@/` path aliases, add `tsc-alias` to the package and run it after `tsc` (example: `tsc -p tsconfig.build.json && tsc-alias -p tsconfig.build.json`).
