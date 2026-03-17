import { Pressable, ScrollView, Text } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { EaseView } from "react-native-ease";
import { useMemo, useState } from "react";
import type { TopicDetailDto, TopicSlug } from "@sd/contracts";

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
      contentContainerStyle={styles.container}
    >
      {options.map((option) => (
        <FilterChip
          key={option.id}
          label={option.label}
          isActive={option.id === "all" ? value.length === 0 : selected.has(option.id)}
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
      ))}
    </ScrollView>
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
    <EaseView
      animate={{ scale: isPressed ? 0.97 : 1, opacity: isPressed ? 0.9 : 1 }}
      transition={{ type: "spring", damping: 10, stiffness: 120 }}
      style={styles.chipWrap}
    >
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
    </EaseView>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.spacing.component.gapSm,
    paddingVertical: theme.spacing.component.gapSm,
  },
  chipWrap: {
    borderRadius: theme.radius.component.chip,
  },
  chip: {
    borderWidth: 1,
    borderRadius: theme.radius.component.chip,
    paddingHorizontal: theme.spacing.component.chipX,
    paddingVertical: theme.spacing.component.chipY,
  },
  chipLabel: {
    ...theme.typography.labelMd,
  },
}));
