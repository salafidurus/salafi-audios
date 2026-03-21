"use client";

import { Suspense } from "react";
import type { TopicDetailDto } from "@sd/core-contracts";
import { SearchFilterDesktopWeb } from "../SearchFilter/SearchFilter.desktop.web";
import { SearchInputDesktopWeb } from "../SearchInput/SearchInput.desktop.web";
import { SearchResultsListDesktopWeb } from "../SearchResultsList/SearchResultsList.desktop.web";
import type { SearchResultRow } from "../../utils/build-search-result-items";

type SearchFilterValue = string[];

type Props = {
  inputRef: React.RefObject<HTMLInputElement | null>;
  query: string;
  onQueryChange: (value: string) => void;
  filters: SearchFilterValue;
  onFiltersChange: (value: SearchFilterValue) => void;
  topics: TopicDetailDto[];
  results: SearchResultRow[];
  isFetching: boolean;
  shouldSearch: boolean;
  error: unknown;
};

export function SearchProcessingDesktopWebView({
  inputRef,
  query,
  onQueryChange,
  filters,
  onFiltersChange,
  topics,
  results,
  isFetching,
  shouldSearch,
  error,
}: Props) {
  return (
    <main className="flex flex-1 flex-col">
      <div className="sticky top-0 z-10 bg-[var(--surface-canvas)] px-[var(--space-layout-page-x)] pt-[var(--space-layout-page-y)] pb-[var(--space-component-gap-md)]">
        <div className="mx-auto flex w-full max-w-[52rem] flex-col gap-[var(--space-component-gap-md)]">
          <SearchInputDesktopWeb
            ref={inputRef}
            placeholder="Search"
            value={query}
            onChange={onQueryChange}
            autoFocus
          />
          <SearchFilterDesktopWeb
            topics={topics}
            active={filters}
            onToggle={(slug) =>
              onFiltersChange(
                filters.includes(slug)
                  ? filters.filter((item: string) => item !== slug)
                  : [...filters, slug],
              )
            }
            onClearAll={() => onFiltersChange([])}
          />
        </div>
      </div>
      <section className="mx-auto w-full max-w-[70rem] px-[var(--space-layout-page-x)] pb-[var(--space-layout-page-y)]">
        <Suspense fallback={<p className="text-[var(--content-muted)]">Loading results…</p>}>
          <SearchResultsListDesktopWeb
            results={results}
            isFetching={isFetching}
            shouldSearch={shouldSearch}
            error={error}
          />
        </Suspense>
      </section>
    </main>
  );
}
