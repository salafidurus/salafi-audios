import type { ContentOriginalFields, Locale, ScholarOriginalFields } from "./localization.types";

export type ScholarContentItemDto = {
  id: string;
  slug: string;
  title: string;
  type: 'collection' | 'series' | 'single';
  recencyAt: string;
  coverImageUrl?: string;
  lectureCount?: number;
  durationSeconds?: number;
  originalLanguage?: Locale;
  original?: ContentOriginalFields;
};

export type ScholarContentUnifiedDto = {
  items: ScholarContentItemDto[];
};

export type ScholarViewDto = {
  id: string;
  slug: string;
  name: string;
  bio?: string;
  isActive: boolean;
  isKibar: boolean;
};

export type ScholarDetailDto = {
  id: string;
  slug: string;
  name: string;
  bio?: string;
  country?: string;
  mainLanguage?: Locale;
  /** Language the original (untranslated) name/bio are written in. */
  originalLanguage?: Locale;
  /** Original-language fields, set only when `name`/`bio` are translated. */
  original?: ScholarOriginalFields;
  imageUrl?: string;
  isActive: boolean;
  isKibar: boolean;
  socialTwitter?: string;
  socialTelegram?: string;
  socialYoutube?: string;
  socialWebsite?: string;
  createdAt: string;
  updatedAt?: string;
};

export type ScholarStatsDto = {
  seriesCount: number;
  lecturesCount: number;
  followerCount: number;
  collectionsCount: number;
  seriesListingCount: number;
  singlesCount: number;
};

export type ScholarListItemDto = {
  id: string;
  slug: string;
  name: string;
  imageUrl?: string;
  mainLanguage?: Locale;
  originalLanguage?: Locale;
  original?: ScholarOriginalFields;
  isKibar: boolean;
  lectureCount: number;
};

export type CollectionSummaryDto = {
  id: string;
  slug: string;
  title: string;
  coverImageUrl?: string;
  lectureCount: number;
  publishedAt?: string;
  createdAt: string;
  originalLanguage?: Locale;
  original?: ContentOriginalFields;
};

export type SeriesSummaryDto = {
  id: string;
  slug: string;
  title: string;
  coverImageUrl?: string;
  lectureCount: number;
  publishedAt?: string;
  createdAt: string;
  originalLanguage?: Locale;
  original?: ContentOriginalFields;
};

/** Summary of a Single (a standalone Lecture), as shown in a scholar's Catalog. */
export type SingleSummaryDto = {
  id: string;
  slug: string;
  title: string;
  durationSeconds?: number;
  publishedAt?: string;
  originalLanguage?: Locale;
  original?: ContentOriginalFields;
};
