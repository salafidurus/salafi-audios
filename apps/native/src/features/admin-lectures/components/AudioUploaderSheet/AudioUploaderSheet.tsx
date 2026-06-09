import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
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
        const { uploadUrl, objectKey } = await getPresignedUrl({
          filename: item.name,
          contentType: item.mimeType,
          purpose: "audio",
        });
        await uploadToR2(uploadUrl, item.uri, item.mimeType, (p) =>
          setItemState(i, { progress: p, status: "uploading" }),
        );
        const durationSeconds = await getNativeAudioDuration(item.uri);
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
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 16,
        maxHeight: "80%",
      }}
    >
      <Text style={{ fontSize: 17, fontWeight: "600", marginBottom: 12 }}>Upload Audio</Text>

      <Text style={{ fontSize: 13, fontWeight: "600", marginBottom: 6 }}>Assign to Scholar</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 12, maxHeight: 40 }}
      >
        {scholars.map((scholar) => {
          const isSelected = selectedScholarId === scholar.id;
          return (
            <Pressable
              key={scholar.id}
              onPress={() => setSelectedScholarId(scholar.id)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
                backgroundColor: isSelected ? "#3b82f6" : "#f3f4f6",
                marginRight: 8,
                borderWidth: 1,
                borderColor: isSelected ? "#3b82f6" : "#e5e7eb",
                height: 32,
              }}
            >
              <Text
                style={{
                  color: isSelected ? "#fff" : "#374151",
                  fontSize: 13,
                  fontWeight: isSelected ? "600" : "400",
                }}
              >
                {scholar.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Pressable
        onPress={handlePick}
        style={{
          padding: 12,
          borderWidth: 1,
          borderColor: "#d1d5db",
          borderRadius: 8,
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <Text style={{ fontSize: 15 }}>Select Audio Files</Text>
      </Pressable>

      <ScrollView style={{ maxHeight: 200 }}>
        {queue.map((item, i) => (
          <View key={i} style={{ marginBottom: 8 }}>
            <Text numberOfLines={1} style={{ fontSize: 13 }}>
              {item.name}
            </Text>
            <View style={{ height: 4, backgroundColor: "#e5e7eb", borderRadius: 2, marginTop: 4 }}>
              <View
                style={{
                  height: 4,
                  width: `${Math.round(item.progress * 100)}%`,
                  backgroundColor:
                    item.status === "error"
                      ? "#dc2626"
                      : item.status === "done"
                        ? "#16a34a"
                        : "#3b82f6",
                  borderRadius: 2,
                }}
              />
            </View>
            {item.status === "error" && (
              <Text style={{ fontSize: 11, color: "#dc2626" }}>{item.error}</Text>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
        <Pressable
          onPress={handleUploadAll}
          disabled={isUploadDisabled}
          style={{
            flex: 1,
            padding: 12,
            backgroundColor: isUploadDisabled ? "#9ca3af" : "#3b82f6",
            borderRadius: 8,
            alignItems: "center",
          }}
        >
          {isUploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontWeight: "600" }}>Upload All</Text>
          )}
        </Pressable>
        <Pressable
          onPress={onClose}
          style={{
            padding: 12,
            borderWidth: 1,
            borderColor: "#d1d5db",
            borderRadius: 8,
            alignItems: "center",
          }}
        >
          <Text>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}
