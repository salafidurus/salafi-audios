import { useCallback } from "react";
import { SectionList, Text, View } from "react-native";
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
  onNavigateToLecture?: (id: string) => void;
};

type Section = {
  title: string;
  data: LibraryItemDto[];
  variant: "progress" | "saved" | "completed";
  emptyMessage: string;
  isFetching: boolean;
};

export function LibraryScreen({ onNavigateToLecture }: LibraryScreenProps) {
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
    (lectureId: string) => {
      onNavigateToLecture?.(lectureId);
    },
    [onNavigateToLecture],
  );

  const renderItem = useCallback(
    ({ item, section }: { item: LibraryItemDto; section: Section }) => (
      <LibraryItemRow
        item={item}
        variant={(section as Section).variant}
        onPress={() => handleItemPress(item.lectureId)}
      />
    ),
    [handleItemPress],
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
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{section.title}</Text>
          </View>
        )}
        renderSectionFooter={({ section }) => {
          const currentSection = section as Section;

          if (currentSection.isFetching && currentSection.data.length === 0) {
            return (
              <View style={styles.sectionFooter}>
                <Text style={styles.sectionFooterLoadingText}>
                  {t("common.loading", "Loading...")}
                </Text>
              </View>
            );
          }

          if (currentSection.data.length === 0) {
            return (
              <View style={styles.sectionFooter}>
                <Text style={styles.sectionFooterEmptyText}>{currentSection.emptyMessage}</Text>
              </View>
            );
          }

          return null;
        }}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.listContent}
      />
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
