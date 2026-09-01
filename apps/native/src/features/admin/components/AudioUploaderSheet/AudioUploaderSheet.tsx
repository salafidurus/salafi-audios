import type { ScholarListItemDto } from "@sd/core-contracts";

import { subject } from "@casl/ability";
import { useAbility } from "@sd/domain-account";
import { useScholarsList } from "@sd/domain-content";
import * as DocumentPicker from "expo-document-picker";
import { useCallback, useMemo, useState } from "react";
import { FlatList, type ViewStyle, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { useAuth } from "@/core/auth/use-auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { AppText, Button } from "@/shared/ui";

import { getPresignedUrl, uploadToR2, createListing } from "../../api/admin-listings.api";

/** Provides authenticated native administration workflows and their data boundaries. */
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
  /** Records the lifecycle state used to decide which transition or UI state is valid. */
  status: "pending" | "uploading" | "done" | "error";
  /** Stores the user-facing or diagnostic failure associated with the current operation. */
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
    <Button
      label={scholar.name}
      onPress={() => onPress(scholar.id)}
      variant={isSelected ? "primary" : "outline"}
      size="sm"
      style={styles.scholarChip}
    />
  );
}

type QueueItemProps = {
  item: UploadItem;
};

function getErrorMessage(cause: unknown): string {
  return cause instanceof Error ? cause.message : "Upload failed";
}

function getProgressFillWidth(progress: number): ViewStyle["width"] {
  return `${Math.round(progress * 100)}%`;
}

function QueueItem({ item }: QueueItemProps) {
  const { theme } = useUnistyles();
  const fillStyle = useMemo(
    () => [
      styles.progressFill,
      {
        width: getProgressFillWidth(item.progress),
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
      <AppText variant="bodySm" numberOfLines={1} style={styles.queueItemName}>
        {item.name}
      </AppText>
      <View style={styles.progressTrack}>
        <View style={fillStyle} />
      </View>
      {item.status === "error" && (
        <AppText variant="bodySm" style={styles.queueItemError}>
          {item.error}
        </AppText>
      )}
    </View>
  );
}

async function uploadSingleItem(
  item: UploadItem,
  index: number,
  scholarId: string,
  setItemState: (index: number, update: Partial<UploadItem>) => void,
): Promise<boolean> {
  try {
    setItemState(index, { progress: 0, status: "uploading" });
    // react-doctor-disable-next-line react/async-await-in-loop, react/async-parallel
    const [{ uploadUrl, objectKey }, durationSeconds] = await Promise.all([
      getPresignedUrl({ filename: item.name, contentType: item.mimeType, purpose: "audio" }),
      getNativeAudioDuration(item.uri),
    ]);
    await uploadToR2(uploadUrl, item.uri, item.mimeType, (progress) =>
      setItemState(index, { progress, status: "uploading" }),
    );
    await createListing({
      title: item.name.replace(/\.[^.]+$/, ""),
      audioKey: objectKey,
      scholarId,
      format: "single",
      durationSeconds: durationSeconds ?? undefined,
    });
    setItemState(index, { progress: 1, status: "done" });
    return true;
  } catch (error) {
    setItemState(index, { status: "error", error: getErrorMessage(error) });
    return false;
  }
}

async function uploadAllItems(
  queue: UploadItem[],
  scholarId: string,
  setItemState: (index: number, update: Partial<UploadItem>) => void,
): Promise<boolean> {
  let anySuccess = false;
  for (let i = 0; i < queue.length; i++) {
    const item = queue[i]!;
    if (item.status === "done") continue;
    // react-doctor-disable-next-line react/async-await-in-loop, react-doctor/async-await-in-loop
    anySuccess = (await uploadSingleItem(item, i, scholarId, setItemState)) || anySuccess;
  }
  return anySuccess;
}

async function pickAudioFiles(setQueue: (items: UploadItem[]) => void): Promise<void> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ["audio/mpeg", "audio/mp4", "audio/x-m4a"],
    multiple: true,
  });
  if (result.canceled) return;
  setQueue(
    result.assets.map((asset) => ({
      name: asset.name,
      uri: asset.uri,
      mimeType: asset.mimeType ?? "audio/mpeg",
      progress: 0,
      status: "pending" as const,
    })),
  );
}

function isUploadDisabled(queueLength: number, isUploading: boolean, scholarId: string | null) {
  return queueLength === 0 || isUploading || !scholarId;
}

