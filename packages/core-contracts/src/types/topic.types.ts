import type { StatusValue } from "../types/common.types";
import type { ContentOriginalFields, Locale } from "./localization.types";

export type TopicSlug = string;

export type TopicViewDto = {
  id: string;
  slug: TopicSlug;
  name: string;
  parentId?: string;
  createdAt: string;
};

export type TopicDetailDto = {
  id: string;
  slug: TopicSlug;
  name: string;
  parentId?: string;
  createdAt: string;
};

export type TopicLectureViewDto = {
  id: string;
  scholarId: string;
  seriesId?: string;
  slug: string;
  title: string;
  description?: string;
  language?: Locale;
  originalLanguage?: Locale;
  original?: ContentOriginalFields;
  status: StatusValue;
  publishedAt?: string;
  durationSeconds?: number;
};
