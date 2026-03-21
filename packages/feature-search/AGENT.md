# AGENT.md - `@sd/feature-search`

## Purpose

`@sd/feature-search` owns search screens, search-specific components, and search data hooks.

## Structure

- `src/screens/search-home/`
- `src/screens/search-processing/`
- `src/components/` for grouped search components.
- `src/api/` for search-specific data hooks.
- `src/utils/` for view-model shaping helpers.

## Rules

- Do not keep duplicate flat component files and grouped component folders in parallel.
- Screen files should stay assembly-oriented; move heavy layout or shaping logic into components or utils.
- Shared hooks like `useSearchCatalog` and `useTopicsList` should be exported explicitly from both `index.web.ts` and `index.native.ts`.
- Web-only helpers like `next/*` consumers or `clsx`-based components must be exported through `index.web.ts`.
- No intermediate barrels.
