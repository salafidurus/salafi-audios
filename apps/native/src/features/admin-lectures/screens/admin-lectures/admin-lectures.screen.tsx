import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import type { AdminLectureListItemDto } from "@sd/core-contracts";
import { useAdminLectures } from "../../hooks/use-admin-lectures";
import { bulkLectureAction } from "../../api/admin-lectures.api";
import { AudioUploaderSheet } from "../../components/AudioUploaderSheet/AudioUploaderSheet";
import { LectureEditSheet } from "../../components/LectureEditSheet/LectureEditSheet";
import { BulkActionBar } from "../../components/BulkActionBar/BulkActionBar";

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

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          padding: 16,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "700" }}>Lectures</Text>
        <Pressable
          onPress={() => setShowUploader(true)}
          style={{ padding: 10, backgroundColor: "#3b82f6", borderRadius: 8 }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>+ Upload</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <Text style={{ textAlign: "center", marginTop: 32 }}>Loading…</Text>
      ) : (
        <FlashList<AdminLectureListItemDto>
          data={lectures}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isSelected = selectedIds.has(item.id);
            return (
              <Pressable
                onPress={() => handleRowPress(item.id)}
                onLongPress={() => toggleSelect(item.id)}
                style={{
                  padding: 12,
                  marginHorizontal: 16,
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor: isSelected ? "#3b82f6" : "#e5e5e5",
                  borderRadius: 8,
                  backgroundColor: isSelected ? "#eff6ff" : "#fff",
                }}
              >
                <Text numberOfLines={1} style={{ fontWeight: "600" }}>
                  {item.title}
                </Text>
                <Text style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
                  {item.scholarName} · {item.status}
                </Text>
              </Pressable>
            );
          }}
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
