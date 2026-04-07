export type DownloadStatus = "idle" | "pending" | "downloading" | "complete" | "error";

export type DownloadItem = {
  lectureId: string;
  status: DownloadStatus;
  localUri?: string;
  progress: number; // 0-100
  error?: string;
  startedAt?: number;
  completedAt?: number;
};

export type OutboxEntry = {
  id: string;
  type: string;
  payload: unknown;
  createdAt: number;
  retries: number;
};
