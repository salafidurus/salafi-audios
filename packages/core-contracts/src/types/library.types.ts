export type LibraryItemDto = {
  id: string;
  lectureId: string;
  lectureTitle: string;
  lectureSlug: string;
  scholarId: string;
  scholarSlug: string;
  scholarName: string;
  seriesTitle?: string;
  durationSeconds?: number;
  savedAt?: string;
  completedAt?: string;
  progressSeconds?: number;
};

export type LibraryPageDto = {
  items: LibraryItemDto[];
  nextCursor?: string;
  hasMore: boolean;
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

export type SavedSyncDto = {
  lectureIds: string[];
};
