import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import * as DocumentPicker from "expo-document-picker";
import type { ScholarListItemDto } from "@sd/core-contracts";
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

type ScholarChipProps = {
  scholar: ScholarListItemDto;
  isSelected: boolean;
  onPress: (id: string) => void;
};

function ScholarChip({ scholar, isSelected, onPress }: ScholarChipProps) {
  return (
    <Pressable
      onPress={() => onPress(scholar.id)}
      style={[styles.scholarChip, isSelected && styles.scholarChipSelected]}
    >
      <Text style={[styles.scholarChipText, isSelected && styles.scholarChipTextSelected]}>
        {scholar.name}
      </Text>
    </Pressable>
  );
}

type QueueItemProps = {
  item: UploadItem;
};

function QueueItem({ item }: QueueItemProps) {
  const { theme } = useUnistyles();
  const fillStyle = useMemo(
    () => [
      styles.progressFill,
      {
        width: `${Math.round(item.progress * 100)}%` as unknown as number,
        backgroundColor:
          item.status === "error"
            ? theme.colors.state.danger
            : item.status === "done"
              ? theme.colors.state.success
              : theme.colors.action.primary,
      },
    ],
    [item.progress, item.status, theme],
  );

  return (
    <View style={styles.queueItem}>
      <Text numberOfLines={1} style={styles.queueItemName}>
        {item.name}
      </Text>
      <View style={styles.progressTrack}>
        <View style={fillStyle} />
      </View>
      {item.status === "error" && <Text style={styles.queueItemError}>{item.error}</Text>}
    </View>
  );
}

export function AudioUploaderSheet({ isOpen, onClose, onUploadComplete }: AudioUploaderSheetProps) {
  const { theme } = useUnistyles();
  const { data: scholarsData } = useScholarsList();
  const scholars = scholarsData?.scholars ?? [];
  const [selectedScholarId, setSelectedScholarId] = useState<string | null>(null);
  const [queue, setQueue] = useState<UploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const setItemState = useCallback((index: number, update: Partial<UploadItem>) => {
    setQueue((prev) => prev.map((item, i) => (i === index ? { ...item, ...update } : item)));
  }, []);

  const handlePick = useCallback(async () => {
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
  }, []);

  const handleUploadAll = useCallback(async () => {
    if (!selectedScholarId) return;
    setIsUploading(true);
    let anySuccess = false;
    for (let i = 0; i < queue.length; i++) {
      const item = queue[i]!;
      if (item.status === "done") continue;
      try {
        setItemState(i, { progress: 0, status: "uploading" });
        // react-doctor-disable-next-line react-doctor/async-await-in-loop, react-doctor/async-parallel
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
  }, [selectedScholarId, queue, setItemState, onUploadComplete]);

  const isUploadDisabled = queue.length === 0 || isUploading || !selectedScholarId;

  const renderScholarItem = useCallback(
    ({ item: scholar }: { item: ScholarListItemDto }) => (
      <ScholarChip
        scholar={scholar}
        isSelected={selectedScholarId === scholar.id}
        onPress={setSelectedScholarId}
      />
    ),
    [selectedScholarId],
  );

  const renderQueueItem = useCallback(
    ({ item }: { item: UploadItem }) => <QueueItem item={item} />,
    [],
  );

  if (!isOpen) return null;

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
        renderItem={renderScholarItem}
      />

      <Pressable onPress={handlePick} style={styles.pickBtn}>
        <Text style={styles.pickBtnText}>Select Audio Files</Text>
      </Pressable>

      <FlatList
        data={queue}
        keyExtractor={(item) => item.name}
        style={styles.queueList}
        renderItem={renderQueueItem}
      />

      <View style={styles.buttonRow}>
        <Pressable
          onPress={handleUploadAll}
          disabled={isUploadDisabled}
          style={[styles.uploadBtn, isUploadDisabled && styles.uploadBtnDisabled]}
        >
          {isUploading ? (
            <ActivityIndicator color={theme.colors.content.onPrimary} />
          ) : (
            <Text style={styles.uploadBtnText}>Upload All</Text>
          )}
        </Pressable>
        <Pressable onPress={onClose} style={styles.cancelBtn}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface.elevated,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: "80%",
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 12,
    color: theme.colors.content.strong,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    color: theme.colors.content.default,
  },
  scholarList: {
    marginBottom: 12,
    maxHeight: 40,
  },
  scholarChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: theme.colors.surface.subtle,
    marginEnd: 8,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    height: 32,
  },
  scholarChipSelected: {
    backgroundColor: theme.colors.action.primary,
    borderColor: theme.colors.action.primary,
  },
  scholarChipText: {
    color: theme.colors.content.default,
    fontSize: 13,
    fontWeight: "400",
  },
  scholarChipTextSelected: {
    color: theme.colors.content.onPrimary,
    fontWeight: "600",
  },
  pickBtn: {
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  pickBtnText: {
    fontSize: 15,
    color: theme.colors.content.default,
  },
  queueList: {
    maxHeight: 200,
  },
  queueItem: {
    marginBottom: 8,
  },
  queueItemName: {
    fontSize: 13,
    color: theme.colors.content.default,
  },
  progressTrack: {
    height: 4,
    backgroundColor: theme.colors.surface.subtle,
    borderRadius: 2,
    marginTop: 4,
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },
  queueItemError: {
    fontSize: 12,
    color: theme.colors.state.danger,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  uploadBtn: {
    flex: 1,
    padding: 12,
    backgroundColor: theme.colors.action.primary,
    borderRadius: 8,
    alignItems: "center",
  },
  uploadBtnDisabled: {
    backgroundColor: theme.colors.content.disabled,
  },
  uploadBtnText: {
    color: theme.colors.content.onPrimary,
    fontWeight: "600",
  },
  cancelBtn: {
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelBtnText: {
    color: theme.colors.content.default,
  },
}));
