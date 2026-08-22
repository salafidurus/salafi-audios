"use client";

import { routes, type FeedContentItemDto } from "@sd/core-contracts";
import Link from "next/link";

import { useTranslation } from "@/core/i18n/use-translation";
import { usePlayListing } from "@/features/audio";
import { useListingNavigation } from "@/shared/hooks/use-listing-navigation";

import { FeaturedLectureCard } from "../featured-lecture-card/featured-lecture-card";
import { LectureRow } from "../lecture-row/lecture-row";
import styles from "./curated-exploration-section.module.css";

type CuratedExplorationSectionProps = {
  items: FeedContentItemDto[];
  isLoading?: boolean;
};

export function CuratedExplorationSection({
  items,
  isLoading = false,
}: CuratedExplorationSectionProps) {
  const { t } = useTranslation();
  const { navigateToListing } = useListingNavigation();
  const [featured, ...rest] = items;
  const { play } = usePlayListing(
    featured
      ? {
          id: featured.id,
          slug: featured.slug,
          title: featured.title,
          format: featured.kind,
          scholarName: featured.scholarName,
          scholarSlug: featured.scholarSlug,
          artworkUrl: featured.thumbnailUrl ?? undefined,
        }
      : null,
  );

  if (isLoading && items.length === 0) {
    return (
      <section className={styles.section} data-testid="home-curated-loading">
        <div className={styles.header}>
          <p className={styles.eyebrow}>{t("home.curated.eyebrow", "CURATED FOR STUDY")}</p>
          <h2>{t("home.curated.title", "A considered place to begin")}</h2>
        </div>
        <div className={styles.skeleton} />
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className={styles.section} data-testid="home-curated-empty">
        <div className={styles.header}>
          <p className={styles.eyebrow}>{t("home.curated.eyebrow", "CURATED FOR STUDY")}</p>
          <h2>{t("home.curated.title", "A considered place to begin")}</h2>
        </div>
        <p className={styles.emptyState}>
          {t(
            "home.curated.empty",
            "Explore the library to find a lesson that suits your study today.",
          )}
        </p>
        <Link href={routes.explore.index} className={styles.link}>
          {t("home.curated.browse", "Browse the library")}
        </Link>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>{t("home.curated.eyebrow", "CURATED FOR STUDY")}</p>
        <h2>{t("home.curated.title", "A considered place to begin")}</h2>
        <p className={styles.description}>
          {t("home.curated.description", "Hand-picked lessons for a steady listening path.")}
        </p>
      </div>
      <div className={styles.list}>
        {featured && (
          <FeaturedLectureCard
            title={featured.title}
            category={featured.kind}
            scholarName={featured.scholarName}
            scholarSlug={featured.scholarSlug}
            scholarTitle={featured.scholarTitle}
            duration={
              featured.durationSeconds ? `${Math.round(featured.durationSeconds / 60)} min` : ""
            }
            progress={0}
            totalLessons={1}
            eyebrow={t("home.curated.featured", "Curated for study")}
            onClick={() => navigateToListing(featured.slug)}
            onPlay={() => void play()}
          />
        )}
        {rest.map((item) => (
          <LectureRow
            key={item.id}
            title={item.title}
            category={item.kind}
            scholarName={item.scholarName}
            scholarSlug={item.scholarSlug}
            scholarTitle={item.scholarTitle}
            duration={item.durationSeconds ? `${Math.round(item.durationSeconds / 60)} min` : ""}
            progress={0}
            totalLessons={1}
            onClick={() => navigateToListing(item.slug)}
          />
        ))}
      </div>
    </section>
  );
}
