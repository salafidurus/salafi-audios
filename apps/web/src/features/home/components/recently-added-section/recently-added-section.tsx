"use client";

import { routes, type FeedContentItemDto, type FeedItemDto } from "@sd/core-contracts";
import { useExploreRecentScreen } from "@sd/domain-content";
import Image from "next/image";
import Link from "next/link";

import { useTranslation } from "@/core/i18n/use-translation";
import { useFormattedDate } from "@/shared/hooks/use-formatted-date";
import { useFormattedScholarName } from "@/shared/hooks/use-formatted-scholar-name";

import styles from "./recently-added-section.module.css";

const MAX_ITEMS = 8;

function isContentItem(item: FeedItemDto): item is FeedContentItemDto {
  return item.kind !== "scholar_row" && item.kind !== "topic_row";
}

type RecentlyAddedCardProps = {
  item: FeedContentItemDto;
};

function RecentlyAddedCard({ item }: RecentlyAddedCardProps) {
  const { t } = useTranslation();
  const scholarName = useFormattedScholarName(item.scholarName, item.scholarSlug);
  const publishedText = useFormattedDate(item.publishedAt);
  const durationText = item.durationSeconds ? `${Math.round(item.durationSeconds / 60)} min` : "";

  return (
    <Link
      href={routes.listings.detail(item.slug)}
      className={styles.card}
      data-testid="recently-added-card"
    >
      {item.thumbnailUrl ? (
        <Image
          src={item.thumbnailUrl}
          alt=""
          width={320}
          height={180}
          className={styles.thumb}
          unoptimized
        />
      ) : (
        <div className={styles.thumbPlaceholder} aria-hidden="true">
          <span className={styles.thumbFormat}>{t(`format.${item.kind}`, item.kind)}</span>
        </div>
      )}
      <div className={styles.cardBody}>
        <p className={styles.title}>{item.title}</p>
        <p className={styles.meta}>{scholarName}</p>
        <p className={styles.meta}>
          {durationText}
          {durationText && " · "}
          {publishedText}
        </p>
      </div>
    </Link>
  );
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

  return (
    <section className={styles.section} aria-label={t("home.recent.label", "Recently added")}>
      <h2 className={styles.sectionTitle}>{t("home.recent.title", "Recently Added")}</h2>
      <div className={styles.grid}>
        {items.slice(0, MAX_ITEMS).map((item) => (
          <RecentlyAddedCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
