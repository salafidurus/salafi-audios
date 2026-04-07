# @sd/feature-search

> Search screens, QuickBrowse, and search-specific UI components

## Purpose

Provides the search home screen, search processing/results screen, QuickBrowse cards, and all search-related UI components. Consumes `@sd/domain-search` for state and API logic, then renders platform-appropriate search experiences.

## Boundaries

- **Depends on:** `@sd/domain-search`, `@sd/core-contracts`, `@sd/core-api`, `@sd/core-config`, `@sd/core-styles`, `@sd/design-tokens`, `@sd/shared`, `lucide-react` / `lucide-react-native`, `react-native-reanimated`, `zustand`
- **Consumed by:** `apps/web`, `apps/mobile`

## Structure

```
src/
├── screens/
│   ├── search-home/        # Search landing with QuickBrowse
│   └── search-processing/  # Active search results
├── components/
│   ├── QuickBrowse/        # Browse-by-topic cards
│   ├── SearchInput/        # Search text input
│   ├── SearchFilter/       # Filter controls
│   ├── SearchResultsList/  # Results list container
│   ├── SearchResultItem/   # Individual result row
│   ├── BrowseCard/         # Topic browse card
│   └── ...                 # MarqueeText, TitleText, etc.
├── hooks/                  # useQuickBrowse, etc.
├── index.web.ts            # Web entrypoint
└── index.native.ts         # React Native entrypoint
```

## Key Commands

- `pnpm --filter feature-search build` — Build the package
- `pnpm --filter feature-search typecheck` — Type check

## Constraints

- Screen files should stay assembly-oriented — move heavy layout or shaping logic into `components/` or `utils/`.
- Shared hooks must be exported explicitly from both platform entrypoints.
- Web-only helpers (e.g. `next/*` consumers, `clsx`-based components) export through `index.web.ts` only.
- No intermediate barrel files.
