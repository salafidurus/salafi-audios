# Admin Interface Refactoring Progress

**Plan Date**: 2026-07-09
**Status**: Implementation Starting - Stage 1 (Fix Rerender Anti-Pattern)

## Objective

Consolidate admin screens, create shared components, redesign dashboard with responsive card-based layouts. Replace functional duplication with shared components (SearchBar, AdminCard, AdminStatsCard).

## Consolidation Map

- admin-permissions → merge into admin-users (inline permissions editing)
- admin-topics + admin-lectures → merge into admin-contents (route-based tabs: /admin/contents/topics, /admin/contents/lectures)

## Stages (11 total)

| #   | Stage                                  | Status  | Files Modified | Files Deleted                        |
| --- | -------------------------------------- | ------- | -------------- | ------------------------------------ |
| 1   | Fix Rerender Anti-Pattern (CRITICAL)   | Planned | 4 screens      | -                                    |
| 2   | Create SearchBar Component             | Planned | -              | -                                    |
| 3   | Create AdminCard Component             | Planned | -              | -                                    |
| 4   | Create AdminStatsCard Component        | Planned | -              | -                                    |
| 5   | Fix Navigation Routes                  | Planned | 1 sidebar      | -                                    |
| 6   | Consolidate Permissions into Users     | Planned | 2 screens      | admin-permissions folder             |
| 7   | Consolidate Contents (topics/lectures) | Planned | 4 routes       | admin-topics, admin-lectures folders |
| 8   | Update Dashboard Links                 | Planned | 1 dashboard    | -                                    |
| 9   | Redesign Dashboard                     | Planned | 1 dashboard    | -                                    |
| 10  | Update Scholars Screen                 | Planned | 1 screen       | AdminSearchBar folder                |
| 11  | Cleanup & Final Verification           | Planned | -              | user-search-bar folder               |

## Stage 1 Details (Current)

**Goal**: Replace `data?.field ?? []` with constant empty arrays to prevent array recreation on every render

**Files**:

- `apps/web/src/features/admin/screens/admin-users/admin-users.screen.tsx`
- `apps/web/src/features/admin/screens/admin-scholars/admin-scholars.screen.tsx`
- `apps/web/src/features/admin/screens/admin-lectures/admin-lectures.screen.tsx`
- `apps/web/src/features/admin/screens/admin-dashboard/admin-dashboard.screen.tsx`

**Pattern**: `const EMPTY_*_ARRAY = []; // outside component` then `data?.field ?? EMPTY_*_ARRAY`

## Key Decisions

- SearchBar uses real-time onChange (fires on every keystroke), filtering happens in useMemo with debounce
- AdminCard: horizontal layout (thumbnail, content, actions), expandable metadata
- Dashboard: stats cards link to screens, quick actions section, pending items, recent activity
- All responsive (mobile/tablet/desktop), using design tokens only

## Routes After Consolidation

- `/admin/users` - users screen (with inline permissions)
- `/admin/contents` - redirects to `/admin/contents/topics`
- `/admin/contents/topics` - topics tab (route-based)
- `/admin/contents/lectures` - lectures tab (route-based)
- `/admin/scholars` - scholars screen
- `/admin/livestreams` - livestreams screen
- ❌ Removed: `/admin/permissions`, `/admin/topics`, `/admin/lectures`

## Worktree

Using `.worktrees/f-admin-refactor` branch `f/admin-refactor` for isolated development
