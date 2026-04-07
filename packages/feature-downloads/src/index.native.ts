// feature-downloads is native-only (no web downloads)
export type { DownloadStatus, DownloadItem, OutboxEntry } from "./types";
export { useDownloadsStore } from "./store/downloads.store";
export { useDownload } from "./hooks/use-download";
export { downloadLecture, getLocalAudioUri } from "./engine/download.engine.native";
export { useOutboxStore } from "./outbox/outbox.store";
export { drainOutbox, enqueueOutboxMutation } from "./outbox/outbox.drain";
export { DownloadButtonNative } from "./components/download-button/download-button.native";
export { DownloadProgressNative } from "./components/download-progress/download-progress.native";
