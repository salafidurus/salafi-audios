import { useCallback, useMemo } from "react";

import { downloadLecture, removeLecture } from "@/features/downloads/engine/download.engine";
import { useDownloadsStore } from "@/features/downloads/store/downloads.store";

/** UI-only status — "idle" means no registry row exists yet for this listing. */
/** Describes the UiDownloadStatus native contract and behavior. */
export type UiDownloadStatus = "idle" | "pending" | "downloading" | "paused" | "complete" | "error";

/** Describes the useDownload native contract and behavior. */
export function useDownload(listingSlug: string, audioUrl?: string) {
  const row = useDownloadsStore((s) => s.downloads[listingSlug]);

  const status = getDownloadStatus(row);
  const progress = getDownloadProgress(row);
  const localUri = row?.localUri ?? undefined;
  const isDownloaded = status === "complete";
  const isDownloading = status === "downloading" || status === "pending";

  const startDownload = useCallback(() => {
    if (!audioUrl) return;
    void downloadLecture(listingSlug, audioUrl);
  }, [listingSlug, audioUrl]);

  const removeDownload = useCallback(() => {
    void removeLecture(listingSlug);
  }, [listingSlug]);

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

function getDownloadStatus(
  row: ReturnType<typeof useDownloadsStore.getState>["downloads"][string] | undefined,
): UiDownloadStatus {
  return row?.status ?? "idle";
}

function getDownloadProgress(
  row: ReturnType<typeof useDownloadsStore.getState>["downloads"][string] | undefined,
): number {
  return row && row.bytesTotal > 0 ? (row.bytesDownloaded / row.bytesTotal) * 100 : 0;
}
