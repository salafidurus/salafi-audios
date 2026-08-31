import type { TopicDetailDto, TopicSlug } from "@sd/core-contracts";

import { useMemo } from "react";
import { ScrollView } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { NativeButton } from "@/shared/ui";

/** Implements native search input, filtering, results, and empty states. */
/** Defines the native search filter value contract shared by its consumers. */
export type SearchFilterValue = TopicSlug[];

type FilterOption = {
  id: "all" | TopicSlug;
  label: string;
};

/** Describes the inputs, callbacks, and optional state accepted by Search Filter. */
export type SearchFilterProps = {
  value: SearchFilterValue;
  onChange: (value: SearchFilterValue) => void;
  topics: TopicDetailDto[];
};

/**
 * Defines the native search filter contract used by this module.
 * Horizontal scrolling remains an RN infrastructure fallback because Expo UI
 * 57's universal ScrollView does not expose the required horizontal prop.
 */
export function SearchFilter({ value, onChange, topics }: SearchFilterProps) {
  const options = useMemo<FilterOption[]>(() => {
    const sortedTopics = [...topics].sort((a, b) => a.name.ar.localeCompare(b.name.ar));
    return [
      { id: "all", label: "All" },
      ...sortedTopics.map((topic) => ({ id: topic.slug, label: topic.name.ar })),
    ];
  }, [topics]);

  const selected = useMemo(() => new Set(value), [value]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}
    >
      {/* react-doctor-disable-next-line react-doctor/rn-no-scrollview-mapped-list */}
      {options.map((option) => {
        const isActive = option.id === "all" ? value.length === 0 : selected.has(option.id);
        return (
          <NativeButton
            key={option.id}
            label={option.label}
            size="sm"
            variant={isActive ? "primary" : "outline"}
            testID={`native-search-filter-${option.id}`}
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
          />
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
}));
