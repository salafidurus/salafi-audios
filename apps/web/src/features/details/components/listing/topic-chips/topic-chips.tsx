"use client";

import type { TopicRefDto } from "@sd/core-contracts";

import { Badge } from "@/shared/components/ui/badge";

import styles from "./topic-chips.module.css";

export type TopicChipsProps = {
  topics: TopicRefDto[];
};

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
