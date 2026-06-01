import type { TopicRefDto } from "@sd/core-contracts";
import { View } from "react-native";
import { AppText } from "@/shared/components/AppText/AppText";

export type TopicChipsProps = {
  topics: TopicRefDto[];
};

export function TopicChips({ topics }: TopicChipsProps) {
  if (topics.length === 0) {
    return null;
  }

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
      {topics.map((topic) => (
        <View
          key={topic.id}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 999,
            backgroundColor: "#eef3e8",
          }}
        >
          <AppText variant="labelMd">{topic.name}</AppText>
        </View>
      ))}
    </View>
  );
}
