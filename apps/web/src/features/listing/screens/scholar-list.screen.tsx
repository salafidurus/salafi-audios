"use client";

import { useInfiniteScholarsList } from "@sd/domain-content";
import { useDebouncedSearch } from "@/shared/hooks";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { PageHeader } from "@/shared/components/PageHeader";
import { Search } from "@/shared/components/Search";
import { InfiniteScrollList } from "@/shared/components/InfiniteScrollList";
import { ScholarListRow } from "@/features/listing/components/scholar/scholar-list-row/scholar-list-row";
import { useTranslation } from "@/core/i18n/use-translation";
import styles from "./scholar-list.screen.module.css";

export function ScholarListScreen() {
  const { t } = useTranslation();
  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    debouncedQuery: debouncedSearch,
  } = useDebouncedSearch();

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteScholarsList();

  const allItems = data?.pages.flatMap((page) => page.items) ?? [];

  const filteredItems = debouncedSearch.trim()
    ? allItems.filter(
        (scholar) =>
          scholar.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          scholar.slug.toLowerCase().includes(debouncedSearch.toLowerCase()),
      )
    : allItems;

  return (
    <ScreenView contentStyle={{ flex: 1 }}>
      <PageHeader title={t("search.scholars", "Scholars")} />

      <div className={styles.content}>
        <Search.Bar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t("scholarContent.searchScholars", "Search scholars...")}
        />

        <InfiniteScrollList
          data={filteredItems}
          isLoading={isLoading && filteredItems.length === 0}
          hasMore={hasNextPage ?? false}
          onLoadMore={() => fetchNextPage()}
          isFetchingNextPage={isFetchingNextPage}
          renderItem={(scholar) => <ScholarListRow scholar={scholar} />}
          emptyMessage={
            debouncedSearch
              ? t("scholarContent.searchNoMatch", "No scholars match your search.")
              : t("scholarContent.noScholarsFound", "No scholars found.")
          }
        />
      </div>
    </ScreenView>
  );
}
