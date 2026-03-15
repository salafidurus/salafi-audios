import { Pressable, ScrollView, Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { EaseView } from "react-native-ease";
import { useMemo, useState } from "react";

export type SearchFilterValue = "all" | "lectures" | "series" | "collections";

type FilterOption = {
  id: SearchFilterValue;
  label: string;
};

export type SearchFilterProps = {
  value: SearchFilterValue;
  onChange: (value: SearchFilterValue) => void;
};

export function SearchFilter({ value, onChange }: SearchFilterProps) {
  const { theme } = useUnistyles();
  const options = useMemo<FilterOption[]>(
    () => [
      { id: "all", label: "All" },
      { id: "lectures", label: "Lectures" },
      { id: "series", label: "Series" },
      { id: "collections", label: "Collections" },
    ],
    [],
  );

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
          isActive={value === option.id}
          onPress={() => onChange(option.id)}
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
