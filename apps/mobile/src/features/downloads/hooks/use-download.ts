import { useCallback, useMemo } from "react";
import { useDownloadsStore } from "../store/downloads.store";
import type { DownloadStatus } from "../types";

export function useDownload(lectureId: string) {
  const download = useDownloadsStore((s) => s.downloads[lectureId]);
  const actions = useDownloadsStore((s) => s.actions);

  const status: DownloadStatus = download?.status ?? "idle";
  const progress = download?.progress ?? 0;
  const localUri = download?.localUri;
  const isDownloaded = status === "complete";
  const isDownloading = status === "downloading" || status === "pending";

  const startDownload = useCallback(() => {
    actions.startDownload(lectureId);
    // Actual download engine call would be triggered here
  }, [lectureId, actions]);

  const removeDownload = useCallback(() => {
    actions.removeDownload(lectureId);
  }, [lectureId, actions]);

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
