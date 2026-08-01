/**
 * Type definitions for seed data structures.
 * These are lightweight helper types for organizing seed data.
 * Database operations use Prisma's generated types.
 */

/**
 * Seed data for a single standalone lecture.
 * Uses array indices (scholarIdx, topicIdx) instead of IDs for convenience.
 */
export interface SingleSeed {
  id: number;
  scholarIdx: number;
  slug: string;
  title: string;
  titleEn?: string;
  desc?: string;
  descEn?: string;
  topicIdx: number;
  durationMin: number;
  audioUrl: string;
  objectKey?: string;
  audioFormat?: string;
  sizeBytes?: number;
  audioSource?: string;
  language?: string;
}

/**
 * A single lesson within a series
 */
export interface SeriesLessonSeed {
  id: number;
  title: string;
  titleEn?: string;
  slug: string;
  audioUrl: string;
  objectKey?: string;
  audioFormat?: string;
  sizeBytes?: number;
  audioSource?: string;
  language?: string;
}

/**
 * Seed data for a series (parent with multiple lessons)
 */
export interface SeriesSeed {
  id: number;
  scholarIdx: number;
  slug: string;
  title: string;
  titleEn?: string;
  desc?: string;
  descEn?: string;
  topicIdx: number;
  lessonDurationMin: number;
  lessons: SeriesLessonSeed[];
  language?: string;
}

/**
 * A single lesson within a collection module
 */
export interface ModuleLessonSeed {
  id: number;
  title: string;
  titleEn?: string;
  slug: string;
  audioUrl: string;
  objectKey?: string;
  audioFormat?: string;
  sizeBytes?: number;
  audioSource?: string;
  language?: string;
}

/**
 * A module (sub-series) within a collection
 */
export interface ModuleSeed {
  id: number;
  title: string;
  titleEn?: string;
  desc?: string;
  descEn?: string;
  lessons: ModuleLessonSeed[];
  language?: string;
}

/**
 * Seed data for a collection (parent with modules, each module has lessons)
 */
export interface CollectionSeed {
  id: number;
  scholarIdx: number;
  slug: string;
  title: string;
  titleEn?: string;
  desc?: string;
  descEn?: string;
  topicIdx: number;
  lessonDurationMin: number;
  modules: ModuleSeed[];
  language?: string;
}

/**
 * Helper type for linking listings to topics
 */
export interface TopicPair {
  listingId: string;
  topicId: string;
}
