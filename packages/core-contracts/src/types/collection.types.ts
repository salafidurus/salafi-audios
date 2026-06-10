import type { StatusValue } from "../types/common.types";

export type CollectionViewDto = {
  id: string;
  scholarId: string;
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

export type AdminCollectionListItemDto = {
  id: string;
  title: string;
  status: StatusValue;
  publishedLectureCount: number;
  orderIndex?: number;
};

export type AdminCollectionDetailDto = {
  id: string;
  scholarId: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  language?: string;
  status: StatusValue;
  orderIndex?: number;
};

export type CreateCollectionDto = {
  scholarId: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  language?: string;
  orderIndex?: number;
};

export type UpdateCollectionDto = {
  title?: string;
  description?: string;
  coverImageUrl?: string;
  language?: string;
  orderIndex?: number;
};
