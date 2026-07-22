import React, { useCallback } from "react";
import { ScrollView, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { LibraryItemDto } from "@sd/core-contracts";
import {
  useLibraryCompletedScreen,
  useLibraryProgressScreen,
  useLibrarySavedScreen,
} from "@sd/domain-content";
import { useAuth } from "@/core/auth/use-auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { ScreenView } from "@/shared/components/ScreenView/ScreenView";
import { LibraryItemRow } from "@/features/library/components/library-item-row/library-item-row";

export type LibraryScreenProps = {
  onNavigateToListing?: (slug: string) => void;
};

type Section = {
  title: string;
  data: LibraryItemDto[];
  variant: "progress" | "saved" | "completed";
  emptyMessage: string;
  isFetching: boolean;
};

export function LibraryScreen({ onNavigateToListing }: LibraryScreenProps) {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const progressData = useLibraryProgressScreen(isAuthenticated);
  const savedData = useLibrarySavedScreen(isAuthenticated);
  const completedData = useLibraryCompletedScreen(isAuthenticated);

  const sections: Section[] = [
    {
      title: t("library.inProgress", "In Progress"),
      data: progressData.items,
      variant: "progress",
      emptyMessage: t("library.emptyProgress", "No lectures in progress."),
      isFetching: progressData.isFetching,
    },
    {
      title: t("library.saved", "Saved"),
      data: savedData.items,
      variant: "saved",
      emptyMessage: t(
        "library.emptySaved",
        "No saved lectures yet. Save lectures to listen to later.",
      ),
      isFetching: savedData.isFetching,
    },
    {
      title: t("library.completed", "Completed"),
      data: completedData.items,
      variant: "completed",
      emptyMessage: t("library.emptyCompleted", "No completed lectures yet. Keep listening!"),
      isFetching: completedData.isFetching,
    },
  ];

  const isAllLoading =
    progressData.isFetching &&
    savedData.isFetching &&
    completedData.isFetching &&
    progressData.items.length === 0 &&
    savedData.items.length === 0 &&
    completedData.items.length === 0;

  const handleItemPress = useCallback(
    (slug: string) => {
      onNavigateToListing?.(slug);
    },
    [onNavigateToListing],
  );

  if (isAllLoading) {
    return (
      <ScreenView center>
        <Text style={styles.loadingText}>
          {t("library.loadingSection", "Loading {{section}}…", {
            section: t("library.title", "My Library"),
          })}
        </Text>
      </ScreenView>
    );
  }

  return (
    <ScreenView>
      <ScrollView contentContainerStyle={styles.listContent}>
        {sections.map((section) => (
          <View key={section.title}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>{section.title}</Text>
            </View>

            {section.data.map((item) => (
              <LibraryItemRow
                key={item.id}
                item={item}
                variant={section.variant}
                onPress={() => handleItemPress(item.listingSlug)}
              />
            ))}

            {section.isFetching && section.data.length === 0 ? (
              <View style={styles.sectionFooter}>
                <Text style={styles.sectionFooterLoadingText}>
                  {t("common.loading", "Loading...")}
                </Text>
              </View>
            ) : section.data.length === 0 ? (
              <View style={styles.sectionFooter}>
                <Text style={styles.sectionFooterEmptyText}>{section.emptyMessage}</Text>
              </View>
            ) : null}
          </View>
        ))}
      </ScrollView>
    </ScreenView>
  );
}

const styles = StyleSheet.create((theme) => ({
  loadingText: {
    color: theme.colors.content.default,
  },
  listContent: {
    paddingBottom: theme.spacing.scale["2xl"],
  },
  sectionHeader: {
    backgroundColor: theme.colors.surface.canvas,
    paddingVertical: theme.spacing.scale.sm,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.content.strong,
  },
  sectionFooter: {
    paddingVertical: theme.spacing.scale.md,
  },
  sectionFooterLoadingText: {
    color: theme.colors.content.muted,
  },
  sectionFooterEmptyText: {
    color: theme.colors.content.muted,
  },
}));
