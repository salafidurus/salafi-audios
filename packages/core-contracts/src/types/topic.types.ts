import { z } from "zod";

import { StatusValueSchema } from "./common.types";
import { ContentOriginalFieldsSchema, LocaleSchema } from "./localization.types";
import { TranslationViewDtoSchema } from "./translation.types";

/** Public and administrative topic DTOs, translations, and nested lecture contracts. */
/** Defines the runtime contract value for topic slug schema. */
export const TopicSlugSchema = z.string();
/** Defines the contract type for topic slug. */
export type TopicSlug = z.infer<typeof TopicSlugSchema>;

/** Defines the runtime contract value for topic name schema. */
export const TopicNameSchema = z.object({
  ar: z.string().min(1, "Arabic name is required"),
  en: z.string().optional(),
});
/** Defines the contract type for topic name. */
export type TopicName = z.infer<typeof TopicNameSchema>;

/** Defines the runtime contract value for topic view dto schema. */
export const TopicViewDtoSchema = z.object({
  id: z.string(),
  slug: TopicSlugSchema,
  name: TopicNameSchema,
  orderIndex: z.number().default(99),
  createdAt: z.string(),
});
/** Defines the contract type for topic view dto. */
export type TopicViewDto = z.infer<typeof TopicViewDtoSchema>;

/** Defines the runtime contract value for topic detail dto schema. */
export const TopicDetailDtoSchema = z.object({
  id: z.string(),
  slug: TopicSlugSchema,
  name: TopicNameSchema,
  orderIndex: z.number().default(99),
  createdAt: z.string(),
});
/** Defines the contract type for topic detail dto. */
export type TopicDetailDto = z.infer<typeof TopicDetailDtoSchema>;

/** Defines the runtime contract value for topic lecture view dto schema. */
export const TopicLectureViewDtoSchema = z.object({
  id: z.string(),
  scholarId: z.string(),
  scholarSlug: z.string().optional(),
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
/** Defines the contract type for topic lecture view dto. */
export type TopicLectureViewDto = z.infer<typeof TopicLectureViewDtoSchema>;

/** Defines the runtime contract value for save topic translation dto schema. */
export const SaveTopicTranslationDtoSchema = z.object({
  locale: LocaleSchema,
  name: z.string().min(1, "Name must not be empty"),
});
/** Defines the contract type for save topic translation dto. */
export type SaveTopicTranslationDto = z.infer<typeof SaveTopicTranslationDtoSchema>;

/** Defines the runtime contract value for update topic translation dto schema. */
export const UpdateTopicTranslationDtoSchema = z.object({
  name: z.string().optional(),
});
/** Defines the contract type for update topic translation dto. */
export type UpdateTopicTranslationDto = z.infer<typeof UpdateTopicTranslationDtoSchema>;

/** Defines the runtime contract value for admin topic detail dto schema. */
export const AdminTopicDetailDtoSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: TopicNameSchema,
  orderIndex: z.number().default(99),
  createdAt: z.string(),
  translations: z.array(TranslationViewDtoSchema),
});
/** Defines the contract type for admin topic detail dto. */
export type AdminTopicDetailDto = z.infer<typeof AdminTopicDetailDtoSchema>;

/** Defines the runtime contract value for create topic with translations dto schema. */
export const CreateTopicWithTranslationsDtoSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
  name: z.object({
    ar: z.string().min(1, "Arabic name is required"),
  }),
  orderIndex: z.number().optional(),
});
/** Defines the contract type for create topic with translations dto. */
export type CreateTopicWithTranslationsDto = z.infer<typeof CreateTopicWithTranslationsDtoSchema>;

/** Defines the runtime contract value for update topic with translations dto schema. */
export const UpdateTopicWithTranslationsDtoSchema = z.object({
  name: z.object({
    ar: z.string().min(1, "Arabic name is required"),
  }),
  orderIndex: z.number().optional(),
});
/** Defines the contract type for update topic with translations dto. */
export type UpdateTopicWithTranslationsDto = z.infer<typeof UpdateTopicWithTranslationsDtoSchema>;
