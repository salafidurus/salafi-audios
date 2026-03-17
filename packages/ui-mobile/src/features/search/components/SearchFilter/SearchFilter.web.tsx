import { useMemo, useState } from "react";
import { View } from "react-native-unistyles/components/native/View";
import { Text } from "react-native-unistyles/components/native/Text";
import { Pressable } from "react-native-unistyles/components/native/Pressable";
import { ScrollView } from "react-native-unistyles/components/native/ScrollView";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
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
  const { theme } = useUnistyles();
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
