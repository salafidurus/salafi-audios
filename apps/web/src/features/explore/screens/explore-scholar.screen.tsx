/** Documents this module's responsibility and public boundary. */
"use client";

import { routes, type ScholarListItemDto } from "@sd/core-contracts";
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

type ScholarResultsProps = {
  scholars: ScholarListItemDto[];
  isError: boolean;
  isLoading: boolean;
  isFetching: boolean;
  debouncedSearch: string;
  onRetry: () => void;
  onNavigateToScholar: (slug: string) => void;
};

function ScholarResults({
  scholars,
  isError,
  isLoading,
  isFetching,
  debouncedSearch,
  onRetry,
  onNavigateToScholar,
}: ScholarResultsProps) {
  const { t } = useTranslation();
  const filteredScholars = filterScholars(scholars, debouncedSearch);

  if (isError && scholars.length === 0) {
    return (
      <div className={styles.empty} role="alert">
        <p style={{ margin: 0 }}>{t("scholars.error", "Failed to load scholars.")}</p>
        <button
          type="button"
          className={styles.loadMoreButton}
          onClick={onRetry}
          style={{ marginTop: "12px" }}
        >
          {t("common.retry", "Try again")}
        </button>
      </div>
    );
  }

  if (filteredScholars.length > 0) {
    return (
      <div className={styles.grid}>
        {filteredScholars.map((scholar) => (
          <ScholarGridCard key={scholar.id} scholar={scholar} onPress={onNavigateToScholar} />
        ))}
      </div>
    );
  }

  if (isLoading || isFetching) {
    return (
      <div className={styles.grid}>
        <ScholarGridSkeleton count={8} />
      </div>
    );
  }

  return (
    <div className={styles.empty}>
      {debouncedSearch
        ? t("scholarContent.searchNoMatch", "No scholars match your search.")
        : t("explore.noScholars", "No scholars available.")}
    </div>
  );
}

function filterScholars(scholars: ScholarListItemDto[], search: string): ScholarListItemDto[] {
  const normalizedSearch = search.trim().toLowerCase();
  if (!normalizedSearch) return scholars;
  return scholars.filter(
    (scholar) =>
      scholar.name.toLowerCase().includes(normalizedSearch) ||
      scholar.slug.toLowerCase().includes(normalizedSearch),
  );
}

function LoadMoreButton({
  isFetching,
  onLoadMore,
}: {
  isFetching: boolean;
  onLoadMore: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className={styles.loadMoreWrapper}>
      <button
        type="button"
        className={styles.loadMoreButton}
        onClick={onLoadMore}
        disabled={isFetching}
      >
        {isFetching ? t("common.loading", "Loading...") : t("common.loadMore", "Load more")}
      </button>
    </div>
  );
}

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

  const { data, isFetching, isLoading, isError, refetch, hasNextPage, fetchNextPage } =
    useInfiniteScholarsList();

  const allScholars = data?.pages.flatMap((p) => p.items) ?? [];

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

      <ScholarResults
        scholars={allScholars}
        isError={isError}
        isLoading={isLoading}
        isFetching={isFetching}
        debouncedSearch={debouncedSearch}
        onRetry={refetch}
        onNavigateToScholar={handleNavigateToScholar}
      />

      {hasNextPage && <LoadMoreButton isFetching={isFetching} onLoadMore={fetchNextPage} />}

      <ScrollToTopButton />
    </ScreenView>
  );
}
