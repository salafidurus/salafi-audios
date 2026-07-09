import { z } from "zod";
import { StatusValueSchema } from "./common.types";
import { ContentOriginalFieldsSchema, LocaleSchema } from "./localization.types";

export const TopicSlugSchema = z.string();
export type TopicSlug = z.infer<typeof TopicSlugSchema>;

export const TopicViewDtoSchema = z.object({
  id: z.string(),
  slug: TopicSlugSchema,
  name: z.string(),
  parentId: z.string().optional(),
  createdAt: z.string(),
});
export type TopicViewDto = z.infer<typeof TopicViewDtoSchema>;

export const TopicDetailDtoSchema = z.object({
  id: z.string(),
  slug: TopicSlugSchema,
  name: z.string(),
  parentId: z.string().optional(),
  createdAt: z.string(),
});
export type TopicDetailDto = z.infer<typeof TopicDetailDtoSchema>;

export const TopicLectureViewDtoSchema = z.object({
  id: z.string(),
  scholarId: z.string(),
  seriesId: z.string().optional(),
  slug: z.string(),
  title: z.string(),
  description: z.string().optional(),
  language: LocaleSchema.optional(),
  originalLanguage: LocaleSchema.optional(),
  original: ContentOriginalFieldsSchema.optional(),
  status: StatusValueSchema,
  publishedAt: z.string().optional(),
  durationSeconds: z.number().optional(),
});
export type TopicLectureViewDto = z.infer<typeof TopicLectureViewDtoSchema>;

export const UpsertTopicDtoSchema = z.object({
  slug: z.string().min(1, "Slug must not be empty"),
  name: z.string().min(1, "Name must not be empty"),
  parentSlug: z.string().optional(),
  translations: z
    .record(
      LocaleSchema,
      z.object({
        name: z.string().optional(),
      }),
    )
    .optional(),
});
export type UpsertTopicDto = z.infer<typeof UpsertTopicDtoSchema>;

export const SaveTopicTranslationDtoSchema = z.object({
  locale: LocaleSchema,
  name: z.string().min(1, "Name must not be empty"),
});
export type SaveTopicTranslationDto = z.infer<typeof SaveTopicTranslationDtoSchema>;

export const UpdateTopicTranslationDtoSchema = z.object({
  name: z.string().optional(),
});
export type UpdateTopicTranslationDto = z.infer<typeof UpdateTopicTranslationDtoSchema>;
