import { View, Text, TouchableOpacity, FlatList } from "react-native";
import type { FeedItemDto } from "@sd/core-contracts";
import { useFeedRecentScreen } from "../hooks/use-feed-recent";

export type FeedMobileNativeScreenProps = {
  onNavigateToLecture?: (id: string) => void;
};

function FeedItem({ item, onPress }: { item: FeedItemDto; onPress?: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: "#eee" }}
    >
      <Text style={{ fontSize: 15, fontWeight: "600" }}>{item.lectureTitle}</Text>
      <Text style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
        {item.scholarName}
        {item.seriesTitle ? ` · ${item.seriesTitle}` : ""}
      </Text>
      <Text style={{ fontSize: 11, color: "#999", marginTop: 2 }}>
        {item.durationSeconds ? `${Math.round(item.durationSeconds / 60)} min` : ""}
        {item.publishedAt ? ` · ${new Date(item.publishedAt).toLocaleDateString()}` : ""}
      </Text>
    </TouchableOpacity>
  );
}

export function FeedMobileNativeScreen({ onNavigateToLecture }: FeedMobileNativeScreenProps) {
  const { items, isFetching } = useFeedRecentScreen();

  if (isFetching && items.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading recent lectures...</Text>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 16 }}>
        <Text style={{ color: "#666" }}>No recent lectures yet. Check back soon.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <FeedItem item={item} onPress={() => onNavigateToLecture?.(item.lectureId)} />
      )}
      contentContainerStyle={{ padding: 8 }}
    />
  );
}
