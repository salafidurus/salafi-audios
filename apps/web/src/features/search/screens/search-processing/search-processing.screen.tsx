"use client";

import { useMemo, useState, useEffect } from "react";
import { Search } from "@/shared/components/Search";
import { SearchResultItem } from "@/features/search/components/SearchResultItem/SearchResultItem";
import { InfiniteScrollList } from "@/shared/components/InfiniteScrollList";
import { queryKeys, httpClient, routes } from "@sd/core-contracts";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { useShowOriginalContent } from "@/features/settings/content-preference";
import { useTranslation } from "@/core/i18n/use-translation";
import { useRouter } from "next/navigation";
import { buildSearchResultRows, type SearchResultRow } from "@sd/domain-search";
import type { SearchCatalogResultsDto } from "@sd/core-contracts";
import styles from "./search-processing.screen.module.css";

export type SearchProcessingScreenProps = {
  searchKey?: string;
};

export function SearchProcessingScreen({ searchKey }: SearchProcessingScreenProps) {
  const showOriginal = useShowOriginalContent();
  const { t } = useTranslation();
  const { push } = useRouter();
  const [query, setQuery] = useState(searchKey ?? "");
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [topics] = useState<any[]>([]);
  const [filter, setFilter] = useState<string[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

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
        <InfiniteScrollList
          queryKey={[...queryKeys.search.infinite(debouncedQuery)]}
          queryFn={async ({ pageParam }: { pageParam?: string | undefined }) => {
            if (!debouncedQuery.trim()) {
              return { items: [], nextCursor: undefined, hasMore: false };
            }
            const params = new URLSearchParams();
            params.append("q", debouncedQuery);
            if (pageParam) params.append("cursor", pageParam);
            const url = `/api/search?${params}`;
            const response = await httpClient<SearchCatalogResultsDto>({ url, method: "GET" });
            const rows = buildSearchResultRows(response, showOriginal);
            return {
              items: rows,
              nextCursor: response.nextCursor,
              hasMore: response.hasMore ?? false,
            };
          }}
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
