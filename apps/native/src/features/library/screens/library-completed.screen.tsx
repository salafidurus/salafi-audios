import { useCallback } from "react";
import { View, Text, Pressable, FlatList } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { LibraryItemDto } from "@sd/core-contracts";
import { useLibraryCompletedScreen } from "@sd/domain-content";
import { useAuth } from "@/core/auth/use-auth";

export type LibraryCompletedScreenProps = {
  onNavigateToLecture?: (id: string) => void;
};

function LibraryItem({ item, onPress }: { item: LibraryItemDto; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.item}>
      <View style={styles.itemRow}>
        <Text style={styles.checkmark}>✓</Text>
        <Text style={styles.itemTitle}>{item.lectureTitle}</Text>
      </View>
      <Text style={styles.itemSubtitle}>
        {item.scholarName}
        {item.seriesTitle ? ` · ${item.seriesTitle}` : ""}
      </Text>
      <Text style={styles.itemMeta}>
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
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Loading completed lectures…</Text>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No completed lectures yet. Keep listening!</Text>
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
    padding: theme.spacing.scale.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subtle,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  checkmark: {
    color: theme.colors.state.success,
    fontSize: 12,
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
    paddingStart: 18,
  },
  itemMeta: {
    fontSize: 12,
    color: theme.colors.content.muted,
    marginTop: 2,
    paddingStart: 18,
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
    padding: theme.spacing.scale.lg,
  },
  emptyText: {
    color: theme.colors.content.muted,
    textAlign: "center",
  },
  listContent: {
    padding: theme.spacing.scale.sm,
  },
}));
