import type { Locale } from "./localization.types";

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
  originalLanguage?: Locale;
  /** Original-language lecture title, set only when `lectureTitle` is translated. */
  originalLectureTitle?: string;
};

export type LibraryPageDto = {
  items: LibraryItemDto[];
  nextCursor?: string;
  hasMore: boolean;
};

export type SavedSyncDto = {
  lectureIds: string[];
};
