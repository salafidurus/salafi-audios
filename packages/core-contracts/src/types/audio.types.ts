export type StreamResponseDto = {
  url: string;
  durationSeconds: number;
  format?: string | null;
};

export type AudioProgressDto = {
  lectureId: string;
  positionSeconds: number;
  durationSeconds: number;
  completedAt?: string;
  updatedAt: string;
};

export type ProgressSyncItemDto = {
  lectureId: string;
  positionSeconds: number;
  durationSeconds: number;
  completedAt?: string;
  updatedAt: string;
};

export type ProgressSyncDto = {
  items: ProgressSyncItemDto[];
};
