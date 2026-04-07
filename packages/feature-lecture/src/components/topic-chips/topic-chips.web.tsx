"use client";

import type { TopicRefDto } from "@sd/core-contracts";
import { AppText } from "@sd/shared";

export type TopicChipsWebProps = {
  topics: TopicRefDto[];
};

export function TopicChipsWeb({ topics }: TopicChipsWebProps) {
  if (topics.length === 0) return null;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
      {topics.map((topic) => (
        <span
          key={topic.id}
          style={{
            display: "inline-block",
            padding: "4px 12px",
            borderRadius: 999,
            background: "var(--surface-subtle, #f0f0f0)",
            border: "1px solid var(--border-subtle, #e0e0e0)",
          }}
        >
          <AppText variant="caption">{topic.name}</AppText>
        </span>
      ))}
    </div>
  );
}
