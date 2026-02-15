import Link from "next/link";
import { formatDuration } from "@/features/library/utils/format";
import type { RecommendationItem } from "@/features/home/types/home.types";
import styles from "./card.module.css";

const kindLabels: Record<RecommendationItem["kind"], string> = {
  lecture: "Lecture",
  series: "Series",
  collection: "Collection",
};

type CardProps = {
  item: RecommendationItem;
  variant?: "featured";
};

function formatMetaLine(item: RecommendationItem): string | undefined {
  const parts: string[] = [];

  if (typeof item.lessonCount === "number") {
    parts.push(`${item.lessonCount} ${item.lessonCount === 1 ? "lecture" : "lectures"}`);
  }

  if (typeof item.totalDurationSeconds === "number" && item.totalDurationSeconds > 0) {
    parts.push(formatDuration(item.totalDurationSeconds));
  }

  return parts.length > 0 ? parts.join(" · ") : item.meta;
}

export function RecommendationCard({ item, variant }: CardProps) {
  const isFeatured = variant === "featured";
  const metaLine = formatMetaLine(item);
  const content = (
    <>
      <div
        className={`${styles.cover} ${isFeatured ? styles.coverFeatured : ""}`.trim()}
        style={item.coverImageUrl ? { backgroundImage: `url(${item.coverImageUrl})` } : undefined}
      >
        {isFeatured ? null : <span className={styles.typeChip}>{kindLabels[item.kind]}</span>}
      </div>
      <div className={`${styles.body} ${isFeatured ? styles.bodyFeatured : ""}`.trim()}>
        {isFeatured ? <p className={styles.typeLabel}>{kindLabels[item.kind]}</p> : null}
        <p className={styles.title}>{item.title}</p>
        <p className={styles.subtitle}>{item.subtitle}</p>
        {metaLine ? <p className={styles.meta}>{metaLine}</p> : null}
      </div>
    </>
  );

  return (
    <Link
      href={item.href}
      className={`${styles.card} ${isFeatured ? styles.cardFeatured : ""}`.trim()}
      role="listitem"
    >
      {content}
    </Link>
  );
}
