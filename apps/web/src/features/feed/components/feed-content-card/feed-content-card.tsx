"use client";

import type { FeedContentItemDto } from "@sd/core-contracts";
import { pickContentField } from "@sd/core-i18n";
import { useShowOriginalContent } from "@/features/i18n/content-preference";
import styles from "./feed-content-card.module.css";

export type FeedContentCardProps = {
  item: FeedContentItemDto;
  onPress?: () => void;
};

export function FeedContentCard({ item, onPress }: FeedContentCardProps) {
  const showOriginal = useShowOriginalContent();
  const title = pickContentField(item.title, item.original?.title, showOriginal);

  return (
    <button type="button" onClick={onPress} className={styles.card}>
      <div className={styles.title}>{title}</div>
      <div className={styles.meta}>
        {item.scholarName}
        {item.kind !== "single" && ` · ${item.kind}`}
      </div>
      <div className={styles.sub}>
        {item.durationSeconds ? `${Math.round(item.durationSeconds / 60)} min` : ""}
        {item.publishedAt && ` · ${new Date(item.publishedAt).toLocaleDateString()}`}
      </div>
    </button>
  );
}
