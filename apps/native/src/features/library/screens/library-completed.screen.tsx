import { useLibraryCompletedScreen } from "@sd/domain-content";
import { useCallback } from "react";
import { ScrollView } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { useAuth } from "@/core/auth/use-auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { LibraryItemRow } from "@/features/library/components/library-item-row/library-item-row";
import { EmptyState } from "@/shared/components/EmptyState/EmptyState";
import { List } from "@/shared/components/List";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";

export type LibraryCompletedScreenProps = {
  onNavigateToListing?: (slug: string) => void;
};

export function LibraryCompletedScreen({ onNavigateToListing }: LibraryCompletedScreenProps) {
  const { isAuthenticated } = useAuth();
  const { items, isFetching } = useLibraryCompletedScreen(isAuthenticated);
  const { t } = useTranslation();

  const handleItemPress = useCallback(
    (slug: string) => {
      onNavigateToListing?.(slug);
    },
    [onNavigateToListing],
  );

  if (isFetching && items.length === 0) {
    return (
      <ScreenView center>
        <EmptyState message={t("common.loading", "Loading...")} variant="loading" />
      </ScreenView>
    );
  }

  if (items.length === 0) {
    return (
      <ScreenView center>
        <EmptyState
          message={t("library.emptyCompleted", "No completed lectures yet. Keep listening!")}
          variant="empty"
        />
      </ScreenView>
    );
  }

  return (
    <ScreenView>
      <ScrollView contentContainerStyle={styles.listContent}>
        <List>
          {items.map((item, index) => (
            <LibraryItemRow
              key={item.id}
              item={item}
              variant="completed"
              onPress={() => handleItemPress(item.listingSlug)}
              hideBorder={index === items.length - 1}
            />
          ))}
        </List>
      </ScrollView>
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
    paddingHorizontal: theme.spacing.layout.pageX,
    paddingVertical: theme.spacing.layout.pageY,
    paddingBottom: theme.spacing.scale["2xl"],
  },
}));
