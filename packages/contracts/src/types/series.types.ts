import type { StatusValue } from "@/types/common.types";

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
