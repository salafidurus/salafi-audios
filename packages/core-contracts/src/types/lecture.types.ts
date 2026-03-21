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
