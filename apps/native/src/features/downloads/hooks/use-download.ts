import { useCallback, useMemo } from "react";

import { downloadLecture, removeLecture } from "@/features/downloads/engine/download.engine";
import { useDownloadsStore } from "@/features/downloads/store/downloads.store";

/** UI-only status — "idle" means no registry row exists yet for this listing. */
export type UiDownloadStatus = "idle" | "pending" | "downloading" | "paused" | "complete" | "error";

export function useDownload(lectureId: string, audioUrl?: string) {
  const row = useDownloadsStore((s) => s.downloads[lectureId]);

  const status: UiDownloadStatus = row?.status ?? "idle";
  const progress = row && row.bytesTotal > 0 ? (row.bytesDownloaded / row.bytesTotal) * 100 : 0;
  const localUri = row?.localUri ?? undefined;
  const isDownloaded = status === "complete";
  const isDownloading = status === "downloading" || status === "pending";

  const startDownload = useCallback(() => {
    if (!audioUrl) return;
    void downloadLecture(lectureId, audioUrl);
  }, [lectureId, audioUrl]);

  const removeDownload = useCallback(() => {
    void removeLecture(lectureId);
  }, [lectureId]);

  return useMemo(
    () => ({
      status,
      progress,
      localUri,
      isDownloaded,
      isDownloading,
      startDownload,
      removeDownload,
    }),
    [status, progress, localUri, isDownloaded, isDownloading, startDownload, removeDownload],
  );
}
