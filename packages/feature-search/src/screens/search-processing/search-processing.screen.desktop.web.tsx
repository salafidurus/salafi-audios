"use client";

import { Suspense } from "react";
import { useEffect, useRef } from "react";
import { SearchFilterDesktopWeb } from "../../components/SearchFilter/SearchFilter.desktop.web";
import { SearchInputDesktopWeb } from "../../components/SearchInput/SearchInput.desktop.web";
import { SearchResultItemDesktopWeb } from "../../components/SearchResultItem/SearchResultItem.desktop.web";
import { SearchResultsListDesktopWeb } from "../../components/SearchResultsList/SearchResultsList.desktop.web";
import { useSearchProcessing } from "@sd/domain-search";

export function SearchProcessingDesktopWebScreen() {
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    query,
    setQuery,
    filter,
    setFilter,
    topics,
    items,
    isFetching,
    shouldSearch,
    errorMessage,
  } = useSearchProcessing();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <main className="flex flex-1 flex-col">
      <div className="sticky top-0 z-10 border-b border-[var(--chrome-border)] bg-[var(--chrome-surface)] px-[var(--space-layout-page-x)] pt-[var(--space-layout-page-y)] pb-[var(--space-component-gap-md)] backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-[52rem] flex-col gap-[var(--space-component-gap-md)]">
          <SearchInputDesktopWeb
            ref={inputRef}
            placeholder="Search"
            value={query}
            onChange={setQuery}
            autoFocus
          />
          <SearchFilterDesktopWeb value={filter} onChange={setFilter} topics={topics} />
        </div>
      </div>
      <section className="mx-auto w-full max-w-[70rem] px-[var(--space-layout-page-x)] pb-[var(--space-layout-page-y)]">
        <Suspense fallback={<p className="text-[var(--content-muted)]">Loading results…</p>}>
          <SearchResultsListDesktopWeb
            items={items}
            isFetching={isFetching}
            shouldSearch={shouldSearch}
            errorMessage={errorMessage}
            renderItem={(item) => <SearchResultItemDesktopWeb {...item} />}
          />
        </Suspense>
      </section>
    </main>
  );
}
