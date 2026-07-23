"use client";

import { useState, useMemo } from "react";
import { useInfiniteSearch, useTopicsList } from "@sd/domain-search";
import { getLocalizedName } from "@sd/core-i18n";
import { useShowOriginalContent } from "@/features/settings/content-preference";
import { useTranslation } from "@/core/i18n/use-translation";
import { useDebouncedSearch } from "@/shared/hooks";
import { Search } from "@/shared/components/Search";
import { SearchResultItem } from "@/features/search/components/SearchResultItem/SearchResultItem";
import { InfiniteScrollList } from "@/shared/components/InfiniteScrollList";
import { ScrollToTopButton } from "@/shared/components/ScrollToTopButton";
import { StickyHeaderLayout } from "@/shared/components/StickyHeaderLayout";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { useListingNavigation } from "@/shared/hooks/use-listing-navigation";

export type SearchProcessingScreenProps = {
  searchKey?: string;
};

export function SearchProcessingScreen({ searchKey }: SearchProcessingScreenProps) {
  const showOriginal = useShowOriginalContent();
  const { i18n, t } = useTranslation();
  const { navigateToListing } = useListingNavigation();
  const { query, setQuery, debouncedQuery } = useDebouncedSearch({ initialValue: searchKey });
  const { data: topics = [] } = useTopicsList();
  const [filter, setFilter] = useState<string[]>([]);

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

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteSearch({
    query: debouncedQuery,
    showOriginal,
    topicSlugs: filter.length ? filter : undefined,
  });

  const allItems = data?.pages.flatMap((page) => page.items) ?? [];

  const handleItemPress = (slug: string) => {
    navigateToListing(slug);
  };

  return (
    <ScreenView contentStyle={{ flex: 1 }}>
      <StickyHeaderLayout>
        <StickyHeaderLayout.Header>
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
        </StickyHeaderLayout.Header>

        <StickyHeaderLayout.Content>
          <InfiniteScrollList
            data={allItems}
            isLoading={isLoading}
            hasMore={hasNextPage ?? false}
            onLoadMore={() => fetchNextPage()}
            isFetchingNextPage={isFetchingNextPage}
            renderItem={(item) => (
              <SearchResultItem item={item} onPress={() => handleItemPress(item.slug)} />
            )}
            emptyMessage={
              debouncedQuery.trim()
                ? t("search.noResults", "No results found for your search")
                : t("search.enterQuery", "Enter a search query to begin")
            }
          />
        </StickyHeaderLayout.Content>
      </StickyHeaderLayout>
      <ScrollToTopButton />
    </ScreenView>
  );
}
