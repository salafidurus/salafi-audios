/** Documents this module's responsibility and public boundary. */
"use client";

import type { ContentSuggestionDto } from "@sd/core-contracts";

import { pickContentField } from "@sd/core-i18n";

import { useShowOriginalContent } from "@/features/settings/content-preference";
import { useFormattedScholarName } from "@/shared/hooks/use-formatted-scholar-name";

import styles from "./feed-topic-row.module.css";

function FeedTopicItem({
  item,
  showOriginal,
  onItemPress,
}: {
  item: ContentSuggestionDto;
  showOriginal: boolean;
  onItemPress?: (slug: string) => void;
}) {
  const title = pickContentField(item.title, item.original?.title, showOriginal);
  const scholarName = useFormattedScholarName(item.scholarName, item.scholarSlug);

  return (
    <button type="button" className={styles.item} onClick={() => onItemPress?.(item.slug)}>
      <span className={styles.itemTitle}>{title}</span>
      <span className={styles.itemScholar}>{scholarName}</span>
      {item.durationSeconds && (
        <span className={styles.itemMeta}>{Math.floor(item.durationSeconds / 60)}m</span>
      )}
    </button>
  );
}

export type FeedTopicRowProps = {
  topicName: string;
  items: ContentSuggestionDto[];
  onItemPress?: (slug: string) => void;
};

export function FeedTopicRow({ topicName, items, onItemPress }: FeedTopicRowProps) {
  const showOriginal = useShowOriginalContent();

  if (items.length === 0) return null;

  return (
    <div className={styles.container}>
      <div className={styles.title}>{topicName}</div>
      <div className={styles.scroll}>
        {items.map((item) => (
          <FeedTopicItem
            key={item.id}
            item={item}
            showOriginal={showOriginal}
            onItemPress={onItemPress}
          />
        ))}
      </div>
    </div>
  );
}
