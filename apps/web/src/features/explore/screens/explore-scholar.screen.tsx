/** Documents this module's responsibility and public boundary. */
"use client";

import { routes, type ScholarListItemDto } from "@sd/core-contracts";
import { useScholarPageFeeds } from "@sd/domain-content";
import { useRouter } from "next/navigation";

import { useTranslation } from "@/core/i18n/use-translation";
import { ContentRow } from "@/features/details/components/scholar/scholar-content-list/scholar-content-list";
import { ScholarGridCard } from "@/features/explore/components/scholar-grid-card/scholar-grid-card";
import { ScholarGridSkeleton } from "@/features/explore/components/scholar-grid-skeleton/scholar-grid-skeleton";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { ScrollToTopButton } from "@/shared/components/ScrollToTopButton";

import styles from "./explore-scholar.screen.module.css";

/** Describes navigation state for the recommendation-composed Explore scholar directory. */
export type ExploreScholarScreenProps = {
  onNavigateToScholar?: (slug: string) => void;
};

type ScholarResultsProps = {
  scholars: ScholarListItemDto[];
  /** Indicates that the initial page-feed request failed and can be retried. */
  isError: boolean;
  isLoading: boolean;
  isFetching: boolean;
  onRetry: () => void;
  onNavigateToScholar: (slug: string) => void;
};

function ScholarResults({
  scholars,
  isError,
  isLoading,
  isFetching,
  onRetry,
  onNavigateToScholar,
}: ScholarResultsProps) {
  const { t } = useTranslation();
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

  if (scholars.length > 0) {
    return (
      <div className={styles.grid}>
        {scholars.map((scholar) => (
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

  return <div className={styles.empty}>{t("explore.noScholars", "No scholars available.")}</div>;
}

/** Renders recommendation-composed scholars with ordered batches and resilient UI states. */
export function ExploreScholarScreen({ onNavigateToScholar }: ExploreScholarScreenProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const handleNavigateToScholar =
    onNavigateToScholar ?? ((slug) => router.push(routes.scholars.detail(slug)));

  const { data, isFetching, isLoading, isError, refetch } = useScholarPageFeeds();
  const scholarBatches = data?.batches.filter((batch) => batch.form === "scholars") ?? [];
  const listingBatches = data?.batches.filter((batch) => batch.form === "scholar_listings") ?? [];
  const allScholars = scholarBatches.flatMap((batch) => batch.items);

  const title = t("explore.scholarsTitle", "Scholars");

  return (
    <ScreenView contentStyle={{ flex: 1 }}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{title}</h1>
      </div>

      <ScholarResults
        scholars={allScholars}
        isError={isError}
        isLoading={isLoading}
        isFetching={isFetching}
        onRetry={refetch}
        onNavigateToScholar={handleNavigateToScholar}
      />

      {listingBatches.map((batch) => (
        <section key={batch.id} aria-labelledby={`${batch.id}-title`}>
          <h2 id={`${batch.id}-title`}>{batch.title.label}</h2>
          <ScholarGridCard scholar={batch.scholar} onPress={handleNavigateToScholar} />
          <div>
            {batch.items.map((item) => (
              <ContentRow key={item.id} item={item} scholarImageUrl={batch.scholar.imageUrl} />
            ))}
          </div>
        </section>
      ))}

      <ScrollToTopButton />
    </ScreenView>
  );
}
