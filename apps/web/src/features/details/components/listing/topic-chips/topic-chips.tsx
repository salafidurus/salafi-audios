/** Client-side topic badges for a listing's descriptive metadata. */
"use client";

import type { TopicRefDto } from "@sd/core-contracts";

import { Badge } from "@/shared/components/ui/badge";

import styles from "./topic-chips.module.css";

/** Topic references available for badge rendering. */
export type TopicChipsProps = {
  topics: TopicRefDto[];
};

/** Renders nothing when a listing has no topics, otherwise renders badges. */
export function TopicChips({ topics }: TopicChipsProps) {
  if (topics.length === 0) {
    return null;
  }
  return (
    <div className={styles.container}>
      {topics.map((topic) => (
        <Badge key={topic.id} variant="outline">
          {topic.name}
        </Badge>
      ))}
    </div>
  );
}
