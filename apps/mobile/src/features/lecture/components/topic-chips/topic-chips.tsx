import { View, Text, ScrollView } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import type { TopicRefDto } from "@sd/core-contracts";

export type TopicChipsNativeProps = {
  topics: TopicRefDto[];
};

export function TopicChipsNative({ topics }: TopicChipsNativeProps) {
  const { theme } = useUnistyles();

  if (topics.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scrollView}
      contentContainerStyle={styles.container}
    >
      {topics.map((topic) => (
        <View
          key={topic.id}
          style={[
            styles.chip,
            {
              backgroundColor: theme.colors.surface.subtle,
              borderColor: theme.colors.border.subtle,
            },
          ]}
        >
          <Text style={[styles.chipText, { color: theme.colors.content.default }]}>
            {topic.name}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme) => ({
  scrollView: {
    marginTop: theme.spacing.component.gapMd,
  },
  container: {
    gap: theme.spacing.component.gapSm,
    paddingRight: theme.spacing.component.gapSm,
  },
  chip: {
    paddingVertical: theme.spacing.component.chipY,
    paddingHorizontal: theme.spacing.component.chipX,
    borderRadius: theme.radius.component.chip,
    borderWidth: 1,
  },
  chipText: {
    ...theme.typography.caption,
  },
}));
