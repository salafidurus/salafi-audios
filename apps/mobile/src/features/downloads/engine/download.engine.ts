import { httpClient, endpoints } from "@sd/core-contracts";
import { useDownloadsStore } from "../store/downloads.store";

/**
 * Native download engine stub.
 *
 * Full implementation requires expo-file-system for streaming
 * downloads to local storage. This provides the interface contract.
 */

export async function downloadLecture(lectureId: string, audioUrl: string): Promise<void> {
  const { actions } = useDownloadsStore.getState();
  actions.startDownload(lectureId);

  try {
    // In production: use expo-file-system to download
    // const localUri = FileSystem.documentDirectory + `lectures/${lectureId}.mp3`;
    // const downloadResumable = FileSystem.createDownloadResumable(
    //   audioUrl, localUri, {},
    //   (progress) => {
    //     const pct = (progress.totalBytesWritten / progress.totalBytesExpectedToWrite) * 100;
    //     actions.setProgress(lectureId, pct);
    //   }
    // );
    // const result = await downloadResumable.downloadAsync();

    // Stub: simulate download completion
    actions.setProgress(lectureId, 50);

    // Get presigned URL if needed
    const _presignedUrl = audioUrl || endpoints.lectures.detail(lectureId);

    // Mark complete (in production, use actual file URI)
    const localUri = `file:///lectures/${lectureId}.mp3`;
    actions.setComplete(lectureId, localUri);
  } catch (err) {
    actions.setError(lectureId, err instanceof Error ? err.message : "Download failed");
  }
}

/**
 * Get local file URI for a downloaded lecture,
 * or undefined if not downloaded. Used by domain-playback
 * to prefer local files over streaming.
 */
export function getLocalAudioUri(lectureId: string): string | undefined {
  const dl = useDownloadsStore.getState().actions.getDownload(lectureId);
  return dl?.status === "complete" ? dl.localUri : undefined;
}
