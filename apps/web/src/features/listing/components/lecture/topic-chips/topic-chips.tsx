"use client";

import type { TopicRefDto } from "@sd/core-contracts";
import { AppText } from "@/shared/components/AppText/AppText";
import styles from "./topic-chips.module.css";

export type TopicChipsProps = {
  topics: TopicRefDto[];
};

export function TopicChips({ topics }: TopicChipsProps) {
  if (topics.length === 0) return null;

  return (
    <div className={styles.container}>
      {topics.map((topic) => (
        <span key={topic.id} className={styles.chip}>
          <AppText variant="caption">{topic.name}</AppText>
        </span>
      ))}
    </div>
  );
}
