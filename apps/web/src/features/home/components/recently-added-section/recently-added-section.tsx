"use client";

import { type FeedContentItemDto, type FeedItemDto } from "@sd/core-contracts";
import { useExploreRecentScreen } from "@sd/domain-content";

import { useTranslation } from "@/core/i18n/use-translation";

import { FeaturedLectureCard } from "../featured-lecture-card/featured-lecture-card";
import { LectureRow } from "../lecture-row/lecture-row";
import styles from "./recently-added-section.module.css";

function isContentItem(item: FeedItemDto): item is FeedContentItemDto {
  return item.kind !== "scholar_row" && item.kind !== "topic_row";
}

export function RecentlyAddedSection() {
  const { t } = useTranslation();
  const { data } = useExploreRecentScreen();

  const items: FeedContentItemDto[] = [];
  for (const page of data?.pages ?? []) {
    for (const item of page.items) {
      if (isContentItem(item)) {
        items.push(item);
      }
    }
  }

  if (items.length === 0) {
    return null;
  }

  const [featured, ...rest] = items;

  return (
    <section className={styles.section} aria-label={t("home.recent.label", "Recently added")}>
      <h2 className={styles.sectionTitle}>{t("home.recent.title", "Recently Added")}</h2>
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
            onClick={() => {}}
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
            onClick={() => {}}
          />
        ))}
      </div>
    </section>
  );
}
