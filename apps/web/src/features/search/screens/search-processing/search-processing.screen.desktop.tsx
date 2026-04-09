"use client";

import { Suspense } from "react";
import { useEffect, useRef } from "react";
import { SearchFilterDesktop } from "../../components/SearchFilter/SearchFilter.desktop";
import { SearchInputDesktop } from "../../components/SearchInput/SearchInput.desktop";
import { SearchResultItemDesktop } from "../../components/SearchResultItem/SearchResultItem.desktop";
import { SearchResultsListDesktop } from "../../components/SearchResultsList/SearchResultsList.desktop";
import { useSearchProcessing } from "@sd/domain-search";

export function SearchProcessingDesktopScreen() {
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
      <div
        className="sticky top-0 z-10 border-b border-[var(--chrome-border)] px-[var(--space-layout-page-x)] pt-[var(--space-layout-page-y)] pb-[var(--space-component-gap-md)]"
        style={{
          background: "color-mix(in srgb, var(--surface-canvas) 80%, transparent)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      >
        <div className="mx-auto flex w-full max-w-[52rem] flex-col gap-[var(--space-component-gap-md)]">
          <SearchInputDesktop
            ref={inputRef}
            placeholder="Search"
            value={query}
            onChange={setQuery}
            autoFocus
          />
          <SearchFilterDesktop value={filter} onChange={setFilter} topics={topics} />
        </div>
      </div>
      <section className="mx-auto w-full max-w-[70rem] px-[var(--space-layout-page-x)] pb-[var(--space-layout-page-y)]">
        <Suspense fallback={<p className="text-[var(--content-muted)]">Loading results…</p>}>
          <SearchResultsListDesktop
            items={items}
            isFetching={isFetching}
            shouldSearch={shouldSearch}
            errorMessage={errorMessage}
            renderItem={(item) => <SearchResultItemDesktop {...item} />}
          />
        </Suspense>
      </section>
    </main>
  );
}
