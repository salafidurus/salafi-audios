# Metadata

- **Date**: 2026-07-04
- **Status**: Planned
- **Scope**: API + contracts + domain-content + native scholar-detail screen
- **Summary**: Add a `GET /scholars/:slug/topics` endpoint that groups a scholar's published content by topic, add the corresponding DTO and hook, and update the native scholar-detail screen to display collapsible topic-groups sections.
- **Dependencies**: Completed Stage 4 (scholar list row). Existing scholar detail and topic infrastructure are stable.

# Progress

- Research phase complete: topic DB schema, API module, contracts, domain hooks, and existing scholar detail screens analyzed.
- Current scholar detail screen groups content as flat unified list (featured/recommended/browse).
- Topics relate to scholars indirectly through Lecture, Series, Collection junction tables.
- No topic-grouping endpoint exists.

# Staging Strategy

1. **Contracts first**: Add `ScholarTopicGroupDto` to `@sd/core-contracts`.
2. **API endpoint**: Add `GET /scholars/:slug/topics` with repository query to group published content by topic, including an "Other" group for untagged content.
3. **Domain hook**: Add `useScholarTopics` to `@sd/domain-content`.
4. **Native screen**: Replace the existing single content list in the scholar-detail screen with topic-grouped collapsible sections.

## Stage 1: Add ScholarTopicGroupDto to contracts

- **Status**: Planned
- **Goal**: Define the new DTO type for topic-grouped scholar content.
- **Files**: `packages/core-contracts/src/types/scholar.types.ts`, `packages/core-contracts/src/index.ts`
- **Changes**: Add `ScholarTopicGroupDto` type:

```typescript
export type ScholarTopicGroupDto = {
  topic: TopicRefDto;
  items: ScholarContentItemDto[];
};

export type ScholarTopicsDto = {
  groups: ScholarTopicGroupDto[];
};
```

Export both from the `@sd/core-contracts` barrel.

- **Blockers**: None currently identified.
- **Dependencies**: None.
- **Completion Criteria**: `bun run --filter @sd/core-contracts build` succeeds; typecheck passes.
- **Suggested Commit Message**: `feat(contracts): add ScholarTopicGroupDto and ScholarTopicsDto for topic-grouped scholar content`

## Stage 2: Add GET /scholars/:slug/topics endpoint

- **Status**: Planned
- **Goal**: Query a scholar's published content grouped by topic, including an "Other" group for untagged content.
- **Files**: `apps/api/src/modules/scholars/scholars.controller.ts`, `apps/api/src/modules/scholars/scholars.service.ts`, `apps/api/src/modules/scholars/scholars.repo.ts`
- **Changes**:
  - `scholars.repo.ts`: Add `getTopics(slug)` method that:
    1. Finds the scholar by slug (or throws NotFoundException)
    2. Queries published lectures with their topics (via `LectureTopic`), filtered to the scholar
    3. Queries published series with their topics (via `SeriesTopic`), filtered to the scholar
    4. Queries published collections with their topics (via `CollectionTopic`), filtered to the scholar
    5. Groups all content items by topic (topic name → content items)
    6. Collects content without any topic into an "Other" group (topic with `id: "other"`, `slug: "other"`, `name: "Other"`)
    7. Returns `ScholarTopicsDto` with sorted groups (by topic name, "Other" last)
  - `scholars.service.ts`: Add `getTopics(slug)` that delegates to repo.
  - `scholars.controller.ts`: Add `GET /:slug/topics` endpoint with `@Public()` decorator.
  - Add unit tests for `getTopics` in the service spec covering:
    - Content grouped by topic
    - Untagged content in "Other" group
    - Scholar not found
- **Blockers**: None currently identified.
- **Dependencies**: Stage 1 (types must exist in contracts first).
- **Completion Criteria**: `bun run --filter api test` passes (all existing + new tests); `bun run --filter api typecheck` passes.
- **Suggested Commit Message**: `feat(api): add GET /scholars/:slug/topics endpoint returning topic-grouped content`

## Stage 3: Add useScholarTopics hook to domain-content

- **Status**: Planned
- **Goal**: Expose a TanStack Query hook for the new topics endpoint.
- **Files**: `packages/domain-content/src/scholar.api.ts`, `packages/domain-content/src/index.ts`
- **Changes**:
  - `scholar.api.ts`: Add `useScholarTopics(slug)` hook that calls `GET /scholars/:slug/topics`, enabled when slug is non-empty, queryKey: `["scholars", "topics", slug]`.
  - `index.ts`: Export `useScholarTopics`.
- **Blockers**: None currently identified.
- **Dependencies**: Stage 2 (endpoint must exist).
- **Completion Criteria**: `bun run --filter @sd/domain-content typecheck` passes; `bun run --filter native typecheck` passes.
- **Suggested Commit Message**: `feat(domain-content): add useScholarTopics hook for topic-grouped scholar content`

## Stage 4: Update native scholar-detail screen with collapsible topic sections

- **Status**: Planned
- **Goal**: Replace the flat ScholarContentList in the native scholar-detail screen with animated collapsible sections per topic, plus an "All" section at the top.
- **Files**: `apps/native/src/features/scholar/screens/scholar-detail/scholar-detail.screen.tsx`, `apps/native/src/features/scholar/screens/scholar-detail/scholar-detail.screen.spec.tsx`
- **Changes**:
  - Add `useScholarTopics(slug)` alongside existing `useScholarDetail(slug)` and `useScholarContent(slug)`.
  - Add a dedicated `TopicSection` sub-component: `Pressable` header row (topic name, chevron icon that rotates on expand/collapse) wrapping a collapsible content area that renders content items in a FlatList with animated height transition via `withLayoutAnimation` or `react-native-reanimated`.
  - Render an "All" section at the top (not collapsible, shows every item from `useScholarContent`).
  - Render each topic group as a collapsible section after "All".
  - On expand, use `LayoutAnimation.configureNext()` for simple native animation. Keep it lightweight — no `react-native-reanimated` dependency needed unless complexity warrants it.
  - Keep the existing ScholarHeader unchanged.
  - Write unit tests:
    - Renders "All" section with all content items
    - Renders topic sections when data is present
    - Tapping a topic header expands/collapses its section
- **Blockers**: None currently identified.
- **Dependencies**: Stage 3 (hook must exist).
- **Completion Criteria**: `bun run --filter native test` passes (all existing + new tests); `bun run --filter native typecheck` passes. Screen renders correctly with grouped content.
- **Suggested Commit Message**: `feat(native): add collapsible topic-group sections to scholar detail screen`

# Final Verification

After all stages are complete:

1. `bun run --filter @sd/core-contracts build` succeeds
2. `bun run --filter api test` passes with no regressions
3. `bun run --filter api typecheck` passes
4. `bun run --filter @sd/domain-content typecheck` passes
5. `bun run --filter native test` passes with no regressions (33+ suites)
6. `bun run --filter native typecheck` passes
7. `bun run typecheck` (root) passes for all affected packages

# Plan Completion

The plan is complete when:

- All 4 stages are committed with passing tests/typecheck.
- No breaking changes to existing scholar detail screens (web still works with same hooks).
- The native scholar detail screen displays topic-grouped content with collapsible sections.
- The plan file is moved to `.agents/plans/completed/`.
