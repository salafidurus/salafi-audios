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
  desc: string;
  topicIdx: number;
  durationMin: number;
}

/**
 * A single lesson within a series
 */
export interface SeriesLessonSeed {
  id: number;
  slug: string;
}

/**
 * Seed data for a series (parent with multiple lessons)
 */
export interface SeriesSeed {
  id: number;
  scholarIdx: number;
  slug: string;
  title: string;
  desc: string;
  topicIdx: number;
  lessonDurationMin: number;
  lessons: SeriesLessonSeed[];
}

/**
 * A module (sub-series) within a collection
 */
export interface ModuleSeed {
  id: number;
  title: string;
  desc: string;
  lessonCount: number;
}

/**
 * Seed data for a collection (parent with modules, each module has lessons)
 */
export interface CollectionSeed {
  id: number;
  scholarIdx: number;
  slug: string;
  title: string;
  desc: string;
  topicIdx: number;
  lessonDurationMin: number;
  modules: ModuleSeed[];
}

/**
 * Helper type for linking listings to topics
 */
export interface TopicPair {
  listingId: string;
  topicId: string;
}
