import { useLibrarySavedScreen, markUnsaved } from "@sd/domain-content";
import { useCallback } from "react";
import { ScrollView } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { useAuth } from "@/core/auth/use-auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { LibraryItemRow } from "@/features/library/components/library-item-row/library-item-row";
import { LibraryItemRowSkeleton } from "@/features/library/components/library-item-row/library-item-row-skeleton";
import { EmptyState } from "@/shared/components/EmptyState/EmptyState";
import { List } from "@/shared/components/List";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";

export type LibrarySavedScreenProps = {
  onNavigateToListing?: (slug: string) => void;
};

export function LibrarySavedScreen({ onNavigateToListing }: LibrarySavedScreenProps) {
  const { isAuthenticated } = useAuth();
  const { items, isFetching } = useLibrarySavedScreen(isAuthenticated);
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

  const isLoading = isFetching && items.length === 0;

  if (isLoading) {
    return (
      <ScreenView>
        <List>
          <LibraryItemRowSkeleton count={5} />
        </List>
      </ScreenView>
    );
  }

  if (items.length === 0) {
    return (
      <ScreenView center>
        <EmptyState
          message={t(
            "library.emptySaved",
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
              onAction={() => handleRemove(item.listingId, item.listingSlug)}
            />
          ))}
        </List>
      </ScrollView>
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingVertical: 4,
  },
});
