"use client";

import { XIcon } from "lucide-react";

import { Search } from "@/shared/components/Search";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { FieldGroup } from "@/shared/components/ui/field";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { useIsDesktop } from "@/shared/hooks/use-responsive";

import type { FilterOption } from "../filter-select/filter-select";

import { isExploreSort, type ExploreFilters } from "../../utils/explore-filters";
import { ExploreFilterField } from "../explore-filter-field/explore-filter-field";
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
  filtersLabel: string;
  filterSearchPlaceholder: string;
  noOptionsLabel: string;
  removeFilterLabel: string;
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
  filtersLabel,
  filterSearchPlaceholder,
  noOptionsLabel,
  removeFilterLabel,
  labels,
  onFilterChange,
  onClearFilter,
  onClearAll,
}: ExploreFilterToolbarProps) {
  const isDesktop = useIsDesktop();

  const filterFields = (
    <>
      {scholarOptions.length > 0 && (
        <ExploreFilterField
          id="explore-scholar"
          label={labels.scholar}
          options={scholarOptions}
          value={filters.scholar}
          mode="combobox"
          allLabel={allLabel}
          searchPlaceholder={filterSearchPlaceholder}
          emptyLabel={noOptionsLabel}
          onChange={(value) => onFilterChange("scholar", value)}
        />
      )}
      {topicOptions.length > 0 && (
        <ExploreFilterField
          id="explore-topic"
          label={labels.topic}
          options={topicOptions}
          value={filters.topic}
          mode="combobox"
          allLabel={allLabel}
          searchPlaceholder={filterSearchPlaceholder}
          emptyLabel={noOptionsLabel}
          onChange={(value) => onFilterChange("topic", value)}
        />
      )}
      <ExploreFilterField
        id="explore-content-type"
        label={labels.contentType}
        options={formatOptions}
        value={filters.format}
        allLabel={allLabel}
        onChange={(value) => onFilterChange("format", value)}
      />
      <ExploreFilterField
        id="explore-language"
        label={labels.language}
        options={languageOptions}
        value={filters.language}
        allLabel={allLabel}
        onChange={(value) => onFilterChange("language", value)}
      />
      <ExploreFilterField
        id="explore-sort"
        label={labels.sort}
        options={sortOptions}
        value={filters.sort}
        allLabel={allLabel}
        onChange={(value) => onFilterChange("sort", isExploreSort(value) ? value : "recent")}
      />
    </>
  );

  return (
    <search className={styles.toolbar} aria-label={activeFiltersLabel}>
      <Search.Bar placeholder={searchPlaceholder} value={query} onChange={onQueryChange} />
      {isDesktop ? (
        <FieldGroup className={styles.filters}>{filterFields}</FieldGroup>
      ) : (
        <Sheet>
          <SheetTrigger asChild>
            <Button type="button" variant="outline" className={styles.filterTrigger}>
              {filtersLabel}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className={styles.mobileFilters}>
            <SheetHeader>
              <SheetTitle>{filtersLabel}</SheetTitle>
            </SheetHeader>
            <FieldGroup className={styles.mobileFilterFields}>{filterFields}</FieldGroup>
          </SheetContent>
        </Sheet>
      )}
      <div className={styles.summary} aria-live="polite">
        <span className={styles.summaryLabel}>{activeFiltersLabel}</span>
        {summaries.length === 0 ? (
          <span className={styles.noFilters}>{allLabel}</span>
        ) : (
          summaries.map((summary) => (
            <Badge key={summary.key} variant="outline" className={styles.filterChip}>
              {summary.label}
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className={styles.removeFilter}
                aria-label={`${removeFilterLabel}: ${summary.label}`}
                onClick={() => onClearFilter(summary.key)}
              >
                <XIcon aria-hidden="true" data-icon="inline-start" />
              </Button>
            </Badge>
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
