import { formatDuration } from "@/features/library/utils/format";
import { Button } from "@/shared/components/button/button";
import { Clock3, ListVideo, Play } from "lucide-react";
import Link from "next/link";
import styles from "./series-list-item.module.css";

export interface SeriesListItemData {
  id: string;
  slug: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  publishedLectureCount?: number;
  publishedDurationSeconds?: number;
  durationSeconds?: number;
}

interface SeriesListItemProps {
  item: SeriesListItemData;
  scholarSlug: string;
  itemType?: "series" | "lecture" | "collection";
}

export function SeriesListItem({ item, scholarSlug, itemType = "series" }: SeriesListItemProps) {
  const href =
    itemType === "series"
      ? `/series/${scholarSlug}/${item.slug}`
      : itemType === "collection"
        ? `/collections/${scholarSlug}/${item.slug}`
        : `/lectures/${scholarSlug}/${item.slug}`;

  const lessonCountLabel =
    typeof item.publishedLectureCount === "number"
      ? `${item.publishedLectureCount} ${item.publishedLectureCount === 1 ? "lesson" : "lessons"}`
      : undefined;

  const durationLabel =
    typeof item.publishedDurationSeconds === "number" && item.publishedDurationSeconds > 0
      ? formatDuration(item.publishedDurationSeconds)
      : typeof item.durationSeconds === "number" && item.durationSeconds > 0
        ? formatDuration(item.durationSeconds)
        : undefined;

  return (
    <article className={styles.card}>
      <Link href={href} className={styles.rowLink} aria-label={`Open ${itemType}: ${item.title}`} />

      <div
        className={styles.cover}
        style={item.coverImageUrl ? { backgroundImage: `url(${item.coverImageUrl})` } : undefined}
        aria-hidden="true"
      >
        <span className={styles.typeChip}>
          {itemType === "lecture" ? "Lecture" : itemType === "collection" ? "Collection" : "Series"}
        </span>
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>{item.title}</h3>
        {item.description ? <p className={styles.description}>{item.description}</p> : null}

        <div className={styles.metaRow}>
          {lessonCountLabel ? (
            <span className={styles.metaItem}>
              <ListVideo className={styles.metaIcon} aria-hidden="true" />
              <span>{lessonCountLabel}</span>
            </span>
          ) : null}
          {durationLabel ? (
            <span className={styles.metaItem}>
              <Clock3 className={styles.metaIcon} aria-hidden="true" />
              <span>{durationLabel}</span>
            </span>
          ) : null}
        </div>
      </div>

      <div className={styles.actions}>
        <Link
          href={href}
          className={styles.detailsLink}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Button variant="surface" size="sm">
            View details
          </Button>
        </Link>
        <Button
          variant="primary"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // TODO: wire to real playback queue / resume target resolver.
          }}
        >
          <Play size={16} />
          Play now
        </Button>
      </div>
    </article>
  );
}
