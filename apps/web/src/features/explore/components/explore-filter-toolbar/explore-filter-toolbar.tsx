"use client";

import { Search } from "@/shared/components/Search";
import { Button } from "@/shared/components/ui/button";

import { isExploreSort, type ExploreFilters } from "../../utils/explore-filters";
import { FilterSelect, type FilterOption } from "../filter-select/filter-select";
import styles from "./explore-filter-toolbar.module.css";

export type ExploreFilterSummary = {
  key: keyof ExploreFilters;
  label: string;
};

type ExploreFilterToolbarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  filters: ExploreFilters;
  scholarOptions: FilterOption[];
  topicOptions: FilterOption[];
  formatOptions: FilterOption[];
  languageOptions: FilterOption[];
  sortOptions: FilterOption[];
  summaries: ExploreFilterSummary[];
  allLabel: string;
  searchPlaceholder: string;
  activeFiltersLabel: string;
  clearAllLabel: string;
  labels: {
    scholar: string;
    topic: string;
    contentType: string;
    language: string;
    sort: string;
  };
  onFilterChange: <K extends keyof ExploreFilters>(key: K, value: ExploreFilters[K]) => void;
  onClearFilter: (key: keyof ExploreFilters) => void;
  onClearAll: () => void;
};

export function ExploreFilterToolbar({
  query,
  onQueryChange,
  filters,
  scholarOptions,
  topicOptions,
  formatOptions,
  languageOptions,
  sortOptions,
  summaries,
  allLabel,
  searchPlaceholder,
  activeFiltersLabel,
  clearAllLabel,
  labels,
  onFilterChange,
  onClearFilter,
  onClearAll,
}: ExploreFilterToolbarProps) {
  return (
    <search className={styles.toolbar} aria-label={activeFiltersLabel}>
      <Search.Bar placeholder={searchPlaceholder} value={query} onChange={onQueryChange} />
      <div className={styles.filters}>
        {scholarOptions.length > 0 && (
          <FilterSelect
            label={labels.scholar}
            options={scholarOptions}
            value={filters.scholar}
            onChange={(value) => onFilterChange("scholar", value)}
            searchable
            allLabel={allLabel}
          />
        )}
        {topicOptions.length > 0 && (
          <FilterSelect
            label={labels.topic}
            options={topicOptions}
            value={filters.topic}
            onChange={(value) => onFilterChange("topic", value)}
            searchable
            allLabel={allLabel}
          />
        )}
        <FilterSelect
          label={labels.contentType}
          options={formatOptions}
          value={filters.format}
          onChange={(value) => onFilterChange("format", value)}
          allLabel={allLabel}
        />
        <FilterSelect
          label={labels.language}
          options={languageOptions}
          value={filters.language}
          onChange={(value) => onFilterChange("language", value)}
          allLabel={allLabel}
        />
        <FilterSelect
          label={labels.sort}
          options={sortOptions}
          value={filters.sort}
          onChange={(value) => onFilterChange("sort", isExploreSort(value) ? value : "recent")}
          allLabel={allLabel}
        />
      </div>
      <div className={styles.summary} aria-live="polite">
        <span className={styles.summaryLabel}>{activeFiltersLabel}</span>
        {summaries.length === 0 ? (
          <span className={styles.noFilters}>{allLabel}</span>
        ) : (
          summaries.map((summary) => (
            <button
              key={summary.key}
              type="button"
              className={styles.filterChip}
              aria-label={`Remove ${summary.label}`}
              onClick={() => onClearFilter(summary.key)}
            >
              {summary.label} <span aria-hidden="true">×</span>
            </button>
          ))
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={styles.clearAll}
          onClick={onClearAll}
          disabled={summaries.length === 0}
        >
          {clearAllLabel}
        </Button>
      </div>
    </search>
  );
}
