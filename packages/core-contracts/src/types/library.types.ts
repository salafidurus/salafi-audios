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
