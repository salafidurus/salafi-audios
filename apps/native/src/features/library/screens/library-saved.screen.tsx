import { useCallback } from "react";
import { Text, FlatList } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { LibraryItemDto } from "@sd/core-contracts";
import { useLibrarySavedScreen } from "@sd/domain-content";
import { useAuth } from "@/core/auth/use-auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { LibraryItemRow } from "@/features/library/components/library-item-row/library-item-row";

export type LibrarySavedScreenProps = {
  onNavigateToLecture?: (id: string) => void;
};

export function LibrarySavedScreen({ onNavigateToLecture }: LibrarySavedScreenProps) {
  const { isAuthenticated } = useAuth();
  const { items, isFetching } = useLibrarySavedScreen(isAuthenticated);
  const { t } = useTranslation();

  const handleItemPress = useCallback(
    (lectureId: string) => {
      onNavigateToLecture?.(lectureId);
    },
    [onNavigateToLecture],
  );

  const renderItem = useCallback(
    ({ item }: { item: LibraryItemDto }) => (
      <LibraryItemRow item={item} variant="saved" onPress={() => handleItemPress(item.lectureId)} />
    ),
    [handleItemPress],
  );

  if (isFetching && items.length === 0) {
    return (
      <ScreenView center>
        <Text style={styles.loadingText}>{t("common.loading", "Loading...")}</Text>
      </ScreenView>
    );
  }

  if (items.length === 0) {
    return (
      <ScreenView center>
        <Text style={styles.emptyText}>
          {t("library.emptySaved", "No saved lectures yet. Save lectures to listen to later.")}
        </Text>
      </ScreenView>
    );
  }

  return (
    <ScreenView>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </ScreenView>
  );
}

const styles = StyleSheet.create((theme) => ({
  loadingText: {
    color: theme.colors.content.default,
  },
  emptyText: {
    color: theme.colors.content.muted,
    textAlign: "center",
  },
  listContent: {
    paddingBottom: theme.spacing.scale["2xl"],
  },
}));
