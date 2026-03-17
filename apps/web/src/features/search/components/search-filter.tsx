"use client";

import { useEffect, useRef } from "react";
import clsx from "clsx";
import type { TopicDetailDto } from "@sd/contracts";

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
  "border-[var(--border-primary)] bg-[var(--surface-selected)] text-[var(--content-strong)]";

type SearchFilterProps = {
  topics: TopicDetailDto[];
  active: string[];
  onToggle: (slug: string) => void;
  onClearAll: () => void;
};

export function SearchFilter({ topics, active, onToggle, onClearAll }: SearchFilterProps) {
  const isAllActive = active.length === 0;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div
      ref={scrollRef}
      className="flex overflow-x-auto gap-[var(--space-component-gap-sm)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
