"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import type { TopicDetailDto, TopicSlug } from "@sd/core-contracts";
import { useIsDesktop } from "@/shared/hooks/use-responsive";
import { useDragScroll } from "@/shared/hooks/use-drag-scroll";
import styles from "./SearchFilter.module.css";

export type SearchFilterValue = TopicSlug[];

export type SearchFilterProps = {
  value: SearchFilterValue;
  onChange: (value: SearchFilterValue) => void;
  topics: TopicDetailDto[];
};

export function SearchFilter({ value, onChange, topics }: SearchFilterProps) {
  const isDesktop = useIsDesktop();
  const scrollRef = useDragScroll("horizontal");
  const sortedTopics = useMemo(
    () => topics.toSorted((a, b) => a.name.localeCompare(b.name)),
    [topics],
  );

  const isAllActive = value.length === 0;
  const selected = useMemo(() => new Set(value), [value]);

  return (
    <div ref={scrollRef} className={styles.scrollContainer}>
      <button
        type="button"
        onClick={() => onChange([])}
        className={clsx(styles.chip, isAllActive ? styles.chipActive : styles.chipInactive)}
      >
        All
      </button>
      {sortedTopics.map((topic) => {
        const isActive = selected.has(topic.slug);
        return (
          <FilterChip
            key={topic.slug}
            label={topic.name}
            isActive={isActive}
            isDesktop={isDesktop}
            onPress={() =>
              onChange(
                selected.has(topic.slug)
                  ? value.filter((item) => item !== topic.slug)
                  : [...value, topic.slug],
              )
            }
          />
        );
      })}
    </div>
  );
}

type FilterChipProps = {
  label: string;
  isActive: boolean;
  isDesktop: boolean;
  onPress: () => void;
};

function FilterChip({ label, isActive, isDesktop, onPress }: FilterChipProps) {
  const [isPressed, setIsPressed] = useState(false);

  if (isDesktop) {
    return (
      <button
        type="button"
        className={clsx(styles.chip, isActive ? styles.chipActive : styles.chipInactive)}
        onClick={onPress}
      >
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onPress}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={clsx(
        styles.chip,
        isActive ? styles.chipActive : styles.chipInactive,
        isPressed && styles.chipPressed,
      )}
    >
      {label}
    </button>
  );
}
