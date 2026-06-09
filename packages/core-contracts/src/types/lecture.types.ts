import type { StatusValue } from "../types/common.types";
import type { Locale } from "./localization.types";

export type AudioAssetViewDto = {
  id: string;
  lectureId: string;
  url: string;
  format?: string;
  sizeBytes?: number;
  durationSeconds?: number;
  bitrateKbps?: number;
  source?: string;
  isPrimary?: boolean;
  createdAt: string;
};

export type LectureViewDto = {
  id: string;
  scholarId: string;
  seriesId?: string;
  slug: string;
  title: string;
  description?: string;
  language?: Locale;
  status: StatusValue;
  publishedAt?: string;
  orderIndex?: number;
  durationSeconds?: number;
  primaryAudioAsset?: AudioAssetViewDto;
  deletedAt?: string;
  deleteAfterAt?: string;
  createdAt: string;
  updatedAt?: string;
};

export type ScholarRefDto = {
  id: string;
  slug: string;
  name: string;
  imageUrl?: string;
};

export type TopicRefDto = {
  id: string;
  slug: string;
  name: string;
};

export type AudioAssetDto = {
  id: string;
  url: string;
  format?: string;
  bitrateKbps?: number;
  durationSeconds?: number;
};

export type LectureRefDto = {
  id: string;
  slug: string;
  title: string;
};

export type SeriesContextDto = {
  seriesId: string;
  seriesTitle: string;
  seriesSlug: string;
  prevLecture: LectureRefDto | null;
  nextLecture: LectureRefDto | null;
};

export type LectureDetailDto = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  language?: string;
  durationSeconds?: number;
  publishedAt?: string;
  scholar: ScholarRefDto;
  topics: TopicRefDto[];
  primaryAudioAsset: AudioAssetDto | null;
  seriesContext: SeriesContextDto | null;
};

export type RelatedLectureDto = {
  id: string;
  slug: string;
  title: string;
  durationSeconds?: number;
  scholar: ScholarRefDto;
  primaryAudioAsset: AudioAssetDto | null;
};

export type AdminLectureUpdateDto = {
  title?: string;
  description?: string;
  language?: Locale;
  orderIndex?: number;
  status?: StatusValue;
};

export type AdminLectureActionDto = {
  success: boolean;
  message: string;
};

export type CreateLectureDto = {
  title: string;
  slug?: string;
  scholarId?: string;
  seriesId?: string;
  topics?: string[];
  audioKey: string;
  format?: string;
  durationSeconds?: number;
  sizeBytes?: number;
};

export type AdminLectureListItemDto = {
  id: string;
  title: string;
  scholarName: string;
  status: StatusValue;
  durationSeconds?: number;
  orderIndex?: number;
  createdAt: string;
};

export type AdminLectureListDto = {
  items: AdminLectureListItemDto[];
  total: number;
  page: number;
};

export type AdminLectureDetailDto = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  language?: string;
  status: StatusValue;
  orderIndex?: number;
  durationSeconds?: number;
  scholarId: string;
  scholarName: string;
  seriesId?: string;
  topics: string[];
  audioKey?: string;
  audioUrl?: string;
  createdAt: string;
  updatedAt?: string;
};

export type BulkActionDto = {
  action: "publish" | "archive";
  ids: string[];
};

export type BulkActionResultDto = {
  succeeded: string[];
  failed: string[];
};
