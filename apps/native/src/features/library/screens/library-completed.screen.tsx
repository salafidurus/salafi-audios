import { useCallback } from "react";
import { View, Text, Pressable, FlatList } from "react-native";
import type { LibraryItemDto } from "@sd/core-contracts";
import { useLibraryCompletedScreen } from "@sd/domain-content";
import { useAuth } from "@/core/auth/use-auth";

export type LibraryCompletedScreenProps = {
  onNavigateToLecture?: (id: string) => void;
};

function LibraryItem({ item, onPress }: { item: LibraryItemDto; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: "#eee" }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <Text style={{ color: "#16a34a", fontSize: 12 }}>✓</Text>
        <Text style={{ fontSize: 15, fontWeight: "600" }}>{item.lectureTitle}</Text>
      </View>
      <Text style={{ fontSize: 12, color: "#666", marginTop: 2, paddingStart: 18 }}>
        {item.scholarName}
        {item.seriesTitle ? ` · ${item.seriesTitle}` : ""}
      </Text>
      <Text style={{ fontSize: 12, color: "#999", marginTop: 2, paddingStart: 18 }}>
        {item.durationSeconds ? `${Math.round(item.durationSeconds / 60)} min` : ""}
        {item.completedAt ? ` · ${new Date(item.completedAt).toLocaleDateString()}` : ""}
      </Text>
    </Pressable>
  );
}

export function LibraryCompletedScreen({ onNavigateToLecture }: LibraryCompletedScreenProps) {
  const { isAuthenticated } = useAuth();
  const { items, isFetching } = useLibraryCompletedScreen(isAuthenticated);

  const handleItemPress = useCallback(
    (lectureId: string) => {
      onNavigateToLecture?.(lectureId);
    },
    [onNavigateToLecture],
  );

  const renderItem = useCallback(
    ({ item }: { item: LibraryItemDto }) => (
      <LibraryItem item={item} onPress={() => handleItemPress(item.lectureId)} />
    ),
    [handleItemPress],
  );

  if (isFetching && items.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading completed lectures…</Text>
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
      renderItem={renderItem}
      contentContainerStyle={{ padding: 8 }}
    />
  );
}
