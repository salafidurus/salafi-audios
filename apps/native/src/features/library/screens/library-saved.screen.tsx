import { useCallback } from "react";
import { View, Text, Pressable, FlatList } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { LibraryItemDto } from "@sd/core-contracts";
import { useLibrarySavedScreen } from "@sd/domain-content";
import { useAuth } from "@/core/auth/use-auth";

export type LibrarySavedScreenProps = {
  onNavigateToLecture?: (id: string) => void;
};

function LibraryItem({ item, onPress }: { item: LibraryItemDto; onPress?: () => void }) {
  const progress =
    item.durationSeconds && item.progressSeconds
      ? Math.round((item.progressSeconds / item.durationSeconds) * 100)
      : null;

  return (
    <Pressable onPress={onPress} style={styles.item}>
      <Text style={styles.itemTitle}>{item.lectureTitle}</Text>
      <Text style={styles.itemSubtitle}>
        {item.scholarName}
        {item.seriesTitle ? ` · ${item.seriesTitle}` : ""}
      </Text>
      <Text style={styles.itemMeta}>
        {item.durationSeconds ? `${Math.round(item.durationSeconds / 60)} min` : ""}
        {progress !== null ? ` · ${progress}% listened` : ""}
        {item.savedAt ? ` · Saved ${new Date(item.savedAt).toLocaleDateString()}` : ""}
      </Text>
    </Pressable>
  );
}

export function LibrarySavedScreen({ onNavigateToLecture }: LibrarySavedScreenProps) {
  const { isAuthenticated } = useAuth();
  const { items, isFetching } = useLibrarySavedScreen(isAuthenticated);

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
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Loading saved lectures…</Text>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          No saved lectures yet. Save lectures to listen to later.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.listContent}
    />
  );
}

const styles = StyleSheet.create((theme) => ({
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subtle,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.content.strong,
  },
  itemSubtitle: {
    fontSize: 12,
    color: theme.colors.content.muted,
    marginTop: 2,
  },
  itemMeta: {
    fontSize: 12,
    color: theme.colors.content.muted,
    marginTop: 2,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: theme.colors.content.default,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  emptyText: {
    color: theme.colors.content.muted,
    textAlign: "center",
  },
  listContent: {
    padding: 8,
  },
}));
