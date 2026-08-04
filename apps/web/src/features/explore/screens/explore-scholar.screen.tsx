"use client";

import { routes } from "@sd/core-contracts";
import { useInfiniteScholarsList } from "@sd/domain-content";
import { useRouter } from "next/navigation";

import { useTranslation } from "@/core/i18n/use-translation";
import { ScholarGridCard } from "@/features/explore/components/scholar-grid-card/scholar-grid-card";
import { ScholarGridSkeleton } from "@/features/explore/components/scholar-grid-skeleton/scholar-grid-skeleton";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { ScrollToTopButton } from "@/shared/components/ScrollToTopButton";
import { Search } from "@/shared/components/Search";
import { useDebouncedSearch } from "@/shared/hooks";

import styles from "./explore-scholar.screen.module.css";

export type ExploreScholarScreenProps = {
  onNavigateToScholar?: (slug: string) => void;
};

export function ExploreScholarScreen({ onNavigateToScholar }: ExploreScholarScreenProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const handleNavigateToScholar =
    onNavigateToScholar ?? ((slug) => router.push(routes.scholars.detail(slug)));

  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    debouncedQuery: debouncedSearch,
  } = useDebouncedSearch();

  const { data, isFetching, isLoading, hasNextPage, fetchNextPage } = useInfiniteScholarsList();

  const allScholars = data?.pages.flatMap((p) => p.items) ?? [];

  const filteredScholars = debouncedSearch.trim()
    ? allScholars.filter(
        (scholar) =>
          scholar.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          scholar.slug.toLowerCase().includes(debouncedSearch.toLowerCase()),
      )
    : allScholars;

  const title = t("explore.scholarsTitle", "Scholars");

  return (
    <ScreenView contentStyle={{ flex: 1 }}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{title}</h1>
        <div className={styles.searchWrapper}>
          <Search.Bar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t("scholarContent.searchScholars", "Search scholars...")}
          />
        </div>
      </div>

      {filteredScholars.length > 0 ? (
        <div className={styles.grid}>
          {filteredScholars.map((scholar) => (
            <ScholarGridCard key={scholar.id} scholar={scholar} onPress={handleNavigateToScholar} />
          ))}
        </div>
      ) : isLoading || isFetching ? (
        <div className={styles.grid}>
          <ScholarGridSkeleton count={8} />
        </div>
      ) : (
        <div className={styles.empty}>
          {debouncedSearch
            ? t("scholarContent.searchNoMatch", "No scholars match your search.")
            : t("explore.noScholars", "No scholars available.")}
        </div>
      )}

      {hasNextPage && (
        <div className={styles.loadMoreWrapper}>
          <button
            type="button"
            className={styles.loadMoreButton}
            onClick={() => fetchNextPage()}
            disabled={isFetching}
          >
            {isFetching ? t("common.loading", "Loading...") : t("common.loadMore", "Load more")}
          </button>
        </div>
      )}

      <ScrollToTopButton />
    </ScreenView>
  );
}
