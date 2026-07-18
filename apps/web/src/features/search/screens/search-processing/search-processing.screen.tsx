"use client";

import { useState, useMemo } from "react";
import { useInfiniteSearch } from "@sd/domain-search";
import { useShowOriginalContent } from "@/features/settings/content-preference";
import { useTranslation } from "@/core/i18n/use-translation";
import { useRouter } from "next/navigation";
import { useDebouncedSearch } from "@/shared/hooks";
import { routes } from "@sd/core-contracts";
import { Search } from "@/shared/components/Search";
import { SearchResultItem } from "@/features/search/components/SearchResultItem/SearchResultItem";
import { InfiniteScrollList } from "@/shared/components/InfiniteScrollList";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import type { SearchResultRow } from "@sd/domain-search";
import styles from "./search-processing.screen.module.css";

export type SearchProcessingScreenProps = {
  searchKey?: string;
};

export function SearchProcessingScreen({ searchKey }: SearchProcessingScreenProps) {
  const showOriginal = useShowOriginalContent();
  const { t } = useTranslation();
  const { push } = useRouter();
  const { query, setQuery, debouncedQuery } = useDebouncedSearch({ initialValue: searchKey });
  const [topics] = useState<any[]>([]);
  const [filter, setFilter] = useState<string[]>([]);

  const filterChips = useMemo(() => {
    return topics
      .toSorted((a, b) => a.name.en.localeCompare(b.name.en))
      .map((topic) => ({
        id: topic.slug,
        label: topic.name.en,
      }));
  }, [topics]);

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteSearch({
    query: debouncedQuery,
    showOriginal,
  });

  const allItems = data?.pages.flatMap((page) => page.items) ?? [];

  const handleItemPress = (item: SearchResultRow) => {
    const [kind, id] = item.id.split(":");
    if (!id) {
      return;
    }
    if (kind === "collection") {
      push(routes.collections.detail(id));
    } else if (kind === "series") {
      push(routes.series.detail(id));
    } else if (kind === "single") {
      push(routes.lectures.detail(id));
    }
  };

  return (
    <ScreenView contentStyle={{ flex: 1 }}>
      <div className={styles.stickyHeader}>
        <Search.Bar
          placeholder={t("search.placeholder", "Search")}
          value={query}
          onChange={setQuery}
          autoFocus
        />

        <Search.Filter
          chips={filterChips}
          selected={filter}
          onChipChange={(chipId: string) => {
            setFilter(filter.includes(chipId) ? [] : [chipId]);
          }}
        />
      </div>

      <section className={styles.results}>
        <InfiniteScrollList
          data={allItems}
          isLoading={isLoading}
          hasMore={hasNextPage ?? false}
          onLoadMore={() => fetchNextPage()}
          isFetchingNextPage={isFetchingNextPage}
          renderItem={(item) => (
            <SearchResultItem item={item} onPress={() => handleItemPress(item)} />
          )}
          emptyMessage={
            debouncedQuery.trim()
              ? t("search.noResults", "No results found for your search")
              : t("search.enterQuery", "Enter a search query to begin")
          }
        />
      </section>
    </ScreenView>
  );
}
