import type { StatusValue } from "../types/common.types";

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
  language?: string;
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
