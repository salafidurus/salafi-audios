import { View, Text, TouchableOpacity, FlatList } from "react-native";
import type { LibraryItemDto } from "@sd/core-contracts";
import { useLibrarySavedScreen } from "../hooks/use-library-saved";

export type LibrarySavedMobileNativeScreenProps = {
  onNavigateToLecture?: (id: string) => void;
};

function LibraryItem({ item, onPress }: { item: LibraryItemDto; onPress?: () => void }) {
  const progress =
    item.durationSeconds && item.progressSeconds
      ? Math.round((item.progressSeconds / item.durationSeconds) * 100)
      : null;

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
        {progress !== null ? ` · ${progress}% listened` : ""}
        {item.savedAt ? ` · Saved ${new Date(item.savedAt).toLocaleDateString()}` : ""}
      </Text>
    </TouchableOpacity>
  );
}

export function LibrarySavedMobileNativeScreen({
  onNavigateToLecture,
}: LibrarySavedMobileNativeScreenProps) {
  const { items, isFetching } = useLibrarySavedScreen();

  if (isFetching && items.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading saved lectures...</Text>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 16 }}>
        <Text style={{ color: "#666", textAlign: "center" }}>
          No saved lectures yet. Save lectures to listen to later.
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
