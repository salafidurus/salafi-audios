import { useProgressStore } from "@sd/domain-audio";
import { useLibrarySavedScreen } from "@sd/domain-content";
import { useCallback } from "react";
import { Text, ScrollView } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { useAuth } from "@/core/auth/use-auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { LibraryItemRow } from "@/features/library/components/library-item-row/library-item-row";
import { List } from "@/shared/components/List";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";

export type LibrarySavedScreenProps = {
  onNavigateToListing?: (slug: string) => void;
};

export function LibrarySavedScreen({ onNavigateToListing }: LibrarySavedScreenProps) {
  const { isAuthenticated } = useAuth();
  const { items, isFetching } = useLibrarySavedScreen(isAuthenticated);
  const removeSaved = useProgressStore((s) => s.actions.removeSaved);
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
      <ScrollView contentContainerStyle={styles.listContent}>
        <List>
          {items.map((item, index) => (
            <LibraryItemRow
              key={item.id}
              item={item}
              variant="saved"
              testID={`library-saved-row-${item.id}`}
              onPress={() => handleItemPress(item.listingSlug)}
              hideBorder={index === items.length - 1}
              actions={[
                {
                  id: "remove",
                  title: t("library.removeFromSaved", "Remove from Saved"),
                  attributes: { destructive: true },
                },
              ]}
              onAction={() => removeSaved(item.listingId)}
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