/** Renders the native audio uploader sheet surface and coordinates its user-facing state. */
export function AudioUploaderSheet({ isOpen, onClose, onUploadComplete }: AudioUploaderSheetProps) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { ability } = useAbility({ isAuthenticated });
  const { data: scholarsData } = useScholarsList();
  const scholars = (scholarsData?.scholars ?? []).filter((s) =>
    ability.can("upload", subject("Media", { scholarSlug: s.slug })),
  );
  const [selectedScholarId, setSelectedScholarId] = useState<string | null>(null);
  const [queue, setQueue] = useState<UploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const setItemState = useCallback((index: number, update: Partial<UploadItem>) => {
    setQueue((prev) => prev.map((item, i) => (i === index ? { ...item, ...update } : item)));
  }, []);

  const handlePick = useCallback(async () => {
    await pickAudioFiles(setQueue);
  }, []);

  const handleUploadAll = useCallback(async () => {
    if (!selectedScholarId) return;
    setIsUploading(true);
    try {
      const anySuccess = await uploadAllItems(queue, selectedScholarId, setItemState);
      if (anySuccess) onUploadComplete();
    } finally {
      setIsUploading(false);
    }
  }, [selectedScholarId, queue, setItemState, onUploadComplete]);

  const uploadDisabled = isUploadDisabled(queue.length, isUploading, selectedScholarId);

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
      <AppText variant="titleLg" style={styles.title}>
        {t("admin.audioUploader.title", "Upload Audio")}
      </AppText>

      <AppText variant="labelMd" style={styles.label}>
        {t("admin.audioUploader.assignScholar", "Assign to Scholar")}
      </AppText>
      <FlatList
        data={scholars}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scholarList}
        keyExtractor={(scholar) => scholar.id}
        renderItem={renderScholarItem}
      />

      <Button
        label={t("admin.audioUploader.selectFiles", "Select Audio Files")}
        onPress={handlePick}
        variant="outline"
        style={styles.pickBtn}
      />

      <FlatList
        data={queue}
        keyExtractor={(item) => item.name}
        style={styles.queueList}
        renderItem={renderQueueItem}
      />

      <View style={styles.buttonRow}>
        <Button
          label={t("admin.audioUploader.uploadAll", "Upload All")}
          onPress={handleUploadAll}
          loading={isUploading}
          disabled={uploadDisabled}
          style={styles.uploadBtn}
        />
        <Button
          label={t("common.cancel", "Cancel")}
          onPress={onClose}
          variant="ghost"
          style={styles.cancelBtn}
        />
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
    borderTopLeftRadius: theme.radius.scale.lg,
    borderTopRightRadius: theme.radius.scale.lg,
    padding: theme.spacing.scale.lg,
    maxHeight: "80%",
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: theme.spacing.scale.md,
    color: theme.colors.content.strong,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: theme.spacing.component.chipY,
    color: theme.colors.content.default,
  },
  scholarList: {
    marginBottom: theme.spacing.scale.md,
    maxHeight: 40,
  },
  scholarChip: {
    paddingHorizontal: theme.spacing.scale.md,
    paddingVertical: theme.spacing.component.chipY,
    borderRadius: theme.radius.scale.lg,
    backgroundColor: theme.colors.surface.subtle,
    marginEnd: theme.spacing.scale.sm,
    borderWidth: theme.border.width.default,
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
    padding: theme.spacing.scale.md,
    borderWidth: theme.border.width.default,
    borderColor: theme.colors.border.default,
    borderRadius: theme.radius.scale.sm,
    alignItems: "center",
    marginBottom: theme.spacing.scale.md,
  },
  pickBtnText: {
    fontSize: 15,
    color: theme.colors.content.default,
  },
  queueList: {
    maxHeight: 200,
  },
  queueItem: {
    marginBottom: theme.spacing.scale.sm,
  },
  queueItemName: {
    fontSize: 13,
    color: theme.colors.content.default,
  },
  progressTrack: {
    height: 4,
    backgroundColor: theme.colors.surface.subtle,
    borderRadius: theme.radius.scale.xs,
    marginTop: theme.spacing.scale.xs,
  },
  progressFill: {
    height: 4,
    borderRadius: theme.radius.scale.xs,
  },
  queueItemError: {
    fontSize: 12,
    color: theme.colors.state.danger,
  },
  buttonRow: {
    flexDirection: "row",
    gap: theme.spacing.scale.sm,
    marginTop: theme.spacing.scale.md,
  },
  uploadBtn: {
    flex: 1,
    padding: theme.spacing.scale.md,
    backgroundColor: theme.colors.action.primary,
    borderRadius: theme.radius.scale.sm,
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
    padding: theme.spacing.scale.md,
    borderWidth: theme.border.width.default,
    borderColor: theme.colors.border.default,
    borderRadius: theme.radius.scale.sm,
    alignItems: "center",
  },
  cancelBtnText: {
    color: theme.colors.content.default,
  },
}));
