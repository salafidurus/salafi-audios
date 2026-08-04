import { Column, ScrollView } from "@expo/ui";
import { useLibrarySavedScreen, markUnsaved } from "@sd/domain-content";
import { useCallback } from "react";
import { useUnistyles } from "react-native-unistyles";

import { useAuth } from "@/core/auth/use-auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { LibraryItemRow } from "@/features/library/components/library-item-row/library-item-row";
import { EmptyState } from "@/shared/components/EmptyState/EmptyState";
import { List } from "@/shared/components/List";
import { NativeScreenHost } from "@/shared/ui";

export type LibrarySavedScreenProps = {
  onNavigateToListing?: (slug: string) => void;
};

export function LibrarySavedScreen({ onNavigateToListing }: LibrarySavedScreenProps) {
  const { isAuthenticated } = useAuth();
  const { items, isFetching } = useLibrarySavedScreen(isAuthenticated);
  const { t } = useTranslation();
  const { theme } = useUnistyles();

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
      <NativeScreenHost style={{ justifyContent: "center", alignItems: "center" }}>
        <EmptyState message={t("common.loading", "Loading...")} variant="loading" />
      </NativeScreenHost>
    );
  }

  if (items.length === 0) {
    return (
      <NativeScreenHost style={{ justifyContent: "center", alignItems: "center" }}>
        <EmptyState
          message={t(
            "library.emptySaved",
            "No saved lectures yet. Save lectures to listen to later.",
          )}
          variant="empty"
        />
      </NativeScreenHost>
    );
  }

  return (
    <NativeScreenHost testID="library-saved-screen-host">
      <ScrollView showsIndicators={false}>
        <Column
          style={{
            paddingHorizontal: theme.spacing.layout.pageX,
            paddingVertical: theme.spacing.layout.pageY,
            paddingBottom: theme.spacing.scale["2xl"],
          }}
        >
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
        </Column>
      </ScrollView>
    </NativeScreenHost>
  );
}
