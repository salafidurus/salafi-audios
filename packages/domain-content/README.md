# @sd/domain-content

> Data hooks for lectures, scholars, series, feed, and library content

## Purpose

Owns the React Query hooks that fetch and expose all content-domain data — the feed,
lectures, scholars, and library (saved, completed, in-progress) — to consuming apps.
Centralises content data access so `apps/web` and `apps/native` share query keys,
pagination logic, and API contracts for the core content catalogue.

## Boundaries

- **Depends on:** `@sd/core-contracts`, `@tanstack/react-query`
- **Consumed by:** `apps/web`, `apps/native`

This package provides **data hooks only** — no UI components, no Zustand stores, and no
business logic beyond composing query results into screen-ready view models. Content write
operations (publishing, archiving) are backend-only and must go through `apps/api`.

## Entrypoints

```text
src/
├── feed.api.ts            # useFeedRecent, useFeedFollowing, useFeedList
├── lecture.api.ts         # useLectureDetail
├── scholar.api.ts         # useScholarDetail, useScholarContent
├── library.api.ts         # useLibrarySaved, useLibraryCompleted, useLibraryProgress
├── use-feed.ts            # useFeed (infinite scroll), useFeedScholars
├── use-feed-recent.ts     # useFeedRecentScreen
├── use-feed-following.ts  # useFeedFollowingScreen
├── use-lecture-detail.ts  # useLectureDetailScreen
├── use-scholar-detail.ts  # useScholarDetailScreen
├── use-library-saved.ts   # useLibrarySavedScreen
├── use-library-completed.ts  # useLibraryCompletedScreen
├── use-library-progress.ts   # useLibraryProgressScreen
└── index.ts               # Single public entrypoint
```

**Hook naming convention:**

- `*.api.ts` — raw React Query hooks that map directly to API endpoints
- `use-*.ts` — screen-level composition hooks that combine one or more API hooks

## Key Commands

- `pnpm --filter domain-content typecheck` — Type check
- `pnpm --filter domain-content test` — Run tests

## Known Constraints

- **No build step.** This package exports directly from `src/` (TypeScript source). Apps
  consume it via workspace resolution; no `dist/` is produced.
- **Infinite scroll uses cursor pagination.** `useFeed` uses `useInfiniteQuery` with a
  cursor from `FeedPageDto.nextCursor`. Page-based pagination is not used here.
- **Query keys are owned by `@sd/core-contracts`.** Import `queryKeys` from there — do not
  define local query key factories in this package to avoid key collisions across apps.
- **Filter parameters (topic/scholar slugs) are passed by the caller.** Hooks accept
  optional filter arrays and encode them as comma-separated query params to match the API
  contract.

## Related Docs

- `docs/api.md` — content API endpoints and response shapes
- `docs/architecture.md` — monorepo package boundaries
