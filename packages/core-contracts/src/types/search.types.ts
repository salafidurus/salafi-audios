import type { TopicSlug } from "../types/topic.types";

export type SearchCatalogParams = {
  q: string;
  limit?: number;
  language?: string;
  topicSlug?: string;
  topicSlugs?: TopicSlug[];
  scholarSlug?: string;
};

export type SearchCatalogItemDto = {
  id: string;
  slug: string;
  title: string;
  scholarName: string;
  scholarSlug: string;
  coverImageUrl?: string;
  scholarImageUrl?: string;
  lectureCount: number;
  durationSeconds?: number;
};

export type SearchCatalogResultsDto = {
  collections: SearchCatalogItemDto[];
  series: SearchCatalogItemDto[];
  lectures: SearchCatalogItemDto[];
};
