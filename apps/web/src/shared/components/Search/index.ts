/**
 * Search — Compound component system for standardized search and filtering.
 *
 * Architecture:
 * - Search.Bar: Input container with search icon and clear button
 * - Search.Filter: Filter chip group with toggle selection
 *
 * Usage:
 * ```tsx
 * import { Search } from '@/shared/components/Search';
 *
 * export function SearchScreen() {
 *   const [searchValue, setSearchValue] = useState('');
 *   const [filters, setFilters] = useState<string[]>([]);
 *
 *   return (
 *     <div>
 *       <Search.Bar
 *         value={searchValue}
 *         onChange={setSearchValue}
 *         placeholder="Search scholars..."
 *       />
 *       <Search.Filter
 *         chips={[
 *           { id: 'lecture', label: 'Lectures' },
 *           { id: 'article', label: 'Articles' },
 *         ]}
 *         selected={filters}
 *         onChipChange={(id) => {
 *           setFilters(prev =>
 *             prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
 *           );
 *         }}
 *       />
 *     </div>
 *   );
 * }
 * ```
 *
 * Styling:
 * - All spacing via design tokens: --space-component-gap-*, --space-scale-*
 * - Responsive layout via CSS media queries (max-width: 640px)
 * - Colors and surfaces via --surface-*, --content-*, --border-* tokens
 */

import { SearchBar } from "./Search.Bar";
import type { SearchBarProps } from "./Search.Bar";

import { SearchFilter } from "./Search.Filter";
import type { SearchFilterProps, FilterChip } from "./Search.Filter";

export const Search = Object.assign({
  Bar: SearchBar,
  Filter: SearchFilter,
});

// Re-export types
export type { SearchBarProps, SearchFilterProps, FilterChip };
