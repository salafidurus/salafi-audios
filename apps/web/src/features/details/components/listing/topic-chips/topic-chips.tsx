/** Documents this module's responsibility and public boundary. */
"use client";

import type { TopicRefDto } from "@sd/core-contracts";

import { Badge } from "@/shared/components/ui/badge";

import styles from "./topic-chips.module.css";

/** Topic references to render as compact, non-interactive listing badges. */
export type TopicChipsProps = {
  topics: TopicRefDto[];
};

/** Renders nothing for an empty topic set and badges for each related topic otherwise. */
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
