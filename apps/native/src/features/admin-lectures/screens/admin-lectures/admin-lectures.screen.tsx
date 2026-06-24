import { useCallback, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { FlashList } from "@shopify/flash-list";
import type { AdminLectureListItemDto } from "@sd/core-contracts";
import { useAdminLectures } from "../../hooks/use-admin-lectures";
import { bulkLectureAction } from "../../api/admin-lectures.api";
import { AudioUploaderSheet } from "../../components/AudioUploaderSheet/AudioUploaderSheet";
import { LectureEditSheet } from "../../components/LectureEditSheet/LectureEditSheet";
import { BulkActionBar } from "../../components/BulkActionBar/BulkActionBar";

type LectureRowProps = {
  item: AdminLectureListItemDto;
  isSelected: boolean;
  onPress: (id: string) => void;
  onLongPress: (id: string) => void;
};

function LectureRow({ item, isSelected, onPress, onLongPress }: LectureRowProps) {
  return (
    <Pressable
      onPress={() => onPress(item.id)}
      onLongPress={() => onLongPress(item.id)}
      style={[styles.row, isSelected ? styles.rowSelected : styles.rowDefault]}
    >
      <Text numberOfLines={1} style={styles.rowTitle}>
        {item.title}
      </Text>
      <Text style={styles.rowMeta}>
        {item.scholarName} · {item.status}
      </Text>
    </Pressable>
  );
}

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

  const handleRowPress = (id: string) => {
    if (selectedIds.size > 0) {
      toggleSelect(id);
    } else {
      setEditingLectureId(id);
    }
  };

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

  const renderItem = useCallback(
    ({ item }: { item: AdminLectureListItemDto }) => (
      <LectureRow
        item={item}
        isSelected={selectedIds.has(item.id)}
        onPress={handleRowPress}
        onLongPress={toggleSelect}
      />
    ),
    [selectedIds],
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lectures</Text>
        <Pressable onPress={() => setShowUploader(true)} style={styles.uploadBtn}>
          <Text style={styles.uploadBtnText}>+ Upload</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <Text style={styles.loadingText}>Loading…</Text>
      ) : (
        <FlashList<AdminLectureListItemDto>
          data={lectures}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}

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
  header: {
    padding: theme.spacing.scale.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.content.strong,
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
  row: {
    padding: theme.spacing.scale.md,
    marginHorizontal: theme.spacing.scale.lg,
    marginBottom: theme.spacing.scale.sm,
    borderWidth: theme.border.width.default,
    borderRadius: theme.radius.scale.sm,
  },
  rowDefault: {
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.default,
  },
  rowSelected: {
    borderColor: theme.colors.action.primary,
    backgroundColor: theme.colors.surface.primarySubtle,
  },
  rowTitle: {
    fontWeight: "600",
    color: theme.colors.content.strong,
  },
  rowMeta: {
    fontSize: 12,
    color: theme.colors.content.muted,
    marginTop: theme.spacing.scale.xs,
  },
}));
