"use client";

import { routes, type FeedContentItemDto, type FeedItemDto } from "@sd/core-contracts";
import { useExploreRecentScreen } from "@sd/domain-content";
import Link from "next/link";

import { useTranslation } from "@/core/i18n/use-translation";
import { usePlayListing } from "@/features/audio";
import { useListingNavigation } from "@/shared/hooks/use-listing-navigation";

import { useHomePromotions } from "../../hooks/use-home-promotions";
import { FeaturedLectureCard } from "../featured-lecture-card/featured-lecture-card";
import { LectureRow } from "../lecture-row/lecture-row";
import styles from "./recently-added-section.module.css";

function isContentItem(item: FeedItemDto): item is FeedContentItemDto {
  return item.kind !== "scholar_row" && item.kind !== "topic_row";
}

const MAX_RECENT_ITEMS = 10;

export function RecentlyAddedSection() {
  const { t } = useTranslation();
  const { navigateToListing } = useListingNavigation();
  const { data: promoData, isLoading: isPromosLoading } = useHomePromotions();
  const { data, isLoading: isExploreLoading } = useExploreRecentScreen({ limit: MAX_RECENT_ITEMS });

  const items: FeedContentItemDto[] = [];
  for (const page of data?.pages ?? []) {
    for (const item of page.items) {
      if (isContentItem(item)) {
        items.push(item);
      }
    }
  }

  const picks = promoData?.editorsPicks?.map((pick) => pick.listing) ?? [];
  const itemsToUse = picks.length > 0 ? picks : items;
  const [featured, ...rest] = itemsToUse;

  const isLoading = isPromosLoading || isExploreLoading;

  const { play: playFeatured } = usePlayListing(
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
      <section className={styles.section} aria-label={t("home.recent.label", "Recently added")}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t("home.recent.title", "Recently Added")}</h2>
          <Link href={routes.explore.index} className={styles.seeAllLink}>
            {t("common.seeAll", "See all")}
          </Link>
        </div>
        <div className={styles.list}>
          <div className={`${styles.skeletonLine} ${styles.skeletonFeaturedCard}`} />
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={`recent-skeleton-${i}`}
              className={`${styles.skeletonLine} ${styles.skeletonRow}`}
            />
          ))}
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <section className={styles.section} aria-label={t("home.recent.label", "Recently added")}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{t("home.recent.title", "Recently Added")}</h2>
        <Link href={routes.explore.index} className={styles.seeAllLink}>
          {t("common.seeAll", "See all")}
        </Link>
      </div>
      <div className={styles.list}>
        {featured && (
          <FeaturedLectureCard
            title={featured.title}
            category={featured.kind}
            scholarName={featured.scholarName}
            scholarSlug={featured.scholarSlug}
            duration={
              featured.durationSeconds ? `${Math.round(featured.durationSeconds / 60)} min` : ""
            }
            progress={0}
            totalLessons={1}
            onClick={() => navigateToListing(featured.slug)}
            onPlay={() => void playFeatured()}
          />
        )}
        {rest.map((item) => (
          <LectureRow
            key={item.id}
            title={item.title}
            category={item.kind}
            scholarName={item.scholarName}
            scholarSlug={item.scholarSlug}
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
