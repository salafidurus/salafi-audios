import { useMemo } from "react";
import { Pressable, ScrollView, Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { TopicDetailDto, TopicSlug } from "@sd/core-contracts";

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
  const options = useMemo<FilterOption[]>(() => {
    const sortedTopics = [...topics].sort((a, b) => a.name.localeCompare(b.name));
    return [
      { id: "all", label: "All" },
      ...sortedTopics.map((topic) => ({ id: topic.slug, label: topic.name })),
    ];
  }, [topics]);

  const selected = useMemo(() => new Set(value), [value]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}
    >
      {options.map((option) => {
        const isActive = option.id === "all" ? value.length === 0 : selected.has(option.id);
        return (
          <Pressable
            key={option.id}
            onPress={() => {
              if (option.id === "all") {
                onChange([]);
                return;
              }

              const next = new Set(value);
              if (next.has(option.id)) next.delete(option.id);
              else next.add(option.id);
              onChange(Array.from(next));
            }}
            style={({ pressed }) => [
              styles.chip,
              isActive && styles.chipActive,
              pressed && styles.chipPressed,
            ]}
          >
            <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme) => ({
  list: {
    gap: theme.spacing.component.gapSm,
    paddingTop: theme.spacing.component.gapSm,
    paddingBottom: theme.spacing.component.gapSm,
  },
  chip: {
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    borderRadius: theme.radius.component.chip,
    backgroundColor: theme.colors.surface.subtle,
    paddingHorizontal: theme.spacing.component.chipX,
    paddingVertical: theme.spacing.component.chipY,
  },
  chipActive: {
    backgroundColor: theme.colors.surface.default,
  },
  chipPressed: {
    opacity: 0.85,
  },
  chipLabel: {
    color: theme.colors.content.muted,
    ...theme.typography.labelMd,
  },
  chipLabelActive: {
    color: theme.colors.content.strong,
  },
}));
