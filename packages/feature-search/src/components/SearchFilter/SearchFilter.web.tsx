"use client";

import { type CSSProperties, useMemo, useState } from "react";
import { View } from "react-native-unistyles/components/native/View";
import { Text } from "react-native-unistyles/components/native/Text";
import { Pressable } from "react-native-unistyles/components/native/Pressable";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import type { TopicDetailDto, TopicSlug } from "@sd/contracts";
import { useDragScroll } from "@sd/shared";

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

export function SearchFilter({ value, onChange, topics }: SearchFilterProps) {
  const { theme } = useUnistyles();
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
          gap: theme.spacing.component.gapSm,
          paddingTop: theme.spacing.component.gapSm,
          paddingBottom: theme.spacing.component.gapSm,
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
  const { theme } = useUnistyles();
  const [isPressed, setIsPressed] = useState(false);

  return (
    <View style={styles.chipWrap}>
      <Pressable
        onPress={onPress}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        style={[
          styles.chip,
          {
            backgroundColor: isActive ? theme.colors.surface.default : theme.colors.surface.subtle,
            borderColor: theme.colors.border.subtle,
          },
        ]}
      >
        <Text
          style={[
            styles.chipLabel,
            { color: isActive ? theme.colors.content.strong : theme.colors.content.muted },
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  chipWrap: {
    borderRadius: theme.radius.component.chip,
  },
  chip: {
    borderWidth: 1,
    borderRadius: theme.radius.component.chip,
    _web: {
      paddingHorizontal: theme.spacing.component.chipX,
      paddingVertical: theme.spacing.component.chipY,
    },
  },
  chipLabel: {
    _web: {
      ...theme.typography.labelMd,
      lineHeight: String(theme.typography.labelMd.lineHeight),
    },
  },
}));
