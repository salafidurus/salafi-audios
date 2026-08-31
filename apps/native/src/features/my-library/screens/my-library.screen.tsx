import { useProgressStore } from "@sd/domain-audio";
import { useMyLibraryProgressScreen } from "@sd/domain-content";
import React, { useCallback } from "react";
import { ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { MyLibraryItemRow } from "@/features/my-library/components/my-library-item-row/my-library-item-row";
import { EmptyState } from "@/shared/components/EmptyState/EmptyState";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";

import { useAuth } from "../../../core/auth/use-auth";
import { useTranslation } from "../../../core/i18n/use-translation";

/** Projects native library state into saved, completed, and in-progress content views. */
/** Describes the inputs, callbacks, and optional state accepted by My Library Screen. */
export type MyLibraryScreenProps = {
  onNavigateToListing?: (slug: string) => void;
};

/** Renders the native my library screen surface and coordinates its user-facing state. */
export function MyLibraryScreen({ onNavigateToListing }: MyLibraryScreenProps) {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const { items, isFetching } = useMyLibraryProgressScreen(isAuthenticated);
  const markCompleted = useProgressStore((s) => s.actions.markCompleted);

  const handleItemPress = useCallback(
    (slug: string) => {
      onNavigateToListing?.(slug);
    },
    [onNavigateToListing],
  );

  if (isFetching && items.length === 0) {
    return (
      <ScreenView center>
        <EmptyState
          message={t("myLibrary.loadingSection", "Loading {{section}}…", {
            section: t("myLibrary.inProgress", "In Progress"),
          })}
          variant="loading"
        />
      </ScreenView>
    );
  }

  if (items.length === 0) {
    return (
      <ScreenView center>
        <EmptyState
          message={t("myLibrary.emptyProgress", "No lectures in progress.")}
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
              variant="progress"
              testID={`my-library-progress-row-${item.id}`}
              onPress={() => handleItemPress(item.listingSlug)}
              actions={[
                { id: "complete", title: t("myLibrary.markAsCompleted", "Mark as Completed") },
              ]}
              onAction={() => markCompleted(item.listingId)}
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
  emptyContainer: {
    padding: theme.spacing.scale.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: theme.spacing.layout.pageX,
    paddingVertical: theme.spacing.layout.pageY,
    paddingBottom: theme.spacing.scale["2xl"],
  },
}));
