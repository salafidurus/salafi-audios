import { Status } from "@sd/db";
import { z } from "zod";

export const topicSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  parentSlug: z.string().min(1).optional(),
});

export const audioAssetSchema = z.object({
  url: z.string().url().optional(),
  file: z.string().min(1).optional(),
  format: z.string().min(1).optional(),
  bitrateKbps: z.number().int().positive().optional(),
  sizeBytes: z.number().int().nonnegative().optional(),
  durationSeconds: z.number().int().positive().optional(),
  source: z.string().min(1).optional(),
  isPrimary: z.boolean().optional(),
});

export const lectureSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  language: z.string().optional(),
  status: z.nativeEnum(Status).default(Status.draft),
  publishedAt: z.string().datetime().optional(),
  orderIndex: z.number().int().optional(),
  durationSeconds: z.number().int().positive().optional(),
  deletedAt: z.string().datetime().optional(),
  deleteAfterAt: z.string().datetime().optional(),
  topicSlugs: z.array(z.string().min(1)).default([]),
  audioAssets: z.array(audioAssetSchema).default([]),
});

export const seriesSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  coverImageUrl: z.string().url().optional(),
  language: z.string().optional(),
  status: z.nativeEnum(Status).default(Status.draft),
  orderIndex: z.number().int().optional(),
  deletedAt: z.string().datetime().optional(),
  deleteAfterAt: z.string().datetime().optional(),
  topicSlugs: z.array(z.string().min(1)).default([]),
  lectures: z.array(lectureSchema).default([]),
});

export const collectionSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  coverImageUrl: z.string().url().optional(),
  language: z.string().optional(),
  status: z.nativeEnum(Status).default(Status.draft),
  orderIndex: z.number().int().optional(),
  deletedAt: z.string().datetime().optional(),
  deleteAfterAt: z.string().datetime().optional(),
  topicSlugs: z.array(z.string().min(1)).default([]),
  series: z.array(seriesSchema).default([]),
});

export const scholarSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  bio: z.string().optional(),
  country: z.string().optional(),
  mainLanguage: z.string().optional(),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean().default(true),
  collections: z.array(collectionSchema).default([]),
  series: z.array(seriesSchema).default([]),
  lectures: z.array(lectureSchema).default([]),
});

export const contentSchema = z.object({
  version: z.literal(1),
  topics: z.array(topicSchema).default([]),
  scholars: z.array(scholarSchema).min(1),
});

export type ContentDefinition = z.infer<typeof contentSchema>;
export type TopicDef = z.infer<typeof topicSchema>;
export type LectureDef = z.infer<typeof lectureSchema>;

export function parseContentDefinition(input: unknown): ContentDefinition {
  return contentSchema.parse(input);
}
