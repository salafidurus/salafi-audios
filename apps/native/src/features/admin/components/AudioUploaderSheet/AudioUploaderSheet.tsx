import { subject } from "@casl/ability";
import { BottomSheet, Column, Row, ScrollView } from "@expo/ui";
import { useAbility } from "@sd/domain-account";
import { useScholarsList } from "@sd/domain-content";
import * as DocumentPicker from "expo-document-picker";
import { useCallback, useState } from "react";
import { useUnistyles } from "react-native-unistyles";

import { useAuth } from "@/core/auth/use-auth";
import { useTranslation } from "@/core/i18n/use-translation";
import { NativeButton, NativeProgress, NativeText } from "@/shared/ui";

import { createListing, getPresignedUrl, uploadToR2 } from "../../api/admin-listings.api";

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
  const { theme } = useUnistyles();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { ability } = useAbility({ isAuthenticated });
  const { data: scholarsData } = useScholarsList();
  const scholars = (scholarsData?.scholars ?? []).filter((scholar) =>
    ability.can("upload", subject("Media", { scholarSlug: scholar.slug })),
  );
  const [selectedScholarId, setSelectedScholarId] = useState<string | null>(null);
  const [queue, setQueue] = useState<UploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const setItemState = useCallback((index: number, update: Partial<UploadItem>) => {
    setQueue((previous) =>
      previous.map((item, itemIndex) => (itemIndex === index ? { ...item, ...update } : item)),
    );
  }, []);

  const handlePick = useCallback(async () => {
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
  }, []);

  const handleUploadAll = useCallback(async () => {
    if (!selectedScholarId) return;

    setIsUploading(true);
    let anySuccess = false;
    try {
      for (let index = 0; index < queue.length; index++) {
        const item = queue[index]!;
        if (item.status === "done") continue;

        try {
          setItemState(index, { progress: 0, status: "uploading" });
          // react-doctor-disable-next-line react-doctor/async-await-in-loop, react-doctor/async-parallel
          const [{ uploadUrl, objectKey }, durationSeconds] = await Promise.all([
            getPresignedUrl({
              filename: item.name,
              contentType: item.mimeType,
              purpose: "audio",
            }),
            getNativeAudioDuration(item.uri),
          ]);
          await uploadToR2(uploadUrl, item.uri, item.mimeType, (progress) =>
            setItemState(index, { progress, status: "uploading" }),
          );
          await createListing({
            title: item.name.replace(/\.[^.]+$/, ""),
            audioKey: objectKey,
            scholarId: selectedScholarId,
            format: "single",
            ...(durationSeconds != null ? { durationSeconds } : {}),
          });
          setItemState(index, { progress: 1, status: "done" });
          anySuccess = true;
        } catch (error) {
          setItemState(index, { status: "error", error: (error as Error).message });
        }
      }
    } finally {
      setIsUploading(false);
      if (anySuccess) onUploadComplete();
    }
  }, [onUploadComplete, queue, selectedScholarId, setItemState]);

  const isUploadDisabled = queue.length === 0 || isUploading || !selectedScholarId;

  return (
    <BottomSheet
      isPresented={isOpen}
      onDismiss={onClose}
      showDragIndicator
      snapPoints={["full"]}
      testID="audio-uploader-sheet"
    >
      <ScrollView showsIndicators={false}>
        <Column
          spacing={theme.spacing.component.gapLg}
          style={{ padding: theme.spacing.component.panelPadding }}
        >
          <Column spacing={theme.spacing.scale.xs}>
            <NativeText variant="titleLg" colorRole="strong">
              {t("admin.audioUploader.title", "Upload Audio")}
            </NativeText>
            <NativeText variant="bodySm" colorRole="muted">
              Choose a scholar, add audio files, then upload them as new listings.
            </NativeText>
          </Column>

          <Column spacing={theme.spacing.component.gapSm}>
            <NativeText variant="labelMd" colorRole="strong">
              {t("admin.audioUploader.assignScholar", "Assign to Scholar")}
            </NativeText>
            <Column spacing={theme.spacing.scale.sm}>
              {scholars.map((scholar) => (
                <NativeButton
                  key={scholar.id}
                  label={scholar.name}
                  variant={selectedScholarId === scholar.id ? "primary" : "outline"}
                  onPress={() => setSelectedScholarId(scholar.id)}
                  testID={`audio-uploader-scholar-${scholar.id}`}
                />
              ))}
            </Column>
          </Column>

          <NativeButton
            label={t("admin.audioUploader.selectFiles", "Select Audio Files")}
            icon="add"
            variant="outline"
            onPress={() => void handlePick()}
            testID="audio-uploader-select-files"
          />

          <Column spacing={theme.spacing.component.gapSm}>
            <NativeText variant="labelMd" colorRole="strong">
              Upload queue
            </NativeText>
            {queue.length === 0 ? (
              <NativeText variant="bodySm" colorRole="muted">
                No audio files selected yet.
              </NativeText>
            ) : (
              queue.map((item) => (
                <Column
                  key={`${item.uri}-${item.name}`}
                  spacing={theme.spacing.scale.sm}
                  style={{
                    padding: theme.spacing.component.cardPadding,
                    borderRadius: theme.radius.component.card,
                    backgroundColor: theme.colors.surface.subtle,
                    borderWidth: theme.border.width.default,
                    borderColor:
                      item.status === "error"
                        ? theme.colors.state.dangerBorder
                        : theme.colors.border.subtle,
                  }}
                >
                  <NativeText variant="bodyMd" colorRole="strong">
                    {item.name}
                  </NativeText>
                  <NativeProgress value={item.progress} variant="linear" />
                  <NativeText
                    variant="bodySm"
                    colorRole={item.status === "error" ? "danger" : "muted"}
                  >
                    {item.status === "error"
                      ? (item.error ?? "Upload failed.")
                      : item.status === "done"
                        ? "Uploaded"
                        : item.status === "uploading"
                          ? "Uploading…"
                          : "Ready to upload"}
                  </NativeText>
                </Column>
              ))
            )}
          </Column>

          <Row alignment="end" spacing={theme.spacing.component.gapSm}>
            <NativeButton label={t("common.cancel", "Cancel")} variant="ghost" onPress={onClose} />
            <NativeButton
              label={t("admin.audioUploader.uploadAll", "Upload All")}
              icon="success"
              loading={isUploading}
              disabled={isUploadDisabled}
              onPress={() => void handleUploadAll()}
            />
          </Row>
        </Column>
      </ScrollView>
    </BottomSheet>
  );
}
