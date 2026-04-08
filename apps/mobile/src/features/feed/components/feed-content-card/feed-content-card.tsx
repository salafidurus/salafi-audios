import { View, Text, Pressable } from "react-native";
import type { FeedContentItemDto } from "@sd/core-contracts";

export type FeedContentCardNativeProps = {
  item: FeedContentItemDto;
  onPress?: () => void;
};

export function FeedContentCardNative({ item, onPress }: FeedContentCardNativeProps) {
  return (
    <Pressable
      onPress={onPress}
      style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: "#eee" }}
    >
      <Text style={{ fontSize: 15, fontWeight: "600" }}>{item.title}</Text>
      <Text style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
        {item.scholarName}
        {item.kind !== "lecture" ? ` · ${item.kind}` : ""}
      </Text>
      <Text style={{ fontSize: 11, color: "#999", marginTop: 2 }}>
        {item.durationSeconds ? `${Math.round(item.durationSeconds / 60)} min` : ""}
        {item.publishedAt ? ` · ${new Date(item.publishedAt).toLocaleDateString()}` : ""}
      </Text>
    </Pressable>
  );
}
