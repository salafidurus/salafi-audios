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

function PopularSearches({
  searches,
  onSelect,
  t,
}: {
  searches: string[];
  onSelect: (search: string) => void;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  return (
    <div className={styles.popularSearches}>
      <p className={styles.popularLabel}>{t("search.popularSearches", "POPULAR SEARCHES")}</p>
      <div className={styles.popularChips}>
        {searches.map((term) => (
          <button
            key={term}
            type="button"
            className={styles.popularChip}
            onClick={() => onSelect(term)}
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  );
}

function SearchResults({
  items,
  isLoading,
  hasMore,
  fetchNextPage,
  isFetchingNextPage,
  renderItem,
  emptyMessage,
}: {
  items: ReturnType<typeof useInfiniteSearch>["data"] extends infer Data
    ? Data extends { pages: Array<{ items: infer Items }> }
      ? Items extends Array<infer Item>
        ? Item[]
        : never
      : never
    : never;
  isLoading: boolean;
  hasMore: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  renderItem: (item: (typeof items)[number]) => React.ReactNode;
  emptyMessage: string;
}) {
  return (
    <InfiniteScrollList
      data={items}
      isLoading={isLoading}
      hasMore={hasMore}
      onLoadMore={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
      renderItem={renderItem}
      emptyMessage={emptyMessage}
    />
  );
}

function toggleSingleFilter(selected: string[], chipId: string) {
  return selected.includes(chipId) ? [] : [chipId];
}

function getTopicSlugs(filter: string[]) {
  return filter.length ? filter : undefined;
}

function getSearchItems(data: ReturnType<typeof useInfiniteSearch>["data"]) {
  return data?.pages.flatMap((page) => page.items) ?? [];
}

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
    topicSlugs: getTopicSlugs(filter),
  });

  const allItems = getSearchItems(data);

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
              setFilter(toggleSingleFilter(filter, chipId));
            }}
          />
        </StickyHeaderLayout.Header>

        <StickyHeaderLayout.Content>
          {!debouncedQuery.trim() ? (
            <PopularSearches searches={popularSearches} onSelect={setQuery} t={t} />
          ) : (
            <SearchResults
              items={allItems}
              isLoading={isLoading}
              hasMore={hasNextPage ?? false}
              fetchNextPage={() => {
                void fetchNextPage();
              }}
              isFetchingNextPage={isFetchingNextPage}
              renderItem={renderItem}
              emptyMessage={t("search.noResults", "No results found for your search")}
            />
          )}
        </StickyHeaderLayout.Content>
      </StickyHeaderLayout>
      <ScrollToTopButton />
    </ScreenView>
  );
}
