import { useMyLibraryCompletedScreen } from "@sd/domain-content";
import { useCallback } from "react";
import { ScrollView } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { useAuth } from "@/core/auth/use-auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { MyLibraryItemRow } from "@/features/my-library/components/my-library-item-row/my-library-item-row";
import { EmptyState } from "@/shared/components/EmptyState/EmptyState";
import { List } from "@/shared/components/List";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";

export type MyLibraryCompletedScreenProps = {
  onNavigateToListing?: (slug: string) => void;
};

export function MyLibraryCompletedScreen({ onNavigateToListing }: MyLibraryCompletedScreenProps) {
  const { isAuthenticated } = useAuth();
  const { items, isFetching } = useMyLibraryCompletedScreen(isAuthenticated);
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
          message={t("myLibrary.emptyCompleted", "No completed lectures yet. Keep listening!")}
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
            <MyLibraryItemRow
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
