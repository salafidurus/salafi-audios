import type { TopicRefDto } from "@sd/core-contracts";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { AppText } from "@/shared/components/AppText/AppText";

export type TopicChipsProps = {
  topics: TopicRefDto[];
};

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
    gap: 8,
    marginTop: 16,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: theme.colors.surface.subtle,
  },
}));
