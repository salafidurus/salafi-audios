"use client";

import clsx from "clsx";
import { useMemo } from "react";
import type { TopicDetailDto } from "@sd/core-contracts";
import { useDragScroll } from "@/shared/hooks/use-drag-scroll";

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
  "border-[var(--border-subtle)] bg-[var(--surface-subtle)] text-[var(--content-muted)] hover:opacity-90";
const chipActive =
  "border-[var(--accent-primary-subtle-border)] bg-[var(--accent-primary-subtle-surface)] text-[var(--accent-primary-subtle-fg)]";

export type SearchFilterDesktopProps = {
  value: string[];
  onChange: (value: string[]) => void;
  topics: TopicDetailDto[];
};

export function SearchFilterDesktop({ value, onChange, topics }: SearchFilterDesktopProps) {
  const isAllActive = value.length === 0;
  const scrollRef = useDragScroll("horizontal");
  const sortedTopics = useMemo(
    // eslint-disable-next-line react-doctor/js-tosorted-immutable
    () => [...topics].sort((a, b) => a.name.localeCompare(b.name)),
    [topics],
  );

  return (
    <div
      ref={scrollRef}
      className="flex overflow-x-auto cursor-grab gap-[var(--space-component-gap-sm)] py-[var(--space-component-gap-sm)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <button
        type="button"
        onClick={() => onChange([])}
        className={clsx(chipBase, isAllActive ? chipActive : chipInactive)}
        style={chipStyle}
      >
        All
      </button>
      {sortedTopics.map((topic) => {
        const isActive = value.includes(topic.slug);
        return (
          <button
            key={topic.slug}
            type="button"
            className={clsx(chipBase, isActive ? chipActive : chipInactive)}
            style={chipStyle}
            onClick={() =>
              onChange(
                value.includes(topic.slug)
                  ? value.filter((item) => item !== topic.slug)
                  : [...value, topic.slug],
              )
            }
          >
            {topic.name}
          </button>
        );
      })}
    </div>
  );
}
