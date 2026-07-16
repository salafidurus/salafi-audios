"use client";

import { useMemo } from "react";
import { Search } from "@/shared/components/Search";
import { SearchResultItem } from "@/features/search/components/SearchResultItem/SearchResultItem";
import { SearchResultEmpty } from "@/features/search/components/SearchResultEmpty/SearchResultEmpty";
import { List } from "@/shared/components/List";
import { type SearchResultRow, useSearchProcessing } from "@sd/domain-search";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { useShowOriginalContent } from "@/features/settings/content-preference";
import { useTranslation } from "@/core/i18n/use-translation";
import { useRouter } from "next/navigation";
import { routes } from "@sd/core-contracts";
import styles from "./search-processing.screen.module.css";

export type SearchProcessingScreenProps = {
  searchKey?: string;
};

export function SearchProcessingScreen({ searchKey }: SearchProcessingScreenProps) {
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
  } = useSearchProcessing({ prefill: searchKey, showOriginal });
  const { push } = useRouter();

  // Transform topics into chips format for Search.Filter
  const filterChips = useMemo(() => {
    return topics
      .toSorted((a, b) => a.name.en.localeCompare(b.name.en))
      .map((topic) => ({
        id: topic.slug,
        label: topic.name.en,
      }));
  }, [topics]);

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

  const shouldShowEmpty = items.length === 0 || Boolean(errorMessage);

  return (
    <ScreenView contentStyle={{ flex: 1 }}>
      {/* Unified sticky header */}
      <div className={styles.stickyHeader}>
        {/* Search bar */}
        <Search.Bar
          placeholder={t("search.placeholder", "Search")}
          value={query}
          onChange={setQuery}
          autoFocus
        />

        {/* Filter: Always visible and horizontally scrollable */}
        <Search.Filter
          chips={filterChips}
          selected={filter}
          onChipChange={(chipId: string) => {
            setFilter(filter.includes(chipId) ? [] : [chipId]);
          }}
        />
      </div>

      {/* Results list */}
      <section className={styles.results}>
        {shouldShowEmpty ? (
          <List>
            <SearchResultEmpty
              shouldSearch={shouldSearch}
              isFetching={isFetching}
              errorMessage={errorMessage}
            />
          </List>
        ) : (
          <List>
            {items.map((item) => (
              <SearchResultItem key={item.id} item={item} onPress={() => handleItemPress(item)} />
            ))}
          </List>
        )}
      </section>
    </ScreenView>
  );
}
