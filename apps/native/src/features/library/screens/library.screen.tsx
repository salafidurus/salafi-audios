import { useProgressStore } from "@sd/domain-audio";
import { useLibraryProgressScreen } from "@sd/domain-content";
import React, { useCallback } from "react";
import { ScrollView, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { LibraryItemRow } from "@/features/library/components/library-item-row/library-item-row";
import { List } from "@/shared/components/List";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";

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
      <ScreenView center>
        <Text style={styles.loadingText}>
          {t("library.loadingSection", "Loading {{section}}…", {
            section: t("library.inProgress", "In Progress"),
          })}
        </Text>
      </ScreenView>
    );
  }

  return (
    <ScreenView>
      <ScrollView contentContainerStyle={styles.listContent}>
        <List>
          {items.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {t("library.emptyProgress", "No lectures in progress.")}
              </Text>
            </View>
          ) : (
            items.map((item, index) => (
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
            ))
          )}
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
