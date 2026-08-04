import { useProgressStore } from "@sd/domain-audio";
import { useLibraryProgressScreen } from "@sd/domain-content";
import React, { useCallback } from "react";
import { ScrollView } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { LibraryItemRow } from "@/features/library/components/library-item-row/library-item-row";
import { EmptyState } from "@/shared/components/EmptyState/EmptyState";
import { List } from "@/shared/components/List";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { NativeScreenHost } from "@/shared/ui";

import { useAuth } from "../../../core/auth/use-auth";
import { useTranslation } from "../../../core/i18n/use-translation";

export type LibraryScreenProps = {
  onNavigateToListing?: (slug: string) => void;
};

export function LibraryScreen({ onNavigateToListing }: LibraryScreenProps) {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const { items, isFetching } = useLibraryProgressScreen(isAuthenticated);
  const markCompleted = useProgressStore((s) => s.actions.markCompleted);

  const handleItemPress = useCallback(
    (slug: string) => {
      onNavigateToListing?.(slug);
    },
    [onNavigateToListing],
  );

  if (isFetching && items.length === 0) {
    return (
      <NativeScreenHost testID="library-screen-host">
        <ScreenView center>
          <EmptyState
            message={t("library.loadingSection", "Loading {{section}}…", {
              section: t("library.inProgress", "In Progress"),
            })}
            variant="loading"
          />
        </ScreenView>
      </NativeScreenHost>
    );
  }

  if (items.length === 0) {
    return (
      <NativeScreenHost testID="library-screen-host">
        <ScreenView center>
          <EmptyState
            message={t("library.emptyProgress", "No lectures in progress.")}
            variant="empty"
          />
        </ScreenView>
      </NativeScreenHost>
    );
  }

  return (
    <NativeScreenHost testID="library-screen-host">
      <ScrollView contentContainerStyle={styles.listContent}>
        <List>
          {items.map((item, index) => (
            <LibraryItemRow
              key={item.id}
              item={item}
              variant="progress"
              testID={`library-progress-row-${item.id}`}
              onPress={() => handleItemPress(item.listingSlug)}
              hideBorder={index === items.length - 1}
              actions={[
                { id: "complete", title: t("library.markAsCompleted", "Mark as Completed") },
              ]}
              onAction={() => markCompleted(item.listingId)}
            />
          ))}
        </List>
      </ScrollView>
    </NativeScreenHost>
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
