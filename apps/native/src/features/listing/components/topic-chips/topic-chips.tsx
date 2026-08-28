import type { TopicRefDto } from "@sd/core-contracts";

import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { AppText } from "@/shared/components/AppText/AppText";

/** Builds native lecture and scholar content surfaces from canonical identities. */
/** Describes the inputs, callbacks, and optional state accepted by Topic Chips. */
export type TopicChipsProps = {
  topics: TopicRefDto[];
};

/** Defines the native topic chips contract used by this module. */
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
