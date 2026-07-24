"use client";

import { useRef, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@sd/core-contracts";
import { useInfiniteScholarsList } from "@sd/domain-content";
import { useTranslation } from "@/core/i18n/use-translation";
import { useIsDesktop } from "@/shared/hooks/use-responsive";
import { useDebouncedSearch } from "@/shared/hooks";
import { Search } from "@/shared/components/Search";
import { PageHeader } from "@/shared/components/PageHeader";
import { ScrollToTopButton } from "@/shared/components/ScrollToTopButton";
import { StickyHeaderLayout } from "@/shared/components/StickyHeaderLayout";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { InfiniteScrollList } from "@/shared/components/InfiniteScrollList";
import { ScholarListRow } from "@/features/listing/components/scholar/scholar-list-row/scholar-list-row";
import styles from "./explore-scholar.screen.module.css";

export type ExploreScholarScreenProps = {
  onNavigateToScholar?: (slug: string) => void;
};

export function ExploreScholarScreen({ onNavigateToScholar }: ExploreScholarScreenProps) {
  const isDesktop = useIsDesktop();
  const { t } = useTranslation();
  const router = useRouter();
  const handleNavigateToScholar =
    onNavigateToScholar ?? ((slug) => router.push(routes.scholars.detail(slug)));

  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    debouncedQuery: debouncedSearch,
  } = useDebouncedSearch();

  const { data, isFetching, isError, hasNextPage, fetchNextPage, refetch } =
    useInfiniteScholarsList();

  const allScholars = data?.pages.flatMap((p) => p.items) ?? [];

  const filteredScholars = debouncedSearch.trim()
    ? allScholars.filter(
        (scholar) =>
          scholar.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          scholar.slug.toLowerCase().includes(debouncedSearch.toLowerCase()),
      )
    : allScholars;

  const title = t("explore.scholarsTitle", "Scholars");

  if (isDesktop) {
    return (
      <ScreenView contentStyle={{ flex: 1 }}>
        <StickyHeaderLayout>
          <StickyHeaderLayout.Header>
            <div className={styles.header}>
              <PageHeader title={title} />
              <Search.Bar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder={t("scholarContent.searchScholars", "Search scholars...")}
              />
            </div>
          </StickyHeaderLayout.Header>
          <StickyHeaderLayout.Content>
            <InfiniteScrollList
              data={filteredScholars}
              isLoading={isFetching && allScholars.length === 0}
              hasMore={hasNextPage ?? false}
              onLoadMore={() => fetchNextPage()}
              isFetchingNextPage={isFetching && allScholars.length > 0}
              renderItem={(scholar) => (
                <ScholarListRow scholar={scholar} onPress={handleNavigateToScholar} />
              )}
              emptyMessage={
                debouncedSearch
                  ? t("scholarContent.searchNoMatch", "No scholars match your search.")
                  : t("explore.noScholars", "No scholars available.")
              }
            />
          </StickyHeaderLayout.Content>
        </StickyHeaderLayout>
        <ScrollToTopButton />
      </ScreenView>
    );
  }

  return (
    <ScreenView contentStyle={{ flex: 1 }}>
      <StickyHeaderLayout>
        <StickyHeaderLayout.Header>
          <div className={styles.header}>
            <PageHeader title={title} />
            <Search.Bar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t("scholarContent.searchScholars", "Search scholars...")}
            />
          </div>
        </StickyHeaderLayout.Header>
        <StickyHeaderLayout.Content>
          <InfiniteScrollList
            data={filteredScholars}
            isLoading={isFetching && allScholars.length === 0}
            hasMore={hasNextPage ?? false}
            onLoadMore={() => fetchNextPage()}
            isFetchingNextPage={isFetching && allScholars.length > 0}
            renderItem={(scholar) => (
              <ScholarListRow scholar={scholar} onPress={handleNavigateToScholar} />
            )}
            emptyMessage={
              debouncedSearch
                ? t("scholarContent.searchNoMatch", "No scholars match your search.")
                : t("explore.noScholars", "No scholars available.")
            }
          />
        </StickyHeaderLayout.Content>
      </StickyHeaderLayout>
      <ScrollToTopButton />
    </ScreenView>
  );
}
