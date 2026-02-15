import Link from "next/link";
import { Clock3, Layers3, LibraryBig, ListVideo } from "lucide-react";
import { formatDuration } from "@/features/library/utils/format";
import type { RecommendationItem } from "@/features/home/types/home.types";
import styles from "./card.module.css";

const kindLabels: Record<RecommendationItem["kind"], string> = {
  lecture: "Lecture",
  series: "Series",
  collection: "Collection",
};

const kindIcons: Record<RecommendationItem["kind"], typeof Layers3> = {
  lecture: ListVideo,
  series: Layers3,
  collection: LibraryBig,
};

type CardProps = {
  item: RecommendationItem;
  variant?: "featured";
};

type MetaPart = { label: string; kind: "count" | "duration" | "meta" };

function formatMetaParts(item: RecommendationItem): MetaPart[] {
  const parts: MetaPart[] = [];

  if (typeof item.lessonCount === "number") {
    parts.push({
      label: `${item.lessonCount} ${item.lessonCount === 1 ? "lecture" : "lectures"}`,
      kind: "count",
    });
  }

  if (typeof item.totalDurationSeconds === "number" && item.totalDurationSeconds > 0) {
    parts.push({
      label: formatDuration(item.totalDurationSeconds),
      kind: "duration",
    });
  }

  if (parts.length === 0 && item.meta) {
    parts.push({ label: item.meta, kind: "meta" });
  }

  return parts;
}

export function RecommendationCard({ item, variant }: CardProps) {
  const isFeatured = variant === "featured";
  const metaParts = formatMetaParts(item);
  const KindIcon = kindIcons[item.kind];
  const metaBlock =
    metaParts.length > 0 ? (
      <div className={styles.metaRow}>
        {metaParts.map((part) => (
          <span key={`${item.id}-${part.kind}-${part.label}`} className={styles.metaItem}>
            {part.kind === "count" ? (
              <ListVideo className={styles.metaIcon} aria-hidden="true" />
            ) : null}
            {part.kind === "duration" ? (
              <Clock3 className={styles.metaIcon} aria-hidden="true" />
            ) : null}
            <span className={styles.metaText}>{part.label}</span>
          </span>
        ))}
      </div>
    ) : null;

  const content = isFeatured ? (
    <>
      <div
        className={`${styles.cover} ${styles.coverFeatured}`.trim()}
        style={item.coverImageUrl ? { backgroundImage: `url(${item.coverImageUrl})` } : undefined}
      />
      <div className={`${styles.body} ${styles.bodyFeatured}`.trim()}>
        <div className={styles.typeLabelRow}>
          <KindIcon className={styles.typeIcon} aria-hidden="true" />
          <p className={styles.typeLabel}>{kindLabels[item.kind]}</p>
        </div>
        <p className={styles.title}>{item.title}</p>
        <p className={styles.subtitle}>{item.subtitle}</p>
        {metaBlock}
      </div>
    </>
  ) : (
    <div
      className={styles.cover}
      style={item.coverImageUrl ? { backgroundImage: `url(${item.coverImageUrl})` } : undefined}
    >
      <span className={styles.typeChip}>
        <KindIcon className={styles.typeIcon} aria-hidden="true" />
        {kindLabels[item.kind]}
      </span>
      <div className={styles.overlay}>
        <p className={styles.title}>{item.title}</p>
        <p className={styles.subtitle}>{item.subtitle}</p>
        {metaBlock}
      </div>
    </div>
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
