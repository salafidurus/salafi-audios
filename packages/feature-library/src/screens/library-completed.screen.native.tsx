import { View, Text, TouchableOpacity, FlatList } from "react-native";
import type { LibraryItemDto } from "@sd/core-contracts";
import { useLibraryCompletedScreen } from "../hooks/use-library-completed";

export type LibraryCompletedMobileNativeScreenProps = {
  onNavigateToLecture?: (id: string) => void;
};

function LibraryItem({ item, onPress }: { item: LibraryItemDto; onPress?: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: "#eee" }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <Text style={{ color: "#16a34a", fontSize: 12 }}>✓</Text>
        <Text style={{ fontSize: 15, fontWeight: "600" }}>{item.lectureTitle}</Text>
      </View>
      <Text style={{ fontSize: 12, color: "#666", marginTop: 2, paddingLeft: 18 }}>
        {item.scholarName}
        {item.seriesTitle ? ` · ${item.seriesTitle}` : ""}
      </Text>
      <Text style={{ fontSize: 11, color: "#999", marginTop: 2, paddingLeft: 18 }}>
        {item.durationSeconds ? `${Math.round(item.durationSeconds / 60)} min` : ""}
        {item.completedAt ? ` · ${new Date(item.completedAt).toLocaleDateString()}` : ""}
      </Text>
    </TouchableOpacity>
  );
}

export function LibraryCompletedMobileNativeScreen({
  onNavigateToLecture,
}: LibraryCompletedMobileNativeScreenProps) {
  const { items, isFetching } = useLibraryCompletedScreen();

  if (isFetching && items.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading completed lectures...</Text>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 16 }}>
        <Text style={{ color: "#666", textAlign: "center" }}>
          No completed lectures yet. Keep listening!
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <LibraryItem item={item} onPress={() => onNavigateToLecture?.(item.lectureId)} />
      )}
      contentContainerStyle={{ padding: 8 }}
    />
  );
}
