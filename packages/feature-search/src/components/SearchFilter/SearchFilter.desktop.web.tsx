"use client";

import clsx from "clsx";
import type { TopicDetailDto } from "@sd/core-contracts";
import { useDragScrollWeb } from "@sd/shared";

const chipStyle = {
  fontFamily: "var(--typo-label-md-font-family)",
  fontSize: "var(--typo-label-md-font-size)",
  lineHeight: "var(--typo-label-md-line-height)",
  letterSpacing: "var(--typo-label-md-letter-spacing)",
  fontWeight: "var(--typo-label-md-font-weight)",
} as const;

const chipBase =
  "shrink-0 rounded-[var(--radius-component-chip)] border px-[var(--space-component-chip-x)] py-[var(--space-component-chip-y)] transition";
const chipInactive =
  "border-[var(--border-default)] bg-[var(--surface-default)] text-[var(--content-muted)] hover:bg-[var(--surface-hover)]";
const chipActive =
  "border-[var(--accent-primary-subtle-border)] bg-[var(--accent-primary-subtle-surface)] text-[var(--content-primary)]";

export type SearchFilterDesktopWebProps = {
  topics: TopicDetailDto[];
  active: string[];
  onToggle: (slug: string) => void;
  onClearAll: () => void;
};

export function SearchFilterDesktopWeb({
  topics,
  active,
  onToggle,
  onClearAll,
}: SearchFilterDesktopWebProps) {
  const isAllActive = active.length === 0;
  const scrollRef = useDragScrollWeb("horizontal");

  return (
    <div
      ref={scrollRef}
      className="flex overflow-x-auto cursor-grab gap-[var(--space-component-gap-sm)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <button
        type="button"
        onClick={onClearAll}
        className={clsx(chipBase, isAllActive ? chipActive : chipInactive)}
        style={chipStyle}
      >
        All
      </button>
      {topics.map((topic) => {
        const isActive = active.includes(topic.slug);
        return (
          <button
            key={topic.slug}
            type="button"
            className={clsx(chipBase, isActive ? chipActive : chipInactive)}
            style={chipStyle}
            onClick={() => onToggle(topic.slug)}
          >
            {topic.name}
          </button>
        );
      })}
    </div>
  );
}
