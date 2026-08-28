import type { TopicRefDto } from "@sd/core-contracts";

import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { AppText } from "@/shared/components/AppText/AppText";

/** Provides the native features listing components topic-chips topic-chips module responsibility. */
/** Describes the TopicChipsProps native type contract and behavior. */
export type TopicChipsProps = {
  topics: TopicRefDto[];
};

/** Describes the TopicChips native function contract and behavior. */
export function TopicChips({ topics }: TopicChipsProps) {
  if (topics.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {topics.map((topic) => (
        <View key={topic.id} style={styles.chip}>
          <AppText variant="labelMd">{topic.name}</AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.scale.sm,
    marginTop: theme.spacing.scale.lg,
  },
  chip: {
    paddingHorizontal: theme.spacing.scale.md,
    paddingVertical: theme.spacing.scale.sm,
    borderRadius: 999,
    backgroundColor: theme.colors.surface.subtle,
  },
}));
