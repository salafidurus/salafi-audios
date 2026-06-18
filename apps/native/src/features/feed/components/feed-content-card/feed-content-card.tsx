import { Text, Pressable } from "react-native";
import type { FeedContentItemDto } from "@sd/core-contracts";
import { pickContentField } from "@sd/core-i18n";
import { useShowOriginalContent } from "@/features/i18n/content-preference";

export type FeedContentCardProps = {
  item: FeedContentItemDto;
  onPress?: () => void;
};

export function FeedContentCard({ item, onPress }: FeedContentCardProps) {
  const showOriginal = useShowOriginalContent();
  const title = pickContentField(item.title, item.original?.title, showOriginal);

  return (
    <Pressable
      onPress={onPress}
      style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: "#eee" }}
    >
      <Text style={{ fontSize: 15, fontWeight: "600" }}>{title}</Text>
      <Text style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
        {item.scholarName}
        {item.kind !== "lecture" ? ` · ${item.kind}` : ""}
      </Text>
      <Text style={{ fontSize: 12, color: "#999", marginTop: 2 }}>
        {item.durationSeconds ? `${Math.round(item.durationSeconds / 60)} min` : ""}
        {item.publishedAt ? ` · ${new Date(item.publishedAt).toLocaleDateString()}` : ""}
      </Text>
    </Pressable>
  );
}
