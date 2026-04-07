import { View, Text, TouchableOpacity, FlatList, SectionList } from "react-native";
import type { LibraryItemDto } from "@sd/core-contracts";
import { useLibrarySavedScreen } from "../hooks/use-library-saved";
import { useLibraryProgressScreen } from "../hooks/use-library-progress";
import { useLibraryCompletedScreen } from "../hooks/use-library-completed";

export type LibraryMobileNativeScreenProps = {
  onNavigateToLecture?: (id: string) => void;
};

function ProgressBar({ percent }: { percent: number }) {
  return (
    <View style={{ height: 3, backgroundColor: "#e5e7eb", borderRadius: 2, marginTop: 4 }}>
      <View
        style={{
          height: "100%",
          width: `${Math.min(percent, 100)}%`,
          backgroundColor: "#2563eb",
          borderRadius: 2,
        }}
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

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: "#eee" }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        {variant === "completed" && <Text style={{ color: "#16a34a", fontSize: 12 }}>✓</Text>}
        <Text style={{ fontSize: 15, fontWeight: "600" }}>{item.lectureTitle}</Text>
      </View>
      <Text style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
        {item.scholarName}
        {item.seriesTitle ? ` · ${item.seriesTitle}` : ""}
      </Text>
      <Text style={{ fontSize: 11, color: "#999", marginTop: 2 }}>
        {item.durationSeconds ? `${Math.round(item.durationSeconds / 60)} min` : ""}
        {variant === "progress" && progress !== null ? ` · ${progress}% listened` : ""}
        {variant === "saved" && item.savedAt
          ? ` · Saved ${new Date(item.savedAt).toLocaleDateString()}`
          : ""}
        {variant === "completed" && item.completedAt
          ? ` · ${new Date(item.completedAt).toLocaleDateString()}`
          : ""}
      </Text>
      {variant === "progress" && progress !== null && <ProgressBar percent={progress} />}
    </TouchableOpacity>
  );
}

type Section = {
  title: string;
  data: LibraryItemDto[];
  variant: "progress" | "saved" | "completed";
  emptyMessage: string;
  isFetching: boolean;
};

export function LibraryMobileNativeScreen({ onNavigateToLecture }: LibraryMobileNativeScreenProps) {
  const progressData = useLibraryProgressScreen();
  const savedData = useLibrarySavedScreen();
  const completedData = useLibraryCompletedScreen();

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

  if (isAllLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading your library...</Text>
      </View>
    );
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={({ item, section }) => (
        <LibraryItem
          item={item}
          variant={(section as Section).variant}
          onPress={() => onNavigateToLecture?.(item.lectureId)}
        />
      )}
      renderSectionHeader={({ section }) => (
        <View style={{ backgroundColor: "#f9fafb", paddingHorizontal: 12, paddingVertical: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: "700" }}>{section.title}</Text>
        </View>
      )}
      renderSectionFooter={({ section }) => {
        const s = section as Section;
        if (s.isFetching && s.data.length === 0) {
          return (
            <View style={{ padding: 12 }}>
              <Text style={{ color: "#999" }}>Loading...</Text>
            </View>
          );
        }
        if (s.data.length === 0) {
          return (
            <View style={{ padding: 12 }}>
              <Text style={{ color: "#666" }}>{s.emptyMessage}</Text>
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
