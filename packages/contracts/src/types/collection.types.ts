import type { StatusValue } from "./common.types";

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
