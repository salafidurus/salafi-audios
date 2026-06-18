import { useCallback } from "react";
import { SectionList, StyleSheet, Text, Pressable, View } from "react-native";
import type { LibraryItemDto } from "@sd/core-contracts";
import { pickContentField } from "@sd/core-i18n";
import {
  useLibraryCompletedScreen,
  useLibraryProgressScreen,
  useLibrarySavedScreen,
} from "@sd/domain-content";
import { useAuth } from "@/core/auth/use-auth";
import { useShowOriginalContent } from "@/features/i18n/content-preference";

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
        {item.durationSeconds ? `${Math.round(item.durationSeconds / 60)} min` : ""}
        {variant === "progress" && progress !== null ? ` · ${progress}% listened` : ""}
        {variant === "saved" && item.savedAt
          ? ` · Saved ${new Date(item.savedAt).toLocaleDateString()}`
          : ""}
        {variant === "completed" && item.completedAt
          ? ` · ${new Date(item.completedAt).toLocaleDateString()}`
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
  const progressData = useLibraryProgressScreen(isAuthenticated);
  const savedData = useLibrarySavedScreen(isAuthenticated);
  const completedData = useLibraryCompletedScreen(isAuthenticated);

  const sections: Section[] = [
    {
      title: "In Progress",
      data: progressData.items,
      variant: "progress",
      emptyMessage: "No lectures in progress.",
      isFetching: progressData.isFetching,
    },
    {
      title: "Saved",
      data: savedData.items,
      variant: "saved",
      emptyMessage: "No saved lectures yet.",
      isFetching: savedData.isFetching,
    },
    {
      title: "Completed",
      data: completedData.items,
      variant: "completed",
      emptyMessage: "No completed lectures yet.",
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
        <Text>Loading your library…</Text>
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
              <Text style={styles.sectionFooterLoadingText}>Loading…</Text>
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
      contentContainerStyle={{ paddingBottom: 24 }}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  checkmark: {
    color: "#16a34a",
    fontSize: 12,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  itemSubtitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  itemMeta: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  progressTrack: {
    height: 3,
    backgroundColor: "#e5e7eb",
    borderRadius: 2,
    marginTop: 4,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#2563eb",
    borderRadius: 2,
  },
  sectionHeader: {
    backgroundColor: "#f9fafb",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: "700",
  },
  sectionFooter: {
    padding: 12,
  },
  sectionFooterLoadingText: {
    color: "#999",
  },
  sectionFooterEmptyText: {
    color: "#666",
  },
});
