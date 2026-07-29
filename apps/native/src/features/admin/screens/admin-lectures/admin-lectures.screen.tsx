import { useCallback, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { AppText } from "@/shared/components/AppText/AppText";
import { List } from "@/shared/components/List";

import { bulkLectureAction } from "../../api/admin-lectures.api";
import { AudioUploaderSheet } from "../../components/AudioUploaderSheet/AudioUploaderSheet";
import { BulkActionBar } from "../../components/BulkActionBar/BulkActionBar";
import { LectureEditSheet } from "../../components/LectureEditSheet/LectureEditSheet";
import { useAdminLectures } from "../../hooks/use-admin-lectures";

export function AdminLecturesScreen() {
  const { data, isLoading, refetch } = useAdminLectures();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [editingLectureId, setEditingLectureId] = useState<string | null>(null);
  const lectures = data?.items ?? [];

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleRowPress = useCallback(
    (id: string) => {
      if (selectedIds.size > 0) {
        toggleSelect(id);
      } else {
        setEditingLectureId(id);
      }
    },
    [selectedIds],
  );

  const handleBulkAction = async (action: "publish" | "archive") => {
    setIsBulkLoading(true);
    try {
      await bulkLectureAction({ action, ids: Array.from(selectedIds) });
    } catch {
      // Ignored for UX robustness
    }
    setSelectedIds(new Set());
    setIsBulkLoading(false);
    refetch();
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <AppText variant="titleLg">Lectures</AppText>
          <Pressable onPress={() => setShowUploader(true)} style={styles.uploadBtn}>
            <AppText variant="labelMd" style={styles.uploadBtnText}>
              + Upload
            </AppText>
          </Pressable>
        </View>

        {isLoading ? (
          <AppText variant="bodyMd" style={styles.loadingText}>
            Loading…
          </AppText>
        ) : (
          <List>
            {lectures.map((item, index) => {
              const isSelected = selectedIds.has(item.id);
              return (
                <List.Item
                  key={item.id}
                  onPress={() => handleRowPress(item.id)}
                  hideBorder={index === lectures.length - 1}
                  style={isSelected ? styles.rowSelected : undefined}
                >
                  <View style={styles.rowContent}>
                    <AppText numberOfLines={1} variant="bodyMd" style={styles.rowTitle}>
                      {item.title}
                    </AppText>
                    <AppText variant="caption" style={styles.rowMeta}>
                      {item.scholarName} · {item.status}
                    </AppText>
                  </View>
                </List.Item>
              );
            })}
          </List>
        )}
      </ScrollView>

      <BulkActionBar
        selectedCount={selectedIds.size}
        onPublish={() => handleBulkAction("publish")}
        onArchive={() => handleBulkAction("archive")}
        isLoading={isBulkLoading}
      />

      <AudioUploaderSheet
        isOpen={showUploader}
        onClose={() => setShowUploader(false)}
        onUploadComplete={() => {
          setShowUploader(false);
          refetch();
        }}
      />

      <LectureEditSheet
        lectureId={editingLectureId}
        onClose={() => setEditingLectureId(null)}
        onSaved={() => {
          setEditingLectureId(null);
          refetch();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  screen: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.scale.md,
    paddingBottom: 80,
  },
  header: {
    paddingVertical: theme.spacing.scale.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  uploadBtn: {
    paddingVertical: theme.spacing.scale.sm,
    paddingHorizontal: theme.spacing.scale.md,
    backgroundColor: theme.colors.action.primary,
    borderRadius: theme.radius.scale.sm,
  },
  uploadBtnText: {
    color: theme.colors.content.onPrimary,
    fontWeight: "600",
  },
  loadingText: {
    textAlign: "center",
    marginTop: theme.spacing.scale["3xl"],
    color: theme.colors.content.muted,
  },
  rowContent: {
    gap: theme.spacing.scale.xs,
  },
  rowSelected: {
    backgroundColor: theme.colors.surface.primarySubtle,
  },
  rowTitle: {
    fontWeight: "600",
    color: theme.colors.content.strong,
  },
  rowMeta: {
    color: theme.colors.content.muted,
  },
}));
