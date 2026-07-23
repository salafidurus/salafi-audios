import { z } from "zod";
import { StatusValueSchema } from "./common.types";
import { ContentOriginalFieldsSchema, LocaleSchema } from "./localization.types";
import { TranslationViewDtoSchema } from "./translation.types";

export const TopicSlugSchema = z.string();
export type TopicSlug = z.infer<typeof TopicSlugSchema>;

export const TopicNameSchema = z.object({
  en: z.string().min(1, "English name is required"),
  ar: z.string().optional(),
});
export type TopicName = z.infer<typeof TopicNameSchema>;

export const TopicViewDtoSchema = z.object({
  id: z.string(),
  slug: TopicSlugSchema,
  name: TopicNameSchema,
  createdAt: z.string(),
});
export type TopicViewDto = z.infer<typeof TopicViewDtoSchema>;

export const TopicDetailDtoSchema = z.object({
  id: z.string(),
  slug: TopicSlugSchema,
  name: TopicNameSchema,
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

export const SaveTopicTranslationDtoSchema = z.object({
  locale: LocaleSchema,
  name: z.string().min(1, "Name must not be empty"),
});
export type SaveTopicTranslationDto = z.infer<typeof SaveTopicTranslationDtoSchema>;

export const UpdateTopicTranslationDtoSchema = z.object({
  name: z.string().optional(),
});
export type UpdateTopicTranslationDto = z.infer<typeof UpdateTopicTranslationDtoSchema>;

export const AdminTopicDetailDtoSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: TopicNameSchema,
  createdAt: z.string(),
  translations: z.array(TranslationViewDtoSchema),
});
export type AdminTopicDetailDto = z.infer<typeof AdminTopicDetailDtoSchema>;

export const CreateTopicWithTranslationsDtoSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
  name: z.object({
    en: z.string().min(1, "English name is required"),
  }),
  translations: z
    .array(
      z.object({
        locale: LocaleSchema,
        name: z.string(),
      }),
    )
    .optional(),
});
export type CreateTopicWithTranslationsDto = z.infer<typeof CreateTopicWithTranslationsDtoSchema>;

export const UpdateTopicWithTranslationsDtoSchema = z.object({
  name: z.object({
    en: z.string().min(1, "English name is required"),
  }),
  translations: z.array(
    z.object({
      locale: LocaleSchema,
      name: z.string(),
    }),
  ),
});
export type UpdateTopicWithTranslationsDto = z.infer<typeof UpdateTopicWithTranslationsDtoSchema>;
