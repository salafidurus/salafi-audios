/** Presents the most recently added public content and its playback actions. */
"use client";

import { routes, type FeedContentItemDto, type FeedItemDto } from "@sd/core-contracts";
import { useExploreRecentScreen } from "@sd/domain-content";
import Link from "next/link";

import { useTranslation } from "@/core/i18n/use-translation";
import { usePlayListing } from "@/features/audio";
import { useListingNavigation } from "@/shared/hooks/use-listing-navigation";

import { FeaturedLectureCard } from "../featured-lecture-card/featured-lecture-card";
import { LectureRow } from "../lecture-row/lecture-row";
import styles from "./recently-added-section.module.css";

function isContentItem(item: FeedItemDto): item is FeedContentItemDto {
  return item.kind !== "scholar_row" && item.kind !== "topic_row";
}

const MAX_RECENT_ITEMS = 10;

/** Content items supplied to the recently-added presentation. */
export type RecentlyAddedSectionContentProps = {
  items: FeedContentItemDto[];
  isLoading?: boolean;
};

function RecentlyAddedPopulated({
  featured,
  rest,
  t,
  navigateToListing,
  playFeatured,
}: {
  featured: FeedContentItemDto | undefined;
  rest: FeedContentItemDto[];
  t: ReturnType<typeof useTranslation>["t"];
  navigateToListing: (slug: string) => void;
  playFeatured: () => Promise<void>;
}) {
  return (
    <section className={styles.section} aria-label={t("home.recent.label", "Recently added")}>
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.sectionEyebrow}>{t("home.recent.eyebrow", "KEEP EXPLORING")}</p>
          <h2 className={styles.sectionTitle}>{t("home.recent.title", "Recently Added")}</h2>
        </div>
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
            scholarTitle={featured.scholarTitle}
            duration={
              featured.durationSeconds ? `${Math.round(featured.durationSeconds / 60)} min` : ""
            }
            progress={0}
            totalLessons={1}
            eyebrow={t("home.recent.featured", "Recently added")}
            onClick={() => navigateToListing(featured.slug)}
            onPlay={() => void playFeatured()}
          />
        )}
        {rest.length > 0 && (
          <div
            className={styles.restRail}
            aria-label={t("home.recent.more", "More recently added")}
          >
            {rest.map((item) => (
              <LectureRow
                key={item.id}
                title={item.title}
                category={item.kind}
                scholarName={item.scholarName}
                scholarSlug={item.scholarSlug}
                scholarTitle={item.scholarTitle}
                scholarImageUrl={item.scholarImageUrl}
                listingArtwork={item.thumbnailUrl}
                duration={
                  item.durationSeconds ? `${Math.round(item.durationSeconds / 60)} min` : ""
                }
                progress={0}
                totalLessons={1}
                onClick={() => navigateToListing(item.slug)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function RecentlyAddedSectionContent({
  items,
  isLoading = false,
}: RecentlyAddedSectionContentProps) {
  const { t } = useTranslation();
  const { navigateToListing } = useListingNavigation();
  const [featured, ...rest] = items;

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
          scholarImageUrl: featured.scholarImageUrl,
        }
      : null,
  );

  if (isLoading && items.length === 0) {
    return (
      <section
        className={styles.section}
        aria-label={t("home.recent.label", "Recently added")}
        data-testid="home-recent-loading"
      >
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
    return (
      <section
        className={styles.section}
        aria-label={t("home.recent.label", "Recently added")}
        data-testid="home-recent-empty"
      >
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t("home.recent.title", "Recently Added")}</h2>
          <Link href={routes.explore.index} className={styles.seeAllLink}>
            {t("common.seeAll", "See all")}
          </Link>
        </div>
        <p className={styles.emptyState}>
          {t("home.recent.empty", "New lessons will appear here as they are published.")}
        </p>
      </section>
    );
  }

  return (
    <RecentlyAddedPopulated
      featured={featured}
      rest={rest}
      t={t}
      navigateToListing={navigateToListing}
      playFeatured={playFeatured}
    />
  );
}

export { RecentlyAddedSectionContent };

/** Fetches and renders the recently-added section on the home screen. */
export function RecentlyAddedSection() {
  const { data, isLoading: isExploreLoading } = useExploreRecentScreen({ limit: MAX_RECENT_ITEMS });

  const items: FeedContentItemDto[] = [];
  for (const page of data?.pages ?? []) {
    for (const item of page.items) {
      if (isContentItem(item)) {
        items.push(item);
      }
    }
  }

  return <RecentlyAddedSectionContent items={items} isLoading={isExploreLoading} />;
}
