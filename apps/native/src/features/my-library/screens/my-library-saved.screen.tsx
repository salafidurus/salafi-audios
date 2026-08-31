import { useMyLibrarySavedScreen, markUnsaved } from "@sd/domain-content";
import { useCallback } from "react";
import { ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { useAuth } from "@/core/auth/use-auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { MyLibraryItemRow } from "@/features/my-library/components/my-library-item-row/my-library-item-row";
import { EmptyState } from "@/shared/components/EmptyState/EmptyState";
import { ScreenView } from "@/shared/ui";

/** Projects native library state into saved, completed, and in-progress content views. */
/** Describes the inputs, callbacks, and optional state accepted by My Library Saved Screen. */
export type MyLibrarySavedScreenProps = {
  onNavigateToListing?: (slug: string) => void;
};

/** Renders the native my library saved screen surface and coordinates its user-facing state. */
export function MyLibrarySavedScreen({ onNavigateToListing }: MyLibrarySavedScreenProps) {
  const { isAuthenticated } = useAuth();
  const { items, isFetching } = useMyLibrarySavedScreen(isAuthenticated);
  const { t } = useTranslation();

  const handleItemPress = useCallback(
    (slug: string) => {
      onNavigateToListing?.(slug);
    },
    [onNavigateToListing],
  );

  const handleRemove = useCallback((listingId: string, listingSlug: string) => {
    markUnsaved(listingId, listingSlug);
  }, []);

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
          message={t(
            "myLibrary.emptySaved",
            "No saved lectures yet. Save lectures to listen to later.",
          )}
          variant="empty"
        />
      </ScreenView>
    );
  }

  return (
    <ScreenView>
      <ScrollView contentContainerStyle={styles.listContent}>
        <View>
          {items.map((item) => (
            <MyLibraryItemRow
              key={item.id}
              item={item}
              variant="saved"
              testID={`my-library-saved-row-${item.id}`}
              onPress={() => handleItemPress(item.listingSlug)}
              actions={[
                {
                  id: "remove",
                  title: t("myLibrary.removeFromSaved", "Remove from Saved"),
                  attributes: { destructive: true },
                },
              ]}
              onAction={() => handleRemove(item.listingId, item.listingSlug)}
            />
          ))}
        </View>
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
