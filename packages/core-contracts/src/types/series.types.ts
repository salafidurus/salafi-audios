import type { StatusValue } from "../types/common.types";

export type SeriesViewDto = {
  id: string;
  scholarId: string;
  collectionId?: string;
  slug: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  publishedLectureCount?: number;
  publishedDurationSeconds?: number;
  language?: string;
  status: StatusValue;
  orderIndex?: number;
  deletedAt?: string;
  deleteAfterAt?: string;
  createdAt: string;
  updatedAt?: string;
};

export type AdminSeriesListItemDto = {
  id: string;
  title: string;
  status: StatusValue;
  publishedLectureCount: number;
  orderIndex?: number;
};

export type AdminSeriesDetailDto = {
  id: string;
  scholarId: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  language?: string;
  status: StatusValue;
  orderIndex?: number;
};

export type CreateSeriesDto = {
  scholarId: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  language?: string;
  orderIndex?: number;
};

export type UpdateSeriesDto = {
  title?: string;
  description?: string;
  coverImageUrl?: string;
  language?: string;
  orderIndex?: number;
};
