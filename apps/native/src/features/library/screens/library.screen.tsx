import { useCallback } from "react";
import { SectionList, Text, Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import type { LibraryItemDto } from "@sd/core-contracts";
import { pickContentField } from "@sd/core-i18n";
import {
  useLibraryCompletedScreen,
  useLibraryProgressScreen,
  useLibrarySavedScreen,
} from "@sd/domain-content";
import { useAuth } from "@/core/auth/use-auth";
import { useShowOriginalContent } from "@/features/i18n/content-preference";
import { useTranslation } from "@/core/i18n/use-translation";

export type LibraryScreenProps = {
  onNavigateToLecture?: (id: string) => void;
};

function ProgressBar({ percent }: { percent: number }) {
  return (
    <View style={styles.progressTrack}>
      <View
        style={[styles.progressFill, { width: `${Math.min(percent, 100)}%` as unknown as number }]}
      />
    </View>
  );
}

function LibraryItem({
  item,
  onPress,
  variant,
}: {
  item: LibraryItemDto;
  onPress?: () => void;
  variant: "progress" | "saved" | "completed";
}) {
  const progress =
    item.durationSeconds && item.progressSeconds
      ? Math.round((item.progressSeconds / item.durationSeconds) * 100)
      : null;
  const showOriginal = useShowOriginalContent();
  const { t } = useTranslation();
  const lectureTitle = pickContentField(item.lectureTitle, item.originalLectureTitle, showOriginal);

  return (
    <Pressable onPress={onPress} style={styles.item}>
      <View style={styles.itemRow}>
        {variant === "completed" ? <Text style={styles.checkmark}>✓</Text> : null}
        <Text style={styles.itemTitle}>{lectureTitle}</Text>
      </View>
      <Text style={styles.itemSubtitle}>
        {item.scholarName}
        {item.seriesTitle ? ` · ${item.seriesTitle}` : ""}
      </Text>
      <Text style={styles.itemMeta}>
        {item.durationSeconds
          ? t("lecture.minutes", "{{count}} min", { count: Math.round(item.durationSeconds / 60) })
          : ""}
        {variant === "progress" && progress !== null
          ? ` · ${t("library.percentListened", "{{percent}}% listened", { percent: progress })}`
          : ""}
        {variant === "saved" && item.savedAt
          ? ` · ${t("library.savedOn", "Saved {{date}}", {
              date: new Date(item.savedAt).toLocaleDateString(),
            })}`
          : ""}
        {variant === "completed" && item.completedAt
          ? ` · ${t("library.completedOn", "Completed {{date}}", {
              date: new Date(item.completedAt).toLocaleDateString(),
            })}`
          : ""}
      </Text>
      {variant === "progress" && progress !== null ? <ProgressBar percent={progress} /> : null}
    </Pressable>
  );
}

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
      <LibraryItem
        item={item}
        variant={(section as Section).variant}
        onPress={() => handleItemPress(item.lectureId)}
      />
    ),
    [handleItemPress],
  );

  if (isAllLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          {t("library.loadingSection", "Loading {{section}}…", {
            section: t("library.title", "My Library"),
          })}
        </Text>
      </View>
    );
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      // react-doctor-disable-next-line react-doctor/no-render-prop-children
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
  );
}

const styles = StyleSheet.create((theme) => ({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: theme.colors.content.default,
  },
  listContent: {
    paddingBottom: theme.spacing.scale["2xl"],
  },
  item: {
    padding: theme.spacing.scale.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subtle,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  checkmark: {
    color: theme.colors.state.success,
    fontSize: 12,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.content.strong,
  },
  itemSubtitle: {
    fontSize: 12,
    color: theme.colors.content.muted,
    marginTop: 2,
  },
  itemMeta: {
    fontSize: 12,
    color: theme.colors.content.muted,
    marginTop: 2,
  },
  progressTrack: {
    height: 3,
    backgroundColor: theme.colors.surface.subtle,
    borderRadius: 2,
    marginTop: theme.spacing.scale.xs,
  },
  progressFill: {
    height: "100%",
    backgroundColor: theme.colors.action.primary,
    borderRadius: 2,
  },
  sectionHeader: {
    backgroundColor: theme.colors.surface.canvas,
    paddingHorizontal: theme.spacing.scale.md,
    paddingVertical: theme.spacing.scale.sm,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.content.strong,
  },
  sectionFooter: {
    padding: theme.spacing.scale.md,
  },
  sectionFooterLoadingText: {
    color: theme.colors.content.muted,
  },
  sectionFooterEmptyText: {
    color: theme.colors.content.muted,
  },
}));
