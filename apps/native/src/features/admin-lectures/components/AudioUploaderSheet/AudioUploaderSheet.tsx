import { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useScholarsList } from "@sd/domain-content";
import { getPresignedUrl, uploadToR2, createLecture } from "../../api/admin-lectures.api";

async function getNativeAudioDuration(uri: string): Promise<number | undefined> {
  try {
    const { createAudioPlayer } = await import("expo-audio");
    return new Promise((resolve) => {
      const player = createAudioPlayer({ uri });
      let resolved = false;

      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          player.remove();
          resolve(undefined);
        }
      }, 5000);

      const sub = player.addListener("playbackStatusUpdate", (status) => {
        if (!resolved && status.duration > 0) {
          resolved = true;
          clearTimeout(timeout);
          sub.remove();
          player.remove();
          resolve(Math.round(status.duration));
        }
      });
    });
  } catch {
    return undefined;
  }
}

type UploadItem = {
  name: string;
  uri: string;
  mimeType: string;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
};

type AudioUploaderSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: () => void;
};

export function AudioUploaderSheet({ isOpen, onClose, onUploadComplete }: AudioUploaderSheetProps) {
  const { data: scholarsData } = useScholarsList();
  const scholars = scholarsData?.scholars ?? [];
  const [selectedScholarId, setSelectedScholarId] = useState<string | null>(null);
  const [queue, setQueue] = useState<UploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const setItemState = (index: number, update: Partial<UploadItem>) => {
    setQueue((prev) => prev.map((item, i) => (i === index ? { ...item, ...update } : item)));
  };

  const handlePick = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["audio/mpeg", "audio/mp4", "audio/x-m4a"],
      multiple: true,
    });
    if (result.canceled) return;
    setQueue(
      result.assets.map((a) => ({
        name: a.name,
        uri: a.uri,
        mimeType: a.mimeType ?? "audio/mpeg",
        progress: 0,
        status: "pending" as const,
      })),
    );
  };

  const handleUploadAll = async () => {
    if (!selectedScholarId) return;
    setIsUploading(true);
    let anySuccess = false;
    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (item.status === "done") continue;
      try {
        setItemState(i, { progress: 0, status: "uploading" });
        const [{ uploadUrl, objectKey }, durationSeconds] = await Promise.all([
          getPresignedUrl({
            filename: item.name,
            contentType: item.mimeType,
            purpose: "audio",
          }),
          getNativeAudioDuration(item.uri),
        ]);
        await uploadToR2(uploadUrl, item.uri, item.mimeType, (p) =>
          setItemState(i, { progress: p, status: "uploading" }),
        );
        await createLecture({
          title: item.name.replace(/\.[^.]+$/, ""),
          audioKey: objectKey,
          scholarId: selectedScholarId,
          ...(durationSeconds != null ? { durationSeconds } : {}),
        });
        setItemState(i, { progress: 1, status: "done" });
        anySuccess = true;
      } catch (err) {
        setItemState(i, { status: "error", error: (err as Error).message });
      }
    }
    setIsUploading(false);
    if (anySuccess) onUploadComplete();
  };

  const isUploadDisabled = queue.length === 0 || isUploading || !selectedScholarId;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Audio</Text>

      <Text style={styles.label}>Assign to Scholar</Text>
      <FlatList
        data={scholars}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scholarList}
        keyExtractor={(scholar) => scholar.id}
        renderItem={({ item: scholar }) => {
          const isSelected = selectedScholarId === scholar.id;
          return (
            <Pressable
              onPress={() => setSelectedScholarId(scholar.id)}
              style={[styles.scholarChip, isSelected && styles.scholarChipSelected]}
            >
              <Text style={[styles.scholarChipText, isSelected && styles.scholarChipTextSelected]}>
                {scholar.name}
              </Text>
            </Pressable>
          );
        }}
      />

      <Pressable onPress={handlePick} style={styles.pickBtn}>
        <Text style={styles.pickBtnText}>Select Audio Files</Text>
      </Pressable>

      <FlatList
        data={queue}
        keyExtractor={(item) => item.name}
        style={styles.queueList}
        renderItem={({ item }) => (
          <View style={styles.queueItem}>
            <Text numberOfLines={1} style={styles.queueItemName}>
              {item.name}
            </Text>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.round(item.progress * 100)}%`,
                    backgroundColor:
                      item.status === "error"
                        ? "#dc2626"
                        : item.status === "done"
                          ? "#16a34a"
                          : "#3b82f6",
                  },
                ]}
              />
            </View>
            {item.status === "error" && <Text style={styles.queueItemError}>{item.error}</Text>}
          </View>
        )}
      />

      <View style={styles.buttonRow}>
        <Pressable
          onPress={handleUploadAll}
          disabled={isUploadDisabled}
          style={[styles.uploadBtn, isUploadDisabled && styles.uploadBtnDisabled]}
        >
          {isUploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.uploadBtnText}>Upload All</Text>
          )}
        </Pressable>
        <Pressable onPress={onClose} style={styles.cancelBtn}>
          <Text>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: "80%",
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
  scholarList: {
    marginBottom: 12,
    maxHeight: 40,
  },
  scholarChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    marginEnd: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    height: 32,
  },
  scholarChipSelected: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  scholarChipText: {
    color: "#374151",
    fontSize: 13,
    fontWeight: "400",
  },
  scholarChipTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  pickBtn: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  pickBtnText: {
    fontSize: 15,
  },
  queueList: {
    maxHeight: 200,
  },
  queueItem: {
    marginBottom: 8,
  },
  queueItemName: {
    fontSize: 13,
  },
  progressTrack: {
    height: 4,
    backgroundColor: "#e5e7eb",
    borderRadius: 2,
    marginTop: 4,
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },
  queueItemError: {
    fontSize: 12,
    color: "#dc2626",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  uploadBtn: {
    flex: 1,
    padding: 12,
    backgroundColor: "#3b82f6",
    borderRadius: 8,
    alignItems: "center",
  },
  uploadBtnDisabled: {
    backgroundColor: "#9ca3af",
  },
  uploadBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
  cancelBtn: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    alignItems: "center",
  },
});
