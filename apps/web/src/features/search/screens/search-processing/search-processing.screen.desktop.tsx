"use client";

import { Suspense } from "react";
import { useEffect, useRef } from "react";
import { SearchFilterDesktop } from "@/features/search/components/SearchFilter/SearchFilter.desktop";
import { SearchInputDesktop } from "@/features/search/components/SearchInput/SearchInput.desktop";
import { SearchResultItemDesktop } from "@/features/search/components/SearchResultItem/SearchResultItem.desktop";
import { SearchResultsListDesktop } from "@/features/search/components/SearchResultsList/SearchResultsList.desktop";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { useSearchProcessing, type SearchResultRow } from "@sd/domain-search";
import { useShowOriginalContent } from "@/features/settings/content-preference";
import { useTranslation } from "@/core/i18n/use-translation";
import { useRouter } from "next/navigation";
import { routes } from "@sd/core-contracts";

export function SearchProcessingDesktopScreen() {
  const inputRef = useRef<HTMLInputElement>(null);
  const showOriginal = useShowOriginalContent();
  const { t } = useTranslation();
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
  } = useSearchProcessing({ showOriginal });
  const { push } = useRouter();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleItemClick = (item: SearchResultRow) => {
    const [kind, id] = item.id.split(":");
    if (!id) return;
    if (kind === "collection") {
      push(routes.collections.detail(id));
    } else if (kind === "series") {
      push(routes.series.detail(id));
    } else if (kind === "single") {
      push(routes.lectures.detail(id));
    }
  };

  return (
    <ScreenView>
      <div
        className="sticky top-0 z-10 -mx-[var(--space-layout-page-x)] border-b border-[var(--chrome-border)] px-[var(--space-layout-page-x)] pt-[var(--space-layout-page-y)] pb-[var(--space-component-gap-md)]"
        style={{
          background: "color-mix(in srgb, var(--surface-canvas) 80%, transparent)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      >
        <div className="flex flex-col gap-[var(--space-component-gap-md)]">
          <SearchInputDesktop
            ref={inputRef}
            placeholder={t("search.placeholder", "Search")}
            value={query}
            onChange={setQuery}
            autoFocus
          />
          <SearchFilterDesktop value={filter} onChange={setFilter} topics={topics} />
        </div>
      </div>
      <section className="pb-[var(--space-layout-page-y)]">
        <Suspense fallback={<p className="text-[var(--content-muted)]">Loading results…</p>}>
          <SearchResultsListDesktop
            items={items}
            isFetching={isFetching}
            shouldSearch={shouldSearch}
            errorMessage={errorMessage}
            renderItem={(item) => (
              <SearchResultItemDesktop {...item} onClick={() => handleItemClick(item)} />
            )}
          />
        </Suspense>
      </section>
    </ScreenView>
  );
}
