"use client";

import { type CSSProperties, useMemo, useState } from "react";
import type { TopicDetailDto, TopicSlug } from "@sd/core-contracts";
import { useDragScroll } from "../../../../shared/hooks/use-drag-scroll";
import styles from "./SearchFilter.mobile.module.css";

export type SearchFilterValue = TopicSlug[];

type FilterOption = {
  id: "all" | TopicSlug;
  label: string;
};

export type SearchFilterProps = {
  value: SearchFilterValue;
  onChange: (value: SearchFilterValue) => void;
  topics: TopicDetailDto[];
};

export type SearchFilterMobileProps = SearchFilterProps;

export function SearchFilterMobile({ value, onChange, topics }: SearchFilterMobileProps) {
  const scrollRef = useDragScroll("horizontal");

  const options = useMemo<FilterOption[]>(() => {
    const sortedTopics = [...topics].sort((a, b) => a.name.localeCompare(b.name));
    return [
      { id: "all", label: "All" },
      ...sortedTopics.map((topic) => ({ id: topic.slug, label: topic.name })),
    ];
  }, [topics]);

  const selected = useMemo(() => new Set(value), [value]);

  return (
    <div
      ref={scrollRef}
      style={
        {
          display: "flex",
          flexDirection: "row",
          overflowX: "auto",
          overflowY: "hidden",
          gap: "var(--space-component-gap-sm)",
          paddingTop: "var(--space-component-gap-sm)",
          paddingBottom: "var(--space-component-gap-sm)",
          scrollbarWidth: "none",
          cursor: "grab",
        } satisfies CSSProperties
      }
    >
      {options.map((option) => {
        const isActive = option.id === "all" ? value.length === 0 : selected.has(option.id);
        return (
          <FilterChip
            key={option.id}
            label={option.label}
            isActive={isActive}
            onPress={() => {
              if (option.id === "all") {
                onChange([]);
                return;
              }

              const next = new Set(value);
              if (next.has(option.id)) {
                next.delete(option.id);
              } else {
                next.add(option.id);
              }

              onChange(Array.from(next));
            }}
          />
        );
      })}
    </div>
  );
}

type FilterChipProps = {
  label: string;
  isActive: boolean;
  onPress: () => void;
};

function FilterChip({ label, isActive, onPress }: FilterChipProps) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <button
      type="button"
      onClick={onPress}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={`${styles.chip} ${isActive ? styles.chipActive : styles.chipInactive} ${isPressed ? styles.chipPressed : ""}`}
    >
      {label}
    </button>
  );
}
