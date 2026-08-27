"use client";

import { getLocalizedName } from "@sd/core-i18n";
import { useInfiniteSearch, useTopicsList } from "@sd/domain-search";
import { useState, useMemo } from "react";

import { useTranslation } from "@/core/i18n/use-translation";
import { LectureRow } from "@/features/home/components/lecture-row/lecture-row";
import { useShowOriginalContent } from "@/features/settings/content-preference";
import { InfiniteScrollList } from "@/shared/components/InfiniteScrollList";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { ScrollToTopButton } from "@/shared/components/ScrollToTopButton";
import { Search } from "@/shared/components/Search";
import { StickyHeaderLayout } from "@/shared/components/StickyHeaderLayout";
import { useDebouncedSearch } from "@/shared/hooks";
import { useListingNavigation } from "@/shared/hooks/use-listing-navigation";
import { formatDuration } from "@/shared/utils/format";

import styles from "./search-processing.screen.module.css";

export type SearchProcessingScreenProps = {
  searchKey?: string;
  topicSlug?: string;
};

export function SearchProcessingScreen({ searchKey, topicSlug }: SearchProcessingScreenProps) {
  const showOriginal = useShowOriginalContent();
  const { i18n, t } = useTranslation();
  const { navigateToListing } = useListingNavigation();
  const { query, setQuery, debouncedQuery } = useDebouncedSearch({ initialValue: searchKey });
  const { data: topics = [] } = useTopicsList();
  const [filter, setFilter] = useState<string[]>(topicSlug ? [topicSlug] : []);

  const filterChips = useMemo(() => {
    return topics
      .toSorted((a, b) =>
        getLocalizedName(a.name, i18n.language).localeCompare(
          getLocalizedName(b.name, i18n.language),
        ),
      )
      .map((topic) => ({
        id: topic.slug,
        label: getLocalizedName(topic.name, i18n.language),
      }));
  }, [topics, i18n.language]);

  const popularSearches = useMemo(() => {
    return [
      t("search.popularTafsir", "Tafsir"),
      t("search.popularFiqh", "Fiqh of Worship"),
      t("search.popularAqeedah", "Nullifiers of Islam"),
      t("search.popularNahw", "Nahw"),
    ];
  }, [t]);

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteSearch({
    query: debouncedQuery,
    showOriginal,
    topicSlugs: filter.length ? filter : undefined,
  });

  const allItems = data?.pages.flatMap((page) => page.items) ?? [];

  const handleItemPress = (slug: string) => {
    navigateToListing(slug);
  };

  const renderItem = (item: (typeof allItems)[number]) => (
    <LectureRow
      title={item.title}
      category={item.format}
      scholarName={item.scholarName}
      duration={formatDuration(item.durationSeconds) || ""}
      totalLessons={item.lectureCount}
      onClick={() => handleItemPress(item.slug)}
    />
  );

  return (
    <ScreenView contentStyle={{ flex: 1 }}>
      <StickyHeaderLayout>
        <StickyHeaderLayout.Header>
          <h1 className={styles.searchTitle}>{t("search.title", "Search")}</h1>
          <Search.Bar
            placeholder={t("search.placeholder", "Search lectures, scholars, or topics")}
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
        </StickyHeaderLayout.Header>

        <StickyHeaderLayout.Content>
          {!debouncedQuery.trim() ? (
            <div className={styles.popularSearches}>
              <p className={styles.popularLabel}>
                {t("search.popularSearches", "POPULAR SEARCHES")}
              </p>
              <div className={styles.popularChips}>
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    type="button"
                    className={styles.popularChip}
                    onClick={() => setQuery(term)}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <InfiniteScrollList
              data={allItems}
              isLoading={isLoading}
              hasMore={hasNextPage ?? false}
              onLoadMore={() => fetchNextPage()}
              isFetchingNextPage={isFetchingNextPage}
              renderItem={renderItem}
              emptyMessage={
                debouncedQuery.trim()
                  ? t("search.noResults", "No results found for your search")
                  : t("search.enterQuery", "Enter a search query to begin")
              }
            />
          )}
        </StickyHeaderLayout.Content>
      </StickyHeaderLayout>
      <ScrollToTopButton />
    </ScreenView>
  );
}
